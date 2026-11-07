from collections import deque
import threading
import time
from typing import Optional, Dict, Any
import cv2
import numpy as np

from config import DEFAULT_CONF, DEFAULT_IOU, DEFAULT_STRIDE, DEFAULT_SMOOTH, DEFAULT_ZONE
from detector import CrowdDetector, draw_annotations


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

        if not self.suspended:
            self._open_capture()

        self.thread = threading.Thread(target=self._update_loop, daemon=True)
        self.thread.start()

    def _open_capture(self) -> bool:
        try:
            if self.cap is not None and self.cap.isOpened():
                return True
            self.cap = cv2.VideoCapture(self.source)
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
        suspended: bool = True
    ):
        self.source = source
        self.conf = conf
        self.iou = iou
        self.stride = max(1, stride)
        self.smooth = max(1, smooth)
        self.zone = zone
        self.suspended = suspended

        self.detector = CrowdDetector(conf=self.conf, iou=self.iou)
        self.camera = RTSPCameraStream(self.source, suspended=self.suspended)

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
            "fps": 0.0,
            "camera_connected": False,
            "uptime_seconds": 0,
            "resolution": "Suspended (Idle)" if self.suspended else "Offline",
            "camera_source": self._human_source_name(self.source),
            "zone": self.zone,
            "model_mesh": "YOLO26m + Conflux Random Forest",
        }

        self.running = True
        self.start_time = time.time()
        self.worker_thread = threading.Thread(target=self._inference_loop, daemon=True)
        self.worker_thread.start()

    def _human_source_name(self, source) -> str:
        s = str(source)
        if s == "0":
            return "Integrated HD Camera (Index 0)"
        elif s == "1":
            return "External USB Webcam (Index 1)"
        elif s.startswith("rtsp://") or s.startswith("http://"):
            return f"IP Camera Stream ({s[:30]}...)"
        return f"Video Stream ({s})"

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

    def switch_source(self, new_source):
        """Allows switching camera sources without restarting the FastAPI server."""
        with self.lock:
            old_cam = self.camera
            self.source = new_source
            self.camera = RTSPCameraStream(self.source, suspended=self.suspended)
            self.stats["camera_source"] = self._human_source_name(self.source)
        if old_cam:
            old_cam.stop()

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
                except Exception as e:
                    print(f"[Inference Error]: {e}")

            # Draw sleek bounding boxes on detected pedestrians (clean UI video feed)
            annotated_frame = draw_annotations(
                frame=frame,
                boxes=cached_boxes,
                confidences=cached_confs,
                is_crowd=cached_is_crowd,
                show_hud=False
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
                        "fps": round(fps_instant, 1),
                        "capture_fps": cam_info["capture_fps"],
                        "camera_connected": cam_info["connected"],
                        "resolution": cam_info["resolution"],
                        "camera_source": self._human_source_name(self.source),
                        "zone": self.zone,
                        "model_mesh": "YOLO26m + Conflux Random Forest",
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
