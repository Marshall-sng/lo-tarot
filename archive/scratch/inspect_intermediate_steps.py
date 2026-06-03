import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except:
            continue
        
        step_index = d.get("step_index")
        if 95 < step_index < 162:
            tool_calls = d.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name")
                args = tc.get("args") or {}
                target = args.get("TargetFile", "")
                if any(x in target for x in ("index.html", "style.css", "app.js")):
                    print(f"Step {step_index}: {name} on {target}")
                    print(f"  Description: {args.get('Description')}")
                    print(f"  Instruction: {args.get('Instruction')}")
                    print("-" * 50)
