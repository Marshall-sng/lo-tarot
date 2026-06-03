import json
import os

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"
history_dir = r"d:\gemini-lo-taro\scratch\all_history"
os.makedirs(history_dir, exist_ok=True)

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except Exception as e:
            continue
        
        step_index = d.get("step_index")
        tool_calls = d.get("tool_calls", [])
        for tc in tool_calls:
            name = tc.get("name")
            args = tc.get("args") or {}
            
            if name in ("replace_file_content", "write_to_file", "multi_replace_file_content"):
                target = args.get("TargetFile", "")
                if any(x in target for x in ("index.html", "style.css", "app.js")):
                    desc = args.get("Description", "")
                    instr = args.get("Instruction", "")
                    print(f"Step {step_index}: {name} targeting {os.path.basename(target)}")
                    print(f"  Description: {desc}")
                    print(f"  Instruction: {instr}")
                    
                    # Save details
                    base_name = os.path.basename(target).replace('"', '').replace("'", "").strip()
                    step_prefix = f"step_{step_index}_{base_name}"
                    # Write metadata + contents
                    with open(os.path.join(history_dir, f"{step_prefix}.json"), "w", encoding="utf-8") as out:
                        json.dump(args, out, indent=2, ensure_ascii=False)
                    print(f"  Saved metadata & content to {step_prefix}.json")
