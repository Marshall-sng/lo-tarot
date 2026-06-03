import os

scratch_dir = "d:\\gemini-lo-taro\\scratch"
for root, dirs, files in os.walk(scratch_dir):
    for f in files:
        filepath = os.path.join(root, f)
        size = os.path.getsize(filepath)
        print(f"File: {os.path.relpath(filepath, scratch_dir)} (Size: {size} bytes)")
        if f.endswith(".html") or f.endswith(".css") or f.endswith(".js"):
            # print first 100 characters and last 100 characters
            with open(filepath, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                print(f"  First 100: {repr(content[:100])}")
                print(f"  Last 100:  {repr(content[-100:])}")
                print("  Truncated?", "truncated" in content or "..." in content[-10:])
            print("-" * 50)
