#!/usr/bin/env python3
import argparse
from contextlib import asynccontextmanager
import time
from typing import Optional
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


@app.get("/")
def index():
    return {
        "service": "Vigilo Predictive Crowd Intelligence Backend",
        "version": "1.0.0",
        "endpoints": {
            "stream": "/video_feed",
            "telemetry": "/stats",
            "camera_info": "/camera/info",
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
def video_feed():
    """
    Continuous Multipart MJPEG video stream accessible directly by HTML <img> tags.
    Pauses frame generation when the server or camera is suspended.
    """
    def frame_generator():
        while True:
            if broadcaster is None or broadcaster.suspended:
                time.sleep(0.08)
                continue
            frame_bytes = broadcaster.get_latest_frame()
            if frame_bytes is None:
                time.sleep(0.02)
                continue
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
            time.sleep(0.01)

    return StreamingResponse(
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


class SwitchSourceRequest(BaseModel):
    source: str
    zone: Optional[str] = None


@app.post("/camera/switch")
def switch_camera(req: SwitchSourceRequest):
    """
    Switches camera index or RTSP source dynamically without restarting the server.
    """
    global broadcaster
    if broadcaster is None:
        return JSONResponse(status_code=503, content={"error": "Broadcaster not initialized"})

    broadcaster.switch_source(req.source)
    if req.zone:
        broadcaster.zone = req.zone
        broadcaster.stats["zone"] = req.zone

    return {
        "status": "success",
        "new_source": req.source,
        "zone": broadcaster.zone
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

    uvicorn.run(app, host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()
