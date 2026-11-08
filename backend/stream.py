from collections import deque
import os
from pathlib import Path
import re
import threading
import time
from typing import Optional, Dict, Any
from urllib.parse import urlparse
import cv2
import numpy as np

# Optimize OpenCV RTSP streaming: prioritize TCP to prevent packet fragmentation and set 5s socket timeout
os.environ.setdefault("OPENCV_FFMPEG_CAPTURE_OPTIONS", "rtsp_transport;tcp|timeout;5000000")

try:
    from config import (
        DEFAULT_CONF,
        DEFAULT_IOU,
        DEFAULT_STRIDE,
        DEFAULT_SMOOTH,
        DEFAULT_ZONE,
        DEFAULT_HEATMAP,
        DEFAULT_CLUSTERS,
    )
    from detector import CrowdDetector, draw_annotations, detect_spatial_clusters
except ImportError:
    from backend.config import (
        DEFAULT_CONF,
        DEFAULT_IOU,
        DEFAULT_STRIDE,
        DEFAULT_SMOOTH,
        DEFAULT_ZONE,
        DEFAULT_HEATMAP,
        DEFAULT_CLUSTERS,
    )
    from backend.detector import CrowdDetector, draw_annotations, detect_spatial_clusters


def parse_camera_source(source) -> Dict[str, Any]:
    """
    Parses a camera source identifier (index, URL, IP:port, or file)
    into a structured telemetry metadata dictionary.
    """
    s = str(source).strip()

    # Hardware device index (0, 1, 2...)
    if s.isdigit():
        idx = int(s)
        name = "Integrated HD Camera (Index 0)" if idx == 0 else f"External USB Camera (Index {idx})"
        return {
            "type": "webcam",
            "index": idx,
            "ip": None,
            "port": None,
            "protocol": "Hardware Ingest",
            "path": None,
            "display_name": name,
            "masked_source": str(idx),
            "raw_source": str(idx),
        }

    # Direct IP:Port format without protocol prefix (e.g. "192.168.1.50:554" or "192.168.1.50:554/live")
    ip_port_pattern = re.match(r"^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d{1,5})(.*)$", s)
    if ip_port_pattern:
        ip = ip_port_pattern.group(1)
        port = int(ip_port_pattern.group(2))
        path = ip_port_pattern.group(3) or ""
        protocol = "rtsp"
        url = f"{protocol}://{ip}:{port}{path}"
        return {
            "type": "ip_camera",
            "index": None,
            "ip": ip,
            "port": port,
            "protocol": protocol,
            "path": path,
            "display_name": f"IP Camera ({ip}:{port})",
            "masked_source": url,
            "raw_source": url,
        }

    # Full RTSP / HTTP URL
    if s.startswith("rtsp://") or s.startswith("http://") or s.startswith("https://"):
        try:
            parsed = urlparse(s)
            scheme = parsed.scheme.lower()
            ip = parsed.hostname or "remote-camera"
            port = parsed.port or (554 if scheme == "rtsp" else (443 if scheme == "https" else 80))
            masked_netloc = ip
            if parsed.username:
                masked_netloc = f"{parsed.username}:••••••@{ip}:{port}"
            elif parsed.port:
                masked_netloc = f"{ip}:{port}"
            masked_url = f"{scheme}://{masked_netloc}{parsed.path}"
            return {
                "type": "ip_camera",
                "index": None,
                "ip": ip,
                "port": port,
                "protocol": scheme,
                "path": parsed.path,
                "display_name": f"IP Camera ({ip}:{port})",
                "masked_source": masked_url,
                "raw_source": s,
            }
        except Exception:
            pass

    # Video file or other local media
    filename = Path(s).name or s
    return {
        "type": "video_file",
        "index": None,
        "ip": None,
        "port": None,
        "protocol": "file",
        "path": s,
        "display_name": f"Video Stream ({filename})",
        "masked_source": s,
        "raw_source": s,
    }


