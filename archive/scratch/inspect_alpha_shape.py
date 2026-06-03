import cv2
import numpy as np
import os

dir_path = "d:\\gemini-lo-taro\\cutouts"
for f in os.listdir(dir_path):
    if f.endswith(".png"):
        img = cv2.imread(os.path.join(dir_path, f), cv2.IMREAD_UNCHANGED)
        if img is None or img.shape[2] < 4:
            continue
        alpha = img[:, :, 3]
        h, w = alpha.shape
        # Count non-transparent pixels in rows
        row_counts = np.sum(alpha > 10, axis=1)
        col_counts = np.sum(alpha > 10, axis=0)
        print(f"{f}: row_counts non-zero min={np.min(row_counts)}, max={np.max(row_counts)}, mean={np.mean(row_counts):.1f}")
        # Let's see if the alpha shape is a square block. For example, is there a sub-rectangle that is fully opaque or filled?
        # Let's find the bounding box of non-transparent pixels
        coords = np.argwhere(alpha > 10)
        if coords.size > 0:
            y_min, x_min = coords.min(axis=0)
            y_max, x_max = coords.max(axis=0)
            print(f"  Bounding box of alpha > 10: X [{x_min} to {x_max}] (w={x_max-x_min+1}), Y [{y_min} to {y_max}] (h={y_max-y_min+1})")
        else:
            print("  Empty alpha channel!")
