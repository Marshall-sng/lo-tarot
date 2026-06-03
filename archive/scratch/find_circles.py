import cv2
import numpy as np

def locate_circle(img, cx_guess, cy_guess, search_r=200, min_r=130, max_r=170):
    # Crop a region around guess
    y1 = max(0, cy_guess - search_r)
    y2 = min(img.shape[0], cy_guess + search_r)
    x1 = max(0, cx_guess - search_r)
    x2 = min(img.shape[1], cx_guess + search_r)
    
    roi = img[y1:y2, x1:x2]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(gray, (9, 9), 2)
    
    # Use HoughCircles to find circles
    circles = cv2.HoughCircles(
        blurred, 
        cv2.HOUGH_GRADIENT, 
        dp=1.2, 
        minDist=100, 
        param1=50, 
        param2=30, 
        minRadius=min_r, 
        maxRadius=max_r
    )
    
    if circles is not None:
        circles = np.round(circles[0, :]).astype("int")
        # Find the one closest to center of ROI
        roi_cx, roi_cy = search_r, search_r
        best_circle = None
        min_dist = float('inf')
        for (cx, cy, r) in circles:
            dist = np.sqrt((cx - roi_cx)**2 + (cy - roi_cy)**2)
            if dist < min_dist:
                min_dist = dist
                best_circle = (cx + x1, cy + y1, r)
        return best_circle
    
    # Fallback to threshold and contour centroid
    _, thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        # Find contour with largest area that matches expected size
        best_cnt = None
        max_area = 0
        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Circle area with radius 150 is approx 70000
            if 30000 < area < 90000:
                if area > max_area:
                    max_area = area
                    best_cnt = cnt
        if best_cnt is not None:
            M = cv2.moments(best_cnt)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"]) + x1
                cy = int(M["m01"] / M["m00"]) + y1
                # Find approximate radius
                rect = cv2.minAreaRect(best_cnt)
                r = int((rect[1][0] + rect[1][1]) / 4)
                return (cx, cy, r)
                
    return None

# Load images
img_desktop = cv2.imread("bg_desktop.webp")
img_mobile = cv2.imread("bg_mobile.webp")

print("--- DESKTOP CIRCLES ---")
desktop_guesses = {
    "tl": (193, 193),
    "tr": (1476, 192),
    "bl": (196, 741),
    "br": (1471, 740)
}
for name, (gx, gy) in desktop_guesses.items():
    res = locate_circle(img_desktop, gx, gy)
    print(f"Desktop {name}: guess=({gx},{gy}), detected={res}")

print("--- MOBILE CIRCLES ---")
mobile_guesses = {
    "tl": (162, 184),
    "tr": (771, 184),
    "bl": (162, 1496),
    "br": (776, 1498)
}
for name, (gx, gy) in mobile_guesses.items():
    res = locate_circle(img_mobile, gx, gy)
    print(f"Mobile {name}: guess=({gx},{gy}), detected={res}")
