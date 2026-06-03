import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except:
            continue
        
        step_index = d.get("step_index")
        tool_calls = d.get("tool_calls", [])
        for tc in tool_calls:
            name = tc.get("name")
            args = tc.get("args") or {}
            # Let's print details of writes and replaces up to step 200
            if step_index <= 200 and name in ("replace_file_content", "write_to_file"):
                target = args.get("TargetFile", "")
                if "index.html" in target or "style.css" in target:
                    desc = args.get("Description", "")
                    instr = args.get("Instruction", "")
                    print(f"Step {step_index}: {name} on {target}")
                    print(f"  Description: {desc}")
                    print(f"  Instruction: {instr}")
                    # Let's write the code content or replacement content to a temporary scratch file to inspect if needed
                    # e.g., scratch/step_<index>_<basename>
                    base = "index.html" if "index.html" in target else "style.css"
                    import os
                    os.makedirs("scratch/history", exist_ok=True)
                    content = args.get("CodeContent") or args.get("ReplacementContent") or ""
                    with open(f"scratch/history/step_{step_index}_{base}", "w", encoding="utf-8") as out:
                        out.write(content)
                    print(f"  Saved to scratch/history/step_{step_index}_{base} (size: {len(content)})")
