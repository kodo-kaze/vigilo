import pickle
from typing import Dict, Any, Tuple
import cv2
import numpy as np
import pandas as pd
from ultralytics import YOLO

from config import YOLO_MODEL_PATH, RF_MODEL_PATH, FEATURE_COLUMNS


def extract_features(result) -> Dict[str, Any]:
    """
    Computes the 21 scene-level spatial & density features from YOLO detections.
    """
    image = result.orig_img
    height, width = image.shape[:2]
    image_area = width * height

    if result.boxes is None or len(result.boxes) == 0:
        return {
            "person_count": 0,
            "avg_confidence": 0.0,
            "min_confidence": 0.0,
            "max_confidence": 0.0,
            "total_bbox_area_ratio": 0.0,
            "avg_bbox_area_ratio": 0.0,
            "max_bbox_area_ratio": 0.0,
            "avg_bbox_width_ratio": 0.0,
            "avg_bbox_height_ratio": 0.0,
            "people_per_megapixel": 0.0,
            "average_center_distance": 0.0,
            "average_nearest_neighbor_distance": 0.0,
            "grid_00": 0, "grid_01": 0, "grid_02": 0,
            "grid_10": 0, "grid_11": 0, "grid_12": 0,
            "grid_20": 0, "grid_21": 0, "grid_22": 0,
        }

    boxes = result.boxes.xyxy.cpu().numpy()
    confidences = result.boxes.conf.cpu().numpy()

    person_count = len(boxes)
    avg_confidence = float(np.mean(confidences))
    min_confidence = float(np.min(confidences))
    max_confidence = float(np.max(confidences))

    bbox_widths = boxes[:, 2] - boxes[:, 0]
    bbox_heights = boxes[:, 3] - boxes[:, 1]
    bbox_areas = bbox_widths * bbox_heights

    bbox_area_ratios = bbox_areas / image_area
    total_bbox_area_ratio = float(np.sum(bbox_area_ratios))
    avg_bbox_area_ratio = float(np.mean(bbox_area_ratios))
    max_bbox_area_ratio = float(np.max(bbox_area_ratios))

    avg_bbox_width_ratio = float(np.mean(bbox_widths / width))
    avg_bbox_height_ratio = float(np.mean(bbox_heights / height))

    image_megapixels = image_area / 1_000_000
    people_per_megapixel = float(person_count / max(image_megapixels, 1e-6))

    centers_x = (boxes[:, 0] + boxes[:, 2]) / 2.0
    centers_y = (boxes[:, 1] + boxes[:, 3]) / 2.0
    centers = np.column_stack([centers_x / width, centers_y / height])

    if person_count >= 2:
        pairwise_distances = []
        for i in range(person_count):
            for j in range(i + 1, person_count):
                pairwise_distances.append(np.linalg.norm(centers[i] - centers[j]))
        average_center_distance = float(np.mean(pairwise_distances))
    else:
        average_center_distance = 0.0

    if person_count >= 2:
        nearest_distances = []
        for i in range(person_count):
            distances = np.linalg.norm(centers - centers[i], axis=1)
            distances[i] = np.inf
            nearest_distances.append(np.min(distances))
        average_nearest_neighbor_distance = float(np.mean(nearest_distances))
    else:
        average_nearest_neighbor_distance = 0.0

    grid_counts = np.zeros((3, 3), dtype=int)
    for cx, cy in centers:
        col = min(int(cx * 3), 2)
        row = min(int(cy * 3), 2)
        grid_counts[row, col] += 1

    return {
        "person_count": person_count,
        "avg_confidence": avg_confidence,
        "min_confidence": min_confidence,
        "max_confidence": max_confidence,
        "total_bbox_area_ratio": total_bbox_area_ratio,
        "avg_bbox_area_ratio": avg_bbox_area_ratio,
        "max_bbox_area_ratio": max_bbox_area_ratio,
        "avg_bbox_width_ratio": avg_bbox_width_ratio,
        "avg_bbox_height_ratio": avg_bbox_height_ratio,
        "people_per_megapixel": people_per_megapixel,
        "average_center_distance": average_center_distance,
        "average_nearest_neighbor_distance": average_nearest_neighbor_distance,
        "grid_00": int(grid_counts[0, 0]),
        "grid_01": int(grid_counts[0, 1]),
        "grid_02": int(grid_counts[0, 2]),
        "grid_10": int(grid_counts[1, 0]),
        "grid_11": int(grid_counts[1, 1]),
        "grid_12": int(grid_counts[1, 2]),
        "grid_20": int(grid_counts[2, 0]),
        "grid_21": int(grid_counts[2, 1]),
        "grid_22": int(grid_counts[2, 2]),
    }


