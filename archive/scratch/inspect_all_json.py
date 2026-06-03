import os
import json

history_dir = r"d:\gemini-lo-taro\scratch\all_history"
files = sorted(os.listdir(history_dir))

for f in files:
    if not f.endswith(".json"):
        continue
    filepath = os.path.join(history_dir, f)
    with open(filepath, "r", encoding="utf-8") as file:
        data = json.load(file)
    
    # print step, file, type, and keys
    step = f.split("_")[1]
    name = f.split("_", 2)[2].replace(".json", "")
    code_len = len(data.get("CodeContent", ""))
    repl_len = len(data.get("ReplacementContent", ""))
    chunks_len = len(data.get("ReplacementChunks", []))
    print(f"Step {step} - {name}: code={code_len}, repl={repl_len}, chunks={chunks_len}")
