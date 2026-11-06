# Vigilo Vision & Crowd Density AI Models

This directory contains the machine learning weights and classifier pipelines:

1. **`best.pt`** (~131 MB)
   - Custom YOLO26m model fine-tuned for high-density pedestrian & crowd bounding detection.
   - Note: Because GitHub limits direct file pushes to 100 MB, `best.pt` is stored locally or distributed via release assets / external model bucket.

2. **`crowd_random_forest_v1.pkl`** (~10.2 MB)
   - Trained Scikit-Learn Random Forest Classifier that computes probability of crowd surges based on 21 scene-level spatial & density features.
   - Outputs binary classification (`0` = Normal density, `1` = Crowd Alert) with continuous probability scores.
