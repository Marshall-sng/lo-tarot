import os
import json

history_dir = r"d:\gemini-lo-taro\scratch\all_history"

for filename in ("step_35_index.html.json", "step_41_style.css.json", "step_45_app.js.json"):
    filepath = os.path.join(history_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"=== {filename} ===")
        print(f"TargetFile: {data.get('TargetFile')}")
        print(f"Overwrite: {data.get('Overwrite')}")
        code = data.get("CodeContent", "")
        print(f"CodeContent Length: {len(code)}")
        print(f"CodeContent Preview:\n{code[:300]}")
        print("-" * 50)
