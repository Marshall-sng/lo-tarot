import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except:
            continue
        
        step_index = d.get("step_index")
        if step_index <= 50:
            tool_calls = d.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name")
                args = tc.get("args") or {}
                if "style.css" in str(args):
                    print(f"Step {step_index}: Call '{name}' with args {args}")
            # Check content
            content = d.get("content", "")
            if "style.css" in content and len(content) > 1000:
                print(f"Step {step_index} content contains style.css, len={len(content)}")
