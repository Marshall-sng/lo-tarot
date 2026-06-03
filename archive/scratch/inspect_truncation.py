import os
import json

history_dir = r"d:\gemini-lo-taro\scratch\all_history"

with open(os.path.join(history_dir, "step_35_index.html.json"), "r", encoding="utf-8") as f:
    data = json.load(f)

code = data.get("CodeContent", "")
print("CodeContent Length:", len(code))
print("Last 300 characters of CodeContent:")
print(repr(code[-300:]))
print("Does it end with truncation or ellipsis?", code.endswith("...") or "truncated" in code)
