import cv2
import numpy as np

img_orig = cv2.imread("bg_desktop.webp")
img_clean = cv2.imread("bg_desktop_clean.webp")

if img_orig is not None and img_clean is not None:
    print("bg_desktop size:", img_orig.shape)
    print("bg_desktop_clean size:", img_clean.shape)
    # Check the top-left area
    diff = cv2.absdiff(img_orig[0:400, 0:400], img_clean[0:400, 0:400])
    mean_diff = np.mean(diff)
    print("Top-left area difference mean:", mean_diff)
else:
    print("Failed to load background images")
