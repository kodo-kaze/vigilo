#!/usr/bin/env python3
import argparse
import asyncio
from contextlib import asynccontextmanager
import socket
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import uvicorn

from config import (
    DEFAULT_SOURCE,
    DEFAULT_HOST,
    DEFAULT_PORT,
    DEFAULT_CONF,
    DEFAULT_IOU,
    DEFAULT_STRIDE,
    DEFAULT_SMOOTH,
    DEFAULT_ZONE
)
from stream import CrowdStreamBroadcaster

# Global broadcaster instance
broadcaster: Optional[CrowdStreamBroadcaster] = None


class CleanStreamingResponse(StreamingResponse):
    """
    Subclass of Starlette StreamingResponse that cleanly suppresses
    asyncio.CancelledError during server shutdown or client disconnection,
    preventing noisy ASGI application exception tracebacks in the terminal.
    """
    async def __call__(self, scope, receive, send) -> None:
        try:
            await super().__call__(scope, receive, send)
        except (asyncio.CancelledError, GeneratorExit):
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    global broadcaster
    yield
    # Shutdown: Cleanly release camera resources
    if broadcaster:
        print("[Shutdown] Releasing camera and worker threads...")
        broadcaster.stop()


app = FastAPI(
    title="Vigilo Crowd Intelligence & CCTV Stream Server",
    description="Real-time Pedestrian Density Tracking, YOLO Vision, and Telemetry API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DEFAULT_HARDWARE_INTERFACES: List[Dict[str, Any]] = [
    {
        "id": "webcam-0",
        "name": "Integrated HD Camera (Index 0)",
        "type": "webcam",
        "source": "0",
        "zone": "Terminal Concourse 04 • Zone B",
        "description": "Default integrated optical sensor (hardware index 0)",
    },
    {
        "id": "webcam-1",
        "name": "External USB Camera (Index 1)",
        "type": "webcam",
        "source": "1",
        "zone": "Peripheral Ingest • Zone Auxiliary",
        "description": "Secondary USB peripheral optical ingestion (hardware index 1)",
    },
]

DEFAULT_PRESETS: List[Dict[str, Any]] = [
    {
        "id": "cctv-concourse-a",
        "name": "Concourse A — Turnstiles",
        "type": "ip_camera",
        "ip": "192.168.1.101",
        "port": 554,
        "protocol": "rtsp",
        "path": "/live",
        "source": "rtsp://192.168.1.101:554/live",
        "zone": "Terminal Concourse 04 • Gate South",
        "description": "High-throughput turnstile bottleneck monitoring",
    },
    {
        "id": "cctv-concourse-b",
        "name": "Concourse B — Main Escalator Gate",
        "type": "ip_camera",
        "ip": "192.168.1.102",
        "port": 554,
        "protocol": "rtsp",
        "path": "/live",
        "source": "rtsp://192.168.1.102:554/live",
        "zone": "Terminal Concourse 04 • Escalator Flow",
        "description": "Vertical escalator transit & flow choke point",
    },
    {
        "id": "cctv-platform-3",
        "name": "Platform 03 — Boarding Hall",
        "type": "ip_camera",
        "ip": "192.168.1.103",
        "port": 554,
        "protocol": "rtsp",
        "path": "/h264",
        "source": "rtsp://192.168.1.103:554/h264",
        "zone": "Platform Hub • Level 2 North",
        "description": "Staging area & platform edge crowd distribution",
    },
    {
        "id": "cctv-security-gate",
        "name": "Security Checkpoint 01 Entry",
        "type": "ip_camera",
        "ip": "192.168.1.104",
        "port": 8080,
        "protocol": "http",
        "path": "/video",
        "source": "http://192.168.1.104:8080/video",
        "zone": "North Terminal • Security Screening",
        "description": "Passenger queue and throughput checkpoint",
    },
]