class RTSPCameraStream:
    """
    Decoupled background capture thread.
    Continuously retrieves the absolute freshest frame to prevent RTSP/webcam buffer buildup.
    Supports on-demand suspension to release camera hardware and conserve compute.
    """
    def __init__(self, source, suspended: bool = True):
        self.source = int(source) if str(source).isdigit() else source
        self.is_video_file = isinstance(self.source, str) and not (
            str(self.source).startswith("rtsp://") or str(self.source).startswith("http://")
        )
        self.lock = threading.Lock()
        self.latest_frame: Optional[np.ndarray] = None
        self.running = True
        self.suspended = suspended
        self.connected = False
        self.width = 0
        self.height = 0
        self.capture_fps = 0.0
        self.cap: Optional[cv2.VideoCapture] = None

        # Asynchronously manage capture in _update_loop to avoid blocking HTTP threads
        self.thread = threading.Thread(target=self._update_loop, daemon=True)
        self.thread.start()

    def _open_capture(self) -> bool:
        try:
            if self.cap is not None and self.cap.isOpened():
                return True
            self.cap = cv2.VideoCapture(self.source)
            if hasattr(cv2, "CAP_PROP_BUFFERSIZE"):
                try:
                    self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                except Exception:
                    pass
            if self.cap.isOpened():
                self.connected = True
                ret, frame = self.cap.read()
                if ret and frame is not None:
                    with self.lock:
                        self.latest_frame = frame
                        self.height, self.width = frame.shape[:2]
                return True
        except Exception as e:
            print(f"[Camera Open Error]: {e}")
        self.connected = False
        return False

    def _release_capture(self):
        try:
            if self.cap is not None and self.cap.isOpened():
                self.cap.release()
        except Exception as e:
            print(f"[Camera Release Error]: {e}")
        self.cap = None
        self.connected = False

    def suspend(self):
        with self.lock:
            self.suspended = True
            self.connected = False
            self.latest_frame = None
            self.capture_fps = 0.0
            self._release_capture()

    def resume(self):
        with self.lock:
            if not self.suspended:
                return
            self.suspended = False
        # The update loop will automatically re-open capture cleanly

    def _update_loop(self):
        last_frame_time = time.time()
        while self.running:
            if self.suspended:
                time.sleep(0.1)
                continue

            if self.cap is None or not self.cap.isOpened():
                self.connected = False
                time.sleep(0.5)
                if not self.suspended and self.running:
                    self._open_capture()
                continue

            ret, frame = self.cap.read()
            now = time.time()
            if ret and frame is not None:
                self.connected = True
                with self.lock:
                    self.latest_frame = frame
                    self.height, self.width = frame.shape[:2]
                    self.capture_fps = 1.0 / max(now - last_frame_time, 1e-4)
                last_frame_time = now
            else:
                if self.is_video_file and self.cap is not None:
                    # Loop sample video files smoothly
                    self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                else:
                    self.connected = False
                    time.sleep(0.5)

            # High-performance pacing
            time.sleep(0.005)

    def read(self) -> Optional[np.ndarray]:
        with self.lock:
            return None if self.latest_frame is None else self.latest_frame.copy()

    def get_info(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "connected": self.connected,
                "suspended": self.suspended,
                "width": self.width,
                "height": self.height,
                "resolution": f"{self.width}x{self.height}" if self.width > 0 and self.connected else ("Suspended (Idle)" if self.suspended else "Offline / Standby"),
                "capture_fps": round(self.capture_fps, 1) if not self.suspended else 0.0,
                "source": str(self.source)
            }

    def stop(self):
        self.running = False
        self._release_capture()


