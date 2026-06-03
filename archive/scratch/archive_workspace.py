import os
import shutil

workspace = r"d:\gemini-lo-taro"
archive_dir = os.path.join(workspace, "archive")
os.makedirs(archive_dir, exist_ok=True)

# List of files in root to archive
files_to_archive = [
    "ChatGPT Image 2026年6月3日 00_20_01.png",
    "ChatGPT Image 2026年6月3日 00_22_47.png",
    "bg_desktop.webp",
    "bg_desktop_clean.webp",
    "bg_mobile.webp",
    "bg_mobile_clean.webp",
    "ohzi_source.html",
    "ohzi_style.css",
    "ohzi-design-analysis.md"
]

# List of directories to archive
dirs_to_archive = [
    "cutouts"
]

print("Archiving files...")
for f in files_to_archive:
    src = os.path.join(workspace, f)
    dst = os.path.join(archive_dir, f)
    if os.path.exists(src):
        try:
            shutil.move(src, dst)
            print(f"  Moved file: {f} -> archive/{f}")
        except Exception as e:
            print(f"  Failed to move file {f}: {e}")
    else:
        print(f"  File not found: {f}")

print("\nArchiving directories...")
for d in dirs_to_archive:
    src = os.path.join(workspace, d)
    dst = os.path.join(archive_dir, d)
    if os.path.exists(src):
        try:
            if os.path.exists(dst):
                # Remove destination if it already exists to prevent error
                shutil.rmtree(dst)
            shutil.move(src, dst)
            print(f"  Moved directory: {d} -> archive/{d}")
        except Exception as e:
            print(f"  Failed to move directory {d}: {e}")
    else:
        print(f"  Directory not found: {d}")

print("\nArchiving scratch directory content...")
# Create scratch folder inside archive
archive_scratch = os.path.join(archive_dir, "scratch")
os.makedirs(archive_scratch, exist_ok=True)
scratch_src = os.path.join(workspace, "scratch")

# We move everything in scratch except the current running script if possible, or just copy/move files
for item in os.listdir(scratch_src):
    if item == "archive_workspace.py":
        continue
    item_src = os.path.join(scratch_src, item)
    item_dst = os.path.join(archive_scratch, item)
    try:
        if os.path.exists(item_dst):
            if os.path.isdir(item_dst):
                shutil.rmtree(item_dst)
            else:
                os.remove(item_dst)
        shutil.move(item_src, item_dst)
        print(f"  Moved scratch item: {item} -> archive/scratch/{item}")
    except Exception as e:
        print(f"  Failed to move scratch item {item}: {e}")
