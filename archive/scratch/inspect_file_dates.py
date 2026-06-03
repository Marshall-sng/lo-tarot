import os
import time

files = [
    "index.html", "style.css", "app.js", "data.js", "test.js",
    "bg_desktop.webp", "bg_desktop_clean.webp", "bg_mobile.webp", "bg_mobile_clean.webp",
    "ChatGPT Image 2026年6月3日 00_20_01.png", "ChatGPT Image 2026年6月3日 00_22_47.png"
]

print("File modifications times:")
for f in files:
    if os.path.exists(f):
        mtime = os.path.getmtime(f)
        size = os.path.getsize(f)
        print(f"  {f}: size={size} bytes, mtime={time.ctime(mtime)}")
    else:
        print(f"  {f}: NOT FOUND")
