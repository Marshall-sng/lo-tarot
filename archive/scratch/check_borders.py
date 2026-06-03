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
        # Check border alpha
        top = alpha[0, :]
        bottom = alpha[h-1, :]
        left = alpha[:, 0]
        right = alpha[:, w-1]
        border = np.concatenate([top, bottom, left, right])
        opaque_border_ratio = np.sum(border > 10) / border.size
        print(f"{f}: border size={border.size}, opaque (>10) pixels in border={np.sum(border > 10)} ({opaque_border_ratio*100:.1f}%), max border alpha={np.max(border)}")
