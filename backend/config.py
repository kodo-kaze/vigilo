import os
from pathlib import Path
from typing import List

# Paths
BACKEND_DIR = Path(__file__).resolve().parent
MODEL_DIR = BACKEND_DIR / "model"

def resolve_model_path(filename: str) -> Path:
    """Finds model weights across standard project directories."""
    candidates = [
        MODEL_DIR / filename,
        BACKEND_DIR / filename,
        BACKEND_DIR.parent / "models" / filename,
    ]
    for p in candidates:
        if p.exists():
            return p
    return MODEL_DIR / filename

YOLO_MODEL_PATH = resolve_model_path("best.pt")
RF_MODEL_PATH = resolve_model_path("crowd_random_forest_v1.pkl")

# 21 spatial & density features used by the Random Forest classifier
FEATURE_COLUMNS: List[str] = [
    "person_count",
    "avg_confidence",
    "min_confidence",
    "max_confidence",
    "total_bbox_area_ratio",
    "avg_bbox_area_ratio",
    "max_bbox_area_ratio",
    "avg_bbox_width_ratio",
    "avg_bbox_height_ratio",
    "people_per_megapixel",
    "average_center_distance",
    "average_nearest_neighbor_distance",
    "grid_00", "grid_01", "grid_02",
    "grid_10", "grid_11", "grid_12",
    "grid_20", "grid_21", "grid_22",
]

# Default runtime configuration
DEFAULT_SOURCE = os.getenv("CROWD_STREAM_SOURCE", "0")
DEFAULT_HOST = os.getenv("HOST", "0.0.0.0")
DEFAULT_PORT = int(os.getenv("PORT", "8000"))
DEFAULT_CONF = float(os.getenv("CONF_THRESHOLD", "0.25"))
DEFAULT_IOU = float(os.getenv("IOU_THRESHOLD", "0.70"))
DEFAULT_STRIDE = int(os.getenv("FRAME_STRIDE", "1"))
DEFAULT_SMOOTH = int(os.getenv("SMOOTH_WINDOW", "10"))
DEFAULT_ZONE = os.getenv("CAMERA_ZONE", "Terminal Concourse 04 • Zone B")
