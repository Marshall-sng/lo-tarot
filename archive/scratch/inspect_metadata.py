import os
from PIL import Image

image_dir = r"C:\Users\Dante\Desktop\lo"
files = sorted([f for f in os.listdir(image_dir) if f.lower().endswith(".png")])

print(f"Inspecting metadata for {len(files)} files...")

for idx, f in enumerate(files):
    path = os.path.join(image_dir, f)
    try:
        with Image.open(path) as img:
            info = img.info
            print(f"\n[{idx:02d}] Filename: {f}")
            if info:
                print("  Metadata keys:", list(info.keys()))
                for k, v in info.items():
                    # Print first 200 chars of each metadata value
                    val_str = str(v)
                    if len(val_str) > 200:
                        val_str = val_str[:200] + "..."
                    print(f"    {k}: {val_str}")
            else:
                print("  No metadata found.")
    except Exception as e:
        print(f"  Error reading {f}: {e}")
