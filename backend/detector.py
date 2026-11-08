import pickle
from typing import Dict, Any, Tuple, List, Optional
import cv2
import numpy as np
import pandas as pd
from ultralytics import YOLO

try:
    from config import YOLO_MODEL_PATH, RF_MODEL_PATH, FEATURE_COLUMNS
except ImportError:
    from backend.config import YOLO_MODEL_PATH, RF_MODEL_PATH, FEATURE_COLUMNS


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


# =============================================================================
# DYNAMIC GROUND HEATMAP & SPATIAL CLUSTER ENGINE (V2)
# =============================================================================

def apply_ground_density_heatmap(frame: np.ndarray, boxes: np.ndarray) -> np.ndarray:
    """
    Renders a continuous 2D thermal density glow on the floor level using
    perspective-scaled Gaussian blobs placed at each person's ground foot contact point.
    """
    if boxes is None or len(boxes) == 0:
        return frame

    h, w = frame.shape[:2]
    # Downsample 4x for ultra-fast processing (< 1.5ms)
    h_sub, w_sub = max(1, h // 4), max(1, w // 4)
    heat_accum = np.zeros((h_sub, w_sub), dtype=np.float32)

    for box in boxes:
        x1, y1, x2, y2 = box
        fx = int(np.clip(((x1 + x2) / 2.0) / 4.0, 0, w_sub - 1))
        fy = int(np.clip(y2 / 4.0, 0, h_sub - 1))
        box_h = max(4.0, (y2 - y1) / 4.0)
        radius = max(8, int(box_h * 0.45))
        cv2.circle(heat_accum, (fx, fy), radius, 1.0, -1)

    # Smooth blur to create continuous density field
    heat_blurred = cv2.GaussianBlur(heat_accum, (0, 0), sigmaX=8.0, sigmaY=8.0)
    max_val = np.max(heat_blurred)
    if max_val <= 0:
        return frame

    # Normalize to 0-255
    heat_norm = np.clip((heat_blurred / max(max_val, 2.5)) * 255.0, 0, 255).astype(np.uint8)
    heat_full = cv2.resize(heat_norm, (w, h), interpolation=cv2.INTER_LINEAR)

    # Only show heat above threshold to keep open walking areas clean
    mask = heat_full > 40
    if not np.any(mask):
        return frame

    heatmap_color = cv2.applyColorMap(heat_full, cv2.COLORMAP_TURBO)
    blended = frame.copy()
    alpha = 0.40
    blended[mask] = cv2.addWeighted(frame[mask], 1.0 - alpha, heatmap_color[mask], alpha, 0)
    return blended


def detect_spatial_clusters(boxes: np.ndarray) -> Tuple[List[List[int]], List[List[int]], List[int]]:
    """
    Identifies high-density crowd clusters, abnormal gatherings, and isolated pedestrians
    using perspective-adaptive spatial proximity graph clustering.
    Returns:
        (dense_clusters, gatherings, isolated)
    """
    if boxes is None or len(boxes) == 0:
        return [], [], []

    n = len(boxes)
    if n == 1:
        return [], [], [0]

    # Ground feet positions and body heights
    feet = np.column_stack([(boxes[:, 0] + boxes[:, 2]) / 2.0, boxes[:, 3]])
    heights = np.maximum(10.0, boxes[:, 3] - boxes[:, 1])

    # Perspective-adaptive proximity: threshold scales with person height in frame
    dist_matrix = np.linalg.norm(feet[:, None, :] - feet[None, :, :], axis=-1)
    height_avg_matrix = (heights[:, None] + heights[None, :]) / 2.0
    thresh_matrix = height_avg_matrix * 0.85

    adj = dist_matrix <= thresh_matrix

    # Connected components using fast BFS (zero extra dependencies)
    visited = set()
    dense_clusters: List[List[int]] = []
    gatherings: List[List[int]] = []
    isolated: List[int] = []

    for i in range(n):
        if i not in visited:
            cluster = []
            queue = [i]
            visited.add(i)
            while queue:
                curr = queue.pop(0)
                cluster.append(curr)
                for neighbor in range(n):
                    if neighbor not in visited and adj[curr, neighbor]:
                        visited.add(neighbor)
                        queue.append(neighbor)

            k = len(cluster)
            if k >= 6:
                dense_clusters.append(cluster)
            elif k >= 3:
                gatherings.append(cluster)
            else:
                isolated.extend(cluster)

    return dense_clusters, gatherings, isolated


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
    fps: float = 0.0,
    show_heatmap: bool = True,
    show_clusters: bool = True,
    dense_clusters: Optional[List[List[int]]] = None,
    gatherings: Optional[List[List[int]]] = None,
    isolated: Optional[List[int]] = None,
) -> Tuple[np.ndarray, int, int, int]:
    """
    Renders high-tech futuristic pedestrian bounding boxes, continuous 2D thermal
    ground density heatmaps, and perspective-scaled density-aware spatial cluster hulls/huddles.
    Returns:
        (annotated_frame, dense_clusters_count, gatherings_count, isolated_count)
    """
    h, w = frame.shape[:2]
    annotated = frame.copy()

    # 1. Apply Dynamic Ground Density Heatmap Glow
    if show_heatmap and boxes is not None and len(boxes) > 0:
        annotated = apply_ground_density_heatmap(annotated, boxes)

    # 2. Compute Clusters if enabled and not already provided
    if boxes is not None and len(boxes) > 0:
        if dense_clusters is None or gatherings is None or isolated is None:
            dense_clusters, gatherings, isolated = detect_spatial_clusters(boxes)
    else:
        dense_clusters, gatherings, isolated = [], [], []

    # Futuristic palette (BGR)
    if is_crowd:
        theme_color = (48, 62, 235)       # Amber-Red surge alert
        bracket_color = (90, 110, 255)
        tag_bg = (30, 36, 180)
    else:
        theme_color = (235, 180, 50)      # High-tech Electric Cyan (BGR)
        bracket_color = (255, 220, 120)
        tag_bg = (160, 90, 15)

    # 3. Draw Spatial Clusters (Polygons & Gathering Boxes)
    if show_clusters and boxes is not None and len(boxes) > 0:
        # A. High-Density Crowd Clusters (Red/Orange Convex Hull Polygons)
        for cluster in dense_clusters:
            pts = []
            for idx in cluster:
                b = boxes[idx]
                pts.extend([
                    [b[0], b[3]],
                    [b[2], b[3]],
                    [b[0], (b[1] + b[3]) / 2.0],
                    [b[2], (b[1] + b[3]) / 2.0]
                ])
            hull = cv2.convexHull(np.array(pts, dtype=np.int32))

            poly_overlay = annotated.copy()
            cv2.fillPoly(poly_overlay, [hull], (20, 45, 220))  # Translucent Red-Orange fill
            cv2.addWeighted(poly_overlay, 0.35, annotated, 0.65, 0, annotated)
            cv2.polylines(annotated, [hull], isClosed=True, color=(30, 50, 240), thickness=2, lineType=cv2.LINE_AA)

            min_idx = np.argmin(hull[:, 0, 1])
            top_x, top_y = hull[min_idx][0]
            badge_text = f"crowd_density_high ({len(cluster)})"
            (tw, th), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)
            badge_y = max(th + 6, top_y - 6)
            cv2.rectangle(annotated, (top_x, badge_y - th - 4), (top_x + tw + 8, badge_y + 4), (20, 30, 200), -1)
            cv2.rectangle(annotated, (top_x, badge_y - th - 4), (top_x + tw + 8, badge_y + 4), (30, 50, 240), 1)
            cv2.putText(annotated, badge_text, (top_x + 4, badge_y - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)

        # B. Abnormal Gatherings (Royal Blue / Amber Bounding Boxes)
        for cluster in gatherings:
            cluster_boxes = boxes[cluster]
            min_x = int(np.min(cluster_boxes[:, 0]))
            min_y = int(np.min(cluster_boxes[:, 1]))
            max_x = int(np.max(cluster_boxes[:, 2]))
            max_y = int(np.max(cluster_boxes[:, 3]))

            box_overlay = annotated.copy()
            cv2.rectangle(box_overlay, (min_x, min_y), (max_x, max_y), (235, 120, 20), -1)
            cv2.addWeighted(box_overlay, 0.15, annotated, 0.85, 0, annotated)
            cv2.rectangle(annotated, (min_x, min_y), (max_x, max_y), (235, 120, 20), 2, cv2.LINE_AA)

            badge_text = f"abnormal_gathering ({len(cluster)})"
            (tw, th), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)
            badge_y = max(th + 6, min_y - 6)
            cv2.rectangle(annotated, (min_x, badge_y - th - 4), (min_x + tw + 8, badge_y + 4), (200, 100, 15), -1)
            cv2.rectangle(annotated, (min_x, badge_y - th - 4), (min_x + tw + 8, badge_y + 4), (235, 120, 20), 1)
            cv2.putText(annotated, badge_text, (min_x + 4, badge_y - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)

    # 4. Bounding Boxes with futuristic corner brackets on individual pedestrians
    if boxes is not None and len(boxes) > 0:
        for idx, (box, conf) in enumerate(zip(boxes, confidences)):
            x1, y1, x2, y2 = box.astype(int)
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w - 1, x2), min(h - 1, y2)
            bw, bh = x2 - x1, y2 - y1

            # Individual bounding color reflects isolation or crowd density
            if show_clusters and idx in isolated:
                curr_color = (60, 180, 75)       # Crisp Green for isolated pedestrians
                curr_bracket = (100, 220, 120)
                curr_bg = (40, 140, 50)
            else:
                curr_color = theme_color
                curr_bracket = bracket_color
                curr_bg = tag_bg

            # Thin bounding rectangle
            cv2.rectangle(annotated, (x1, y1), (x2, y2), curr_color, 1, cv2.LINE_AA)

            # High-tech corner brackets
            corner_len = max(6, min(14, int(min(bw, bh) * 0.25)))
            # Top-left
            cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), curr_bracket, 2, cv2.LINE_AA)
            cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), curr_bracket, 2, cv2.LINE_AA)
            # Top-right
            cv2.line(annotated, (x2, y1), (x2 - corner_len, y1), curr_bracket, 2, cv2.LINE_AA)
            cv2.line(annotated, (x2, y1), (x2, y1 + corner_len), curr_bracket, 2, cv2.LINE_AA)
            # Bottom-left
            cv2.line(annotated, (x1, y2), (x1 + corner_len, y2), curr_bracket, 2, cv2.LINE_AA)
            cv2.line(annotated, (x1, y2), (x1, y2 - corner_len), curr_bracket, 2, cv2.LINE_AA)
            # Bottom-right
            cv2.line(annotated, (x2, y2), (x2 - corner_len, y2), curr_bracket, 2, cv2.LINE_AA)
            cv2.line(annotated, (x2, y2), (x2, y2 - corner_len), curr_bracket, 2, cv2.LINE_AA)

            # Compact confidence badge
            tag = f"P {conf:.2f}"
            (tw, th), _ = cv2.getTextSize(tag, cv2.FONT_HERSHEY_SIMPLEX, 0.38, 1)
            tag_y1 = max(0, y1 - th - 6)
            tag_y2 = max(th + 6, y1)
            cv2.rectangle(annotated, (x1, tag_y1), (x1 + tw + 6, tag_y2), curr_bg, -1)
            cv2.rectangle(annotated, (x1, tag_y1), (x1 + tw + 6, tag_y2), curr_color, 1)
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

    # 5. Optional HUD banner
    if show_hud:
        hud_height = max(70, int(h * 0.10))
        overlay = annotated.copy()
        cv2.rectangle(overlay, (0, 0), (w, hud_height), (18, 18, 24), -1)
        cv2.addWeighted(overlay, 0.85, annotated, 0.15, 0, annotated)
        cv2.line(annotated, (0, hud_height), (w, hud_height), theme_color, 2)

        scale_sub = max(0.45, min(0.70, w / 1280))
        metrics_str = (
            f"People: {person_count:3d} | Density: {density_per_mp:5.1f}/MP | "
            f"Dense: {len(dense_clusters)} | Gather: {len(gatherings)} | FPS: {fps:4.1f}"
        )
        cv2.putText(annotated, metrics_str, (20, int(hud_height * 0.65)), cv2.FONT_HERSHEY_SIMPLEX, scale_sub, (220, 225, 230), 1, cv2.LINE_AA)

    return annotated, len(dense_clusters), len(gatherings), len(isolated)


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
