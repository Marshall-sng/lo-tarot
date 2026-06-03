import os

for filename in ("index_original.html", "style_original.css"):
    path = os.path.join("d:\\gemini-lo-taro\\scratch", filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        print(f"File: {filename}, size: {len(content)} characters")
        print("Contains 'truncated'?", "truncated" in content.lower())
        print("First 200 chars:\n", content[:200])
        print("Last 200 chars:\n", content[-200:])
        print("-" * 50)
