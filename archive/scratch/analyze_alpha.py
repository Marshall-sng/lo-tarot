import cv2
import numpy as np
import os

dir_path = "d:\\gemini-lo-taro\\cutouts"
for f in os.listdir(dir_path):
    if f.endswith(".png"):
        img = cv2.imread(os.path.join(dir_path, f), cv2.IMREAD_UNCHANGED)
        if img is None:
            print(f, "failed to load")
            continue
        if img.shape[2] < 4:
            print(f, "has no alpha channel! channels:", img.shape[2])
            continue
        alpha = img[:, :, 3]
        total_pixels = alpha.size
        transparent = np.sum(alpha == 0)
        opaque = np.sum(alpha == 255)
        semi = total_pixels - transparent - opaque
        print(f"{f}: shape={img.shape}, transparent={transparent} ({transparent/total_pixels*100:.1f}%), opaque={opaque} ({opaque/total_pixels*100:.1f}%), semi={semi} ({semi/total_pixels*100:.1f}%)")
