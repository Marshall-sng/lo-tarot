import os
import time

image_dir = r"C:\Users\Dante\Desktop\lo"
files = [f for f in os.listdir(image_dir) if f.lower().endswith(".png")]

# Get files with their modification times
file_mtimes = []
for f in files:
    path = os.path.join(image_dir, f)
    mtime = os.path.getmtime(path)
    file_mtimes.append((f, mtime))

# Sort by mtime
file_mtimes.sort(key=lambda x: x[1])

print("Files sorted by Modification Time:")
for idx, (f, mtime) in enumerate(file_mtimes):
    print(f"  {idx:02d}: {f} (mtime={time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(mtime))})")
