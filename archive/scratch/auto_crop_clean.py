"import os
import cv2
import numpy as np
from PIL import Image

def detect_and_crop():
    # 载入宽屏底图
    desktop_path = "bg_desktop.webp"
    mobile_path = "bg_mobile.webp"
    
    if not os.path.exists(desktop_path) or not os.path.exists(mobile_path):
        print("Required background images not found!")
        return

    # 1. 处理宽屏版 bg_desktop.webp (1672 x 941)
    img_desktop = cv2.imread(desktop_path)
    h, w, c = img_desktop.shape
    print(f"Loaded bg_desktop.webp: {w}x{h}")

    # 将图像转换为灰度图
    gray = cv2.cvtColor(img_desktop, cv2.COLOR_BGR2GRAY)
    
    # 阈值化以找到高亮（金色）线条区域
    _, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY)

    # 准备保存抠图结果的文件夹
    os.makedirs("cutouts", exist_ok=True)

    # 裁剪半径
    radius = 160
    box_size = radius * 2

    # A. 自动检测四角时钟中心 (在各角的 400x400 范围内寻找高亮物体的重心)
    corners = {
        "tl": (0, 400, 0, 400),
        "tr": (w - 400, w, 0, 400),
        "bl": (0, 400, h - 400, h),
        "br": (w - 400, w, h - 400, h)
    }

    centers = {}
    for key, (x1, x2, y1, y2) in corners.items():
        # 获取角的局部阈值图
        roi = thresh[y1:y2, x1:x2]
        # 计算质心 (Moments)
        M = cv2.moments(roi)
        if M["m00"] != 0:
            cx = int(M["m10"] / M["m00"]) + x1
            cy = int(M["m01"] / M["m00"]) + y1
        else:
            # 备用估算中心
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2
        centers[key] = (cx, cy)
        print(f"Detected clock '{key}' center at: ({cx}, {cy})")

    # B. 检测中心天秤质心 (在图像中央 500x500 范围内)
    cx_mid, cy_mid = w // 2, h // 2
    roi_mid = thresh[cy_mid - 250:cy_mid + 250, cx_mid - 250:cx_mid + 250]
    M_mid = cv2.moments(roi_mid)
    if M_mid["m00"] != 0:
        scales_cx = int(M_mid["m10"] / 
<truncated 7796 bytes>