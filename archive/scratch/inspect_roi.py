import cv2
import numpy as np

img = cv2.imread("bg_desktop.webp")
if img is not None:
    # TL clock region
    cx, cy = 193, 193
    r = 160
    roi = img[cy-r:cy+r, cx-r:cx+r]
    # Calculate luminance
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    print("ROI shape:", roi.shape)
    print("Gray min:", np.min(gray), "max:", np.max(gray), "mean:", np.mean(gray))
    # Print percentile thresholds
    for p in [10, 25, 50, 75, 90, 95]:
        print(f"{p}th percentile of gray:", np.percentile(gray, p))
else:
    print("Failed to load bg_desktop.webp")
