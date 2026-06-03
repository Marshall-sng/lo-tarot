import json

with open("d:\\gemini-lo-taro\\scratch\\all_history\\step_45_app.js.json", "r", encoding="utf-8") as f:
    data = json.load(f)

code = data.get("CodeContent", "")
print("Step 45 app.js length:", len(code))
# Find class Starfield contents
for line in code.splitlines()[:100]:
    print(line)