def draw_annotations(
    frame: np.ndarray,
    boxes: np.ndarray,
    confidences: np.ndarray,
    is_crowd: bool,
    show_hud: bool = False,
    crowd_prob: float = 0.0,
    person_count: int = 0,
    density_per_mp: float = 0.0,
    nn_distance: float = 0.0,
    fps: float = 0.0
) -> np.ndarray:
    """
    Renders high-tech futuristic bounding boxes and confidence tags over detected people.
    Keeps the video feed clean by not drawing the top HUD banner (which is rendered in the UI dashboard).
    """
    h, w = frame.shape[:2]
    annotated = frame.copy()

    # Futuristic palette (BGR)
    if is_crowd:
        theme_color = (48, 62, 235)       # Amber-Red surge alert
        bracket_color = (90, 110, 255)
        tag_bg = (30, 36, 180)
    else:
        theme_color = (235, 180, 50)      # High-tech Electric Cyan (BGR)
        bracket_color = (255, 220, 120)
        tag_bg = (160, 90, 15)

    # 1. Bounding Boxes with stylish corner brackets
    if boxes is not None and len(boxes) > 0:
        for box, conf in zip(boxes, confidences):
            x1, y1, x2, y2 = box.astype(int)
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w - 1, x2), min(h - 1, y2)
            bw, bh = x2 - x1, y2 - y1

            # Thin bounding rectangle
            cv2.rectangle(annotated, (x1, y1), (x2, y2), theme_color, 1, cv2.LINE_AA)

            # High-tech corner brackets (adds futuristic cyber optic aesthetics)
            corner_len = max(6, min(14, int(min(bw, bh) * 0.25)))
            # Top-left
            cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), bracket_color, 2, cv2.LINE_AA)
            cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), bracket_color, 2, cv2.LINE_AA)
            # Top-right
            cv2.line(annotated, (x2, y1), (x2 - corner_len, y1), bracket_color, 2, cv2.LINE_AA)
            cv2.line(annotated, (x2, y1), (x2, y1 + corner_len), bracket_color, 2, cv2.LINE_AA)
            # Bottom-left
            cv2.line(annotated, (x1, y2), (x1 + corner_len, y2), bracket_color, 2, cv2.LINE_AA)
            cv2.line(annotated, (x1, y2), (x1, y2 - corner_len), bracket_color, 2, cv2.LINE_AA)
            # Bottom-right
            cv2.line(annotated, (x2, y2), (x2 - corner_len, y2), bracket_color, 2, cv2.LINE_AA)
            cv2.line(annotated, (x2, y2), (x2, y2 - corner_len), bracket_color, 2, cv2.LINE_AA)

            # Compact confidence badge
            tag = f"P {conf:.2f}"
            (tw, th), _ = cv2.getTextSize(tag, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
            tag_y1 = max(0, y1 - th - 6)
            tag_y2 = max(th + 6, y1)
            cv2.rectangle(annotated, (x1, tag_y1), (x1 + tw + 6, tag_y2), tag_bg, -1)
            cv2.rectangle(annotated, (x1, tag_y1), (x1 + tw + 6, tag_y2), theme_color, 1)
            cv2.putText(
                annotated,
                tag,
                (x1 + 3, max(th + 2, y1 - 3)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.38,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

    # 2. Optional HUD banner (if explicitly requested)
    if show_hud:
        hud_height = max(70, int(h * 0.10))
        overlay = annotated.copy()
        cv2.rectangle(overlay, (0, 0), (w, hud_height), (18, 18, 24), -1)
        cv2.addWeighted(overlay, 0.85, annotated, 0.15, 0, annotated)
        cv2.line(annotated, (0, hud_height), (w, hud_height), theme_color, 2)

        scale_sub = max(0.45, min(0.70, w / 1280))
        metrics_str = (
            f"People: {person_count:3d} | Density: {density_per_mp:5.1f}/MP | "
            f"NN-Dist: {nn_distance:0.3f} | FPS: {fps:4.1f}"
        )
        cv2.putText(annotated, metrics_str, (20, int(hud_height * 0.65)), cv2.FONT_HERSHEY_SIMPLEX, scale_sub, (220, 225, 230), 1, cv2.LINE_AA)

    return annotated


class CrowdDetector:
    """
    Manages YOLO person detection and Random Forest crowd classification.
    """
    def __init__(self, conf: float = 0.25, iou: float = 0.70):
        self.conf = conf
        self.iou = iou

        print(f"[AI] Initializing YOLO model from {YOLO_MODEL_PATH}...")
        self.yolo_model = YOLO(str(YOLO_MODEL_PATH))

        print(f"[AI] Initializing Random Forest model from {RF_MODEL_PATH}...")
        with open(RF_MODEL_PATH, "rb") as f:
            self.rf_model = pickle.load(f)
        self.rf_model.n_jobs = 1

    def predict(self, frame: np.ndarray) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any], float]:
        """
        Runs YOLO detection, feature extraction, and Random Forest prediction.
        Returns (boxes, confidences, features_dict, raw_crowd_probability).
        """
        results = self.yolo_model.predict(
            source=frame,
            conf=self.conf,
            iou=self.iou,
            classes=[0],  # Person class only
            max_det=500,
            verbose=False
        )
        result = results[0]

        features = extract_features(result)

        feature_df = pd.DataFrame([features], columns=FEATURE_COLUMNS)
        raw_prob = float(self.rf_model.predict_proba(feature_df)[0][1])

        boxes = result.boxes.xyxy.cpu().numpy() if result.boxes is not None else np.empty((0, 4))
        confidences = result.boxes.conf.cpu().numpy() if result.boxes is not None else np.empty(0)

        return boxes, confidences, features, raw_prob
