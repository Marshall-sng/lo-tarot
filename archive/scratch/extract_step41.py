import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except:
            continue
        
        step_index = d.get("step_index")
        if step_index == 41:
            tool_calls = d.get("tool_calls", [])
            for tc in tool_calls:
                args = tc.get("args") or {}
                code = args.get("CodeContent")
                if code:
                    print(f"Found code content in step 41, len={len(code)}")
                    if "<truncated" in code:
                        print("Warning: Code content is truncated in logs!")
                    with open("scratch/style_step41.css", "w", encoding="utf-8") as out:
                        out.write(code)
                    print("Saved to scratch/style_step41.css")
                    break
