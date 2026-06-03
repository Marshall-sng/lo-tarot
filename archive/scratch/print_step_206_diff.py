import json
import difflib

with open("d:\\gemini-lo-taro\\scratch\\all_history\\step_206_app.js.json", "r", encoding="utf-8") as f:
    data = json.load(f)

target = data.get("TargetContent", "")
replacement = data.get("ReplacementContent", "")

print("=== TargetContent (Step 95 original) ===")
print(target[:1500])
print("...")
print("=== ReplacementContent (Step 206 new) ===")
print(replacement[:1500])
print("...")

# Let's do a diff
diff = list(difflib.unified_diff(
    target.splitlines(),
    replacement.splitlines(),
    fromfile='Original (Step 95)',
    tofile='Modified (Step 206)'
))
print("\n=== Unified Diff ===")
for line in diff[:60]:
    print(line)