@app.get("/")
def index():
    return {
        "service": "Vigilo Predictive Crowd Intelligence Backend",
        "version": "1.0.0",
        "endpoints": {
            "stream": "/video_feed",
            "telemetry": "/stats",
            "camera_info": "/camera/info",
            "sources": "/camera/sources",
            "switch": "/camera/switch",
            "test": "/camera/test",
            "suspend": "/camera/suspend",
            "resume": "/camera/resume",
            "toggle": "/camera/toggle",
            "health": "/health"
        },
        "status": "online"
    }


@app.get("/health")
def healthcheck():
    connected = broadcaster.stats["camera_connected"] if broadcaster else False
    is_suspended = broadcaster.suspended if broadcaster else False
    return {
        "status": "healthy",
        "camera_connected": connected,
        "is_suspended": is_suspended,
        "broadcaster_running": broadcaster is not None and broadcaster.running
    }


@app.get("/video_feed")
async def video_feed(request: Request):
    """
    Continuous Multipart MJPEG video stream accessible directly by HTML <img> tags.
    Exits immediately when client disconnects or server initiates shutdown.
    """
    async def frame_generator():
        try:
            while broadcaster is not None and broadcaster.running:
                # Terminate loop immediately if client disconnected
                if await request.is_disconnected():
                    break

                if broadcaster.suspended:
                    await asyncio.sleep(0.08)
                    continue

                frame_bytes = broadcaster.get_latest_frame()
                if frame_bytes is None:
                    await asyncio.sleep(0.02)
                    continue

                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
                )
                await asyncio.sleep(0.01)
        except (asyncio.CancelledError, GeneratorExit):
            pass

    return CleanStreamingResponse(
        frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/stats")
def get_stats():
    """
    Live JSON telemetry state polled by the frontend dashboard.
    """
    if broadcaster is None:
        return {
            "status": "INITIALIZING",
            "is_suspended": False,
            "is_crowd": False,
            "crowd_probability": 0.0,
            "people_count": 0,
            "density_per_megapixel": 0.0,
            "nearest_neighbor_distance": 0.0,
            "fps": 0.0,
            "capture_fps": 0.0,
            "camera_connected": False,
            "resolution": "Offline",
            "camera_source": "Standby",
            "camera_raw_source": "Standby",
            "camera_type": "unknown",
            "camera_ip": None,
            "camera_port": None,
            "zone": DEFAULT_ZONE,
            "uptime_seconds": 0
        }
    return broadcaster.get_stats()


@app.get("/camera/info")
def get_camera_info():
    """
    Returns specific camera hardware and zone location telemetry.
    """
    stats = get_stats()
    return {
        "source": stats.get("camera_source", "Unknown"),
        "raw_source": stats.get("camera_raw_source", "Unknown"),
        "type": stats.get("camera_type", "unknown"),
        "ip": stats.get("camera_ip"),
        "port": stats.get("camera_port"),
        "resolution": stats.get("resolution", "Standby"),
        "zone": stats.get("zone", DEFAULT_ZONE),
        "capture_fps": stats.get("capture_fps", 0.0),
        "connected": stats.get("camera_connected", False),
        "is_suspended": stats.get("is_suspended", False),
        "protocol": "AVFoundation / V4L2 Zero-latency Ingestion",
        "mesh_latency_ms": 12,
        "ai_pipeline": "YOLO26m + 21-Feature Random Forest",
        "uptime_seconds": stats.get("uptime_seconds", 0)
    }


@app.get("/camera/sources")
def get_camera_sources():
    """
    Returns standard optical interfaces (webcams), preset CCTV nodes,
    and current active camera status for the runtime switcher UI.
    """
    current_info = broadcaster.get_source_info() if broadcaster else {
        "source": "0",
        "display_name": "Integrated HD Camera (Index 0)",
        "type": "webcam",
        "ip": None,
        "port": None,
        "zone": DEFAULT_ZONE,
        "connected": False,
        "is_suspended": True
    }
    return {
        "current": current_info,
        "interfaces": DEFAULT_HARDWARE_INTERFACES,
        "presets": DEFAULT_PRESETS
    }


class SwitchSourceRequest(BaseModel):
    source: Optional[str] = None
    ip: Optional[str] = None
    port: Optional[int] = None
    protocol: Optional[str] = "rtsp"
    path: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None
    zone: Optional[str] = None
    auto_resume: Optional[bool] = True


@app.post("/camera/switch")
def switch_camera(req: SwitchSourceRequest):
    """
    Switches camera index or RTSP / HTTP IP camera dynamically in runtime
    without restarting the server. Supports direct IP and Port input.
    """
    global broadcaster
    if broadcaster is None:
        return JSONResponse(status_code=503, content={"error": "Broadcaster not initialized"})

    # Determine target source URL or index
    if req.ip:
        ip = req.ip.strip()
        protocol = (req.protocol or "rtsp").lower().strip()
        port = req.port if req.port is not None else (554 if protocol == "rtsp" else 8080)
        path = (req.path or "").strip()
        if path and not path.startswith("/"):
            path = f"/{path}"

        auth_str = ""
        if req.username:
            user = req.username.strip()
            pwd = req.password.strip() if req.password else ""
            auth_str = f"{user}:{pwd}@" if pwd else f"{user}@"

        target_source = f"{protocol}://{auth_str}{ip}:{port}{path}"
        display_name = req.name or f"IP Camera ({ip}:{port})"
    elif req.source is not None:
        target_source = str(req.source).strip()
        display_name = req.name
    else:
        return JSONResponse(status_code=400, content={"error": "Must provide either 'ip' and 'port', or 'source'"})

    auto_resume = True if req.auto_resume is None else bool(req.auto_resume)

    broadcaster.switch_source(
        new_source=target_source,
        display_name=display_name,
        zone=req.zone,
        auto_resume=auto_resume
    )

    stats = broadcaster.get_stats()
    return {
        "status": "success",
        "new_source": stats.get("camera_raw_source", str(target_source)),
        "display_name": stats.get("camera_source"),
        "camera_type": stats.get("camera_type"),
        "camera_ip": stats.get("camera_ip"),
        "camera_port": stats.get("camera_port"),
        "zone": broadcaster.zone,
        "is_suspended": broadcaster.suspended,
        "message": f"Successfully switched camera feed to {stats.get('camera_source')}"
    }


class TestConnectionRequest(BaseModel):
    ip: str
    port: int
    timeout: Optional[float] = 2.0


@app.post("/camera/test")
def test_camera_connection(req: TestConnectionRequest):
    """
    Rapidly tests TCP socket reachability for an IP camera host and port.
    Prevents locking or configuring non-existent CCTV nodes.
    """
    t0 = time.time()
    try:
        sock = socket.create_connection((req.ip.strip(), req.port), timeout=req.timeout or 2.0)
        sock.close()
        latency_ms = round((time.time() - t0) * 1000, 1)
        return {
            "reachable": True,
            "ip": req.ip.strip(),
            "port": req.port,
            "latency_ms": latency_ms,
            "message": f"Online: successfully reached {req.ip}:{req.port} in {latency_ms}ms"
        }
    except Exception as e:
        latency_ms = round((time.time() - t0) * 1000, 1)
        return {
            "reachable": False,
            "ip": req.ip.strip(),
            "port": req.port,
            "latency_ms": latency_ms,
            "error": str(e),
            "message": f"Unreachable: failed to reach {req.ip}:{req.port} ({e})"
        }


@app.post("/camera/suspend")
def suspend_camera():
    """
    Suspends camera capture device and neural inference pipeline to conserve power and CPU.
    """
    global broadcaster
    if broadcaster is None:
        return JSONResponse(status_code=503, content={"error": "Broadcaster not initialized"})

    broadcaster.suspend()
    return {
        "status": "success",
        "suspended": True,
        "message": "Camera hardware released and inference engine suspended"
    }


@app.post("/camera/resume")
def resume_camera():
    """
    Resumes camera capture and activates real-time crowd inference.
    """
    global broadcaster
    if broadcaster is None:
        return JSONResponse(status_code=503, content={"error": "Broadcaster not initialized"})

    broadcaster.resume()
    return {
        "status": "success",
        "suspended": False,
        "message": "Camera capture and neural inference resumed"
    }


@app.post("/camera/toggle")
def toggle_camera():
    """
    Toggles between suspended and active states on demand from the site.
    """
    global broadcaster
    if broadcaster is None:
        return JSONResponse(status_code=503, content={"error": "Broadcaster not initialized"})

    is_now_suspended = broadcaster.toggle()
    return {
        "status": "success",
        "suspended": is_now_suspended,
        "message": "Camera suspended (power-saving idle)" if is_now_suspended else "Camera resumed"
    }


def parse_args():
    parser = argparse.ArgumentParser(
        description="Vigilo Crowd Detection & Intelligence Server",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument("--source", default=DEFAULT_SOURCE, help="Camera index (e.g. 0 for webcam), RTSP URL, or video path")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Host address to bind")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Port to listen on")
    parser.add_argument("--conf", type=float, default=DEFAULT_CONF, help="YOLO confidence threshold")
    parser.add_argument("--iou", type=float, default=DEFAULT_IOU, help="YOLO IoU threshold")
    parser.add_argument("--stride", type=int, default=DEFAULT_STRIDE, help="Inference stride (1 = every frame)")
    parser.add_argument("--smooth", type=int, default=DEFAULT_SMOOTH, help="Temporal probability smoothing window")
    parser.add_argument("--zone", default=DEFAULT_ZONE, help="Facility zone label")
    parser.add_argument(
        "--auto-start",
        "--active",
        dest="auto_start",
        action="store_true",
        help="Immediately activate camera upon startup (default: starts suspended in power-saving standby)"
    )
    return parser.parse_args()


def main():
    global broadcaster
    args = parse_args()
    start_suspended = not args.auto_start

    print()
    print("=" * 75)
    print(" VIGILO — REAL-TIME CROWD INTELLIGENCE BACKEND SERVER")
    print("=" * 75)
    print(f" Camera Source  : {args.source}")
    print(f" Zone Location  : {args.zone}")
    print(f" Initial State  : {'SUSPENDED (Standby - Camera Off)' if start_suspended else 'ACTIVE (Streaming)'}")
    print(f" Server URL     : http://{args.host}:{args.port}")
    print(f" Video Stream   : http://localhost:{args.port}/video_feed")
    print(f" Telemetry API  : http://localhost:{args.port}/stats")
    print(f" Camera Info API: http://localhost:{args.port}/camera/info")
    print(f" Suspend API    : POST http://localhost:{args.port}/camera/suspend")
    print(f" Resume API     : POST http://localhost:{args.port}/camera/resume")
    print(f" Toggle API     : POST http://localhost:{args.port}/camera/toggle")
    print("=" * 75)
    print()

    # Initialize the live AI stream broadcaster (Defaults to Suspended standby)
    broadcaster = CrowdStreamBroadcaster(
        source=args.source,
        conf=args.conf,
        iou=args.iou,
        stride=args.stride,
        smooth=args.smooth,
        zone=args.zone,
        suspended=start_suspended
    )

    config = uvicorn.Config(
        app,
        host=args.host,
        port=args.port,
        log_level="info",
        timeout_graceful_shutdown=1
    )
    server = uvicorn.Server(config)

    # Intercept exit signal to immediately halt the broadcaster and release connections
    original_handle_exit = server.handle_exit

    def handle_exit(sig: int, frame) -> None:
        if broadcaster:
            broadcaster.stop()
        original_handle_exit(sig, frame)

    server.handle_exit = handle_exit
    server.run()


if __name__ == "__main__":
    main()