class CrowdStreamBroadcaster:
    """
    Runs the YOLO + Spatial Features + Random Forest pipeline in a continuous loop.
    Distributes annotated JPEG frames and live telemetry metrics.
    Supports instant on/off suspension to freeze neural compute and free optical devices.
    """
    def __init__(
        self,
        source,
        conf: float = DEFAULT_CONF,
        iou: float = DEFAULT_IOU,
        stride: int = DEFAULT_STRIDE,
        smooth: int = DEFAULT_SMOOTH,
        zone: str = DEFAULT_ZONE,
        suspended: bool = True,
        show_heatmap: bool = DEFAULT_HEATMAP,
        show_clusters: bool = DEFAULT_CLUSTERS,
    ):
        self.source = source
        self.conf = conf
        self.iou = iou
        self.stride = max(1, stride)
        self.smooth = max(1, smooth)
        self.zone = zone
        self.suspended = suspended
        self.show_heatmap = show_heatmap
        self.show_clusters = show_clusters

        self.detector = CrowdDetector(conf=self.conf, iou=self.iou)
        self.camera = RTSPCameraStream(self.source, suspended=self.suspended)
        self.source_meta = parse_camera_source(self.source)

        # Thread-safe broadcast state
        self.lock = threading.Lock()
        self.latest_jpeg: Optional[bytes] = None
        self.stats = {
            "status": "SUSPENDED" if self.suspended else "INITIALIZING",
            "is_suspended": self.suspended,
            "is_crowd": False,
            "crowd_probability": 0.0,
            "people_count": 0,
            "density_per_megapixel": 0.0,
            "nearest_neighbor_distance": 0.0,
            "dense_clusters_count": 0,
            "gatherings_count": 0,
            "isolated_count": 0,
            "heatmap_enabled": self.show_heatmap,
            "clusters_enabled": self.show_clusters,
            "fps": 0.0,
            "capture_fps": 0.0,
            "camera_connected": False,
            "uptime_seconds": 0,
            "resolution": "Suspended (Idle)" if self.suspended else "Offline",
            "camera_source": self.source_meta.get("display_name", self._human_source_name(self.source)),
            "camera_raw_source": self.source_meta.get("masked_source", str(self.source)),
            "camera_type": self.source_meta.get("type", "unknown"),
            "camera_ip": self.source_meta.get("ip"),
            "camera_port": self.source_meta.get("port"),
            "zone": self.zone,
            "model_mesh": "YOLO26m + Conflux Random Forest + Spatial Clustering",
        }

        self.running = True
        self.start_time = time.time()
        self.worker_thread = threading.Thread(target=self._inference_loop, daemon=True)
        self.worker_thread.start()

    def set_display_options(self, heatmap: Optional[bool] = None, clusters: Optional[bool] = None):
        """Dynamically enables or disables ground density heatmap and cluster polygons."""
        with self.lock:
            if heatmap is not None:
                self.show_heatmap = bool(heatmap)
                self.stats["heatmap_enabled"] = self.show_heatmap
            if clusters is not None:
                self.show_clusters = bool(clusters)
                self.stats["clusters_enabled"] = self.show_clusters
        print(f"[Broadcaster] Display options updated: Heatmap={self.show_heatmap}, Clusters={self.show_clusters}")

    def _human_source_name(self, source) -> str:
        meta = parse_camera_source(source)
        return meta.get("display_name", f"Source ({source})")

    def suspend(self):
        """Immediately halts camera hardware polling and neural inference pipeline."""
        with self.lock:
            self.suspended = True
            self.latest_jpeg = None
            self.stats["is_suspended"] = True
            self.stats["status"] = "SUSPENDED"
            self.stats["camera_connected"] = False
            self.stats["fps"] = 0.0
            self.stats["capture_fps"] = 0.0
            self.stats["resolution"] = "Suspended (Idle)"
        self.camera.suspend()
        print("[Broadcaster] Camera & inference suspended (power-saving idle).")

    def resume(self):
        """Re-engages camera hardware and resumes real-time inference."""
        with self.lock:
            self.suspended = False
            self.stats["is_suspended"] = False
            self.stats["status"] = "INITIALIZING"
        self.camera.resume()
        print("[Broadcaster] Camera & inference resumed.")

    def toggle(self) -> bool:
        """Toggles between active and suspended states. Returns new suspended state."""
        if self.suspended:
            self.resume()
            return False
        else:
            self.suspend()
            return True

    def switch_source(
        self,
        new_source,
        display_name: Optional[str] = None,
        zone: Optional[str] = None,
        auto_resume: bool = True
    ):
        """Allows switching camera sources without restarting the FastAPI server."""
        with self.lock:
            old_cam = self.camera
            self.source = new_source
            self.source_meta = parse_camera_source(self.source)

            if zone:
                self.zone = zone
                self.stats["zone"] = zone

            if auto_resume and self.suspended:
                self.suspended = False
                self.stats["is_suspended"] = False

            # Create new camera capture instance
            self.camera = RTSPCameraStream(self.source, suspended=self.suspended)

            human_name = display_name or self.source_meta.get("display_name") or self._human_source_name(self.source)
            self.stats["camera_source"] = human_name
            self.stats["camera_type"] = self.source_meta.get("type", "unknown")
            self.stats["camera_ip"] = self.source_meta.get("ip")
            self.stats["camera_port"] = self.source_meta.get("port")
            self.stats["camera_raw_source"] = self.source_meta.get("masked_source", str(self.source))
            self.stats["camera_connected"] = False
            self.stats["status"] = "INITIALIZING"
            self.latest_jpeg = None

        if old_cam:
            old_cam.stop()

    def get_source_info(self) -> Dict[str, Any]:
        with self.lock:
            meta = parse_camera_source(self.source)
            return {
                "source": meta.get("masked_source", str(self.source)),
                "display_name": self.stats.get("camera_source", meta.get("display_name")),
                "type": self.stats.get("camera_type", meta.get("type", "unknown")),
                "ip": self.stats.get("camera_ip", meta.get("ip")),
                "port": self.stats.get("camera_port", meta.get("port")),
                "zone": self.zone,
                "connected": self.stats.get("camera_connected", False),
                "is_suspended": self.suspended,
                "resolution": self.stats.get("resolution", "Standby"),
                "capture_fps": self.stats.get("capture_fps", 0.0),
            }

    def _inference_loop(self):
        prob_history = deque(maxlen=self.smooth)
        frame_counter = 0
        last_time = time.time()

        cached_boxes = np.empty((0, 4))
        cached_confs = np.empty(0)
        cached_features = {
            "person_count": 0,
            "people_per_megapixel": 0.0,
            "average_nearest_neighbor_distance": 0.0
        }
        cached_prob = 0.0
        cached_is_crowd = False
        cached_dense_clusters = []
        cached_gatherings = []
        cached_isolated = []
        cached_dense_cnt = 0
        cached_gather_cnt = 0
        cached_isolated_cnt = 0

        while self.running:
            if self.suspended:
                time.sleep(0.15)
                continue

            frame = self.camera.read()
            cam_info = self.camera.get_info()

            if frame is None:
                with self.lock:
                    self.stats["camera_connected"] = False
                    self.stats["status"] = "SUSPENDED" if self.suspended else "CAMERA STANDBY"
                    self.stats["resolution"] = cam_info["resolution"]
                    self.stats["is_suspended"] = self.suspended
                time.sleep(0.04)
                continue

            frame_counter += 1
            now = time.time()
            fps_instant = 1.0 / max(now - last_time, 1e-4)
            last_time = now

            # Process AI model on every Nth frame
            if frame_counter % self.stride == 0:
                try:
                    boxes, confs, features, raw_prob = self.detector.predict(frame)
                    cached_boxes = boxes
                    cached_confs = confs
                    cached_features = features

                    prob_history.append(raw_prob)
                    smoothed_prob = float(np.mean(prob_history))
                    cached_prob = smoothed_prob
                    cached_is_crowd = smoothed_prob >= 0.50

                    dense_clusters, gatherings, isolated = detect_spatial_clusters(cached_boxes)
                    cached_dense_clusters = dense_clusters
                    cached_gatherings = gatherings
                    cached_isolated = isolated
                    cached_dense_cnt = len(dense_clusters)
                    cached_gather_cnt = len(gatherings)
                    cached_isolated_cnt = len(isolated)
                except Exception as e:
                    print(f"[Inference Error]: {e}")

            with self.lock:
                cur_heatmap = self.show_heatmap
                cur_clusters = self.show_clusters

            # Draw sleek bounding boxes, dynamic ground heatmap, and spatial cluster hulls/boxes
            annotated_frame, dense_cnt, gather_cnt, isolated_cnt = draw_annotations(
                frame=frame,
                boxes=cached_boxes,
                confidences=cached_confs,
                is_crowd=cached_is_crowd,
                show_hud=False,
                show_heatmap=cur_heatmap,
                show_clusters=cur_clusters,
                dense_clusters=cached_dense_clusters,
                gatherings=cached_gatherings,
                isolated=cached_isolated
            )

            # Compress JPEG for client streaming
            success, jpeg_buffer = cv2.imencode(".jpg", annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if success:
                jpeg_bytes = jpeg_buffer.tobytes()
                with self.lock:
                    self.latest_jpeg = jpeg_bytes
                    self.stats = {
                        "status": "CROWD ALERT" if cached_is_crowd else "NORMAL",
                        "is_suspended": False,
                        "is_crowd": cached_is_crowd,
                        "crowd_probability": round(cached_prob, 4),
                        "people_count": cached_features["person_count"],
                        "density_per_megapixel": round(cached_features["people_per_megapixel"], 2),
                        "nearest_neighbor_distance": round(cached_features["average_nearest_neighbor_distance"], 4),
                        "dense_clusters_count": dense_cnt,
                        "gatherings_count": gather_cnt,
                        "isolated_count": isolated_cnt,
                        "heatmap_enabled": cur_heatmap,
                        "clusters_enabled": cur_clusters,
                        "fps": round(fps_instant, 1),
                        "capture_fps": cam_info["capture_fps"],
                        "camera_connected": cam_info["connected"],
                        "resolution": cam_info["resolution"],
                        "camera_source": self.stats.get("camera_source") or self._human_source_name(self.source),
                        "camera_raw_source": self.source_meta.get("masked_source", str(self.source)),
                        "camera_type": self.source_meta.get("type", "unknown"),
                        "camera_ip": self.source_meta.get("ip"),
                        "camera_port": self.source_meta.get("port"),
                        "zone": self.zone,
                        "model_mesh": "YOLO26m + Conflux Random Forest + Spatial Clustering",
                        "uptime_seconds": int(time.time() - self.start_time),
                    }

    def get_latest_frame(self) -> Optional[bytes]:
        with self.lock:
            return self.latest_jpeg

    def get_stats(self) -> Dict[str, Any]:
        with self.lock:
            stats = dict(self.stats)
            stats["is_suspended"] = self.suspended
            return stats

    def stop(self):
        self.running = False
        self.camera.stop()
