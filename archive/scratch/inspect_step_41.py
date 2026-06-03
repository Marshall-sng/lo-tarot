import json

with open("d:\\gemini-lo-taro\\scratch\\all_history\\step_41_style.css.json", "r", encoding="utf-8") as f:
    data = json.load(f)

code = data.get("CodeContent", "")
print("Code content length:", len(code))
# Find body style or background style in step 41 style.css
for line in code.splitlines():
    if "body" in line or "background" in line or "url(" in line:
        print("  ", line.strip())
