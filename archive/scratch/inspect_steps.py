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
            if step_index == 33:
                print("Step 33 details:")
                for k, v in args.items():
                    print(f"  {k}: type={type(v)}, len={len(str(v)) if v else 0}")
                    if k in ("TargetContent", "ReplacementContent"):
                        print(f"    Preview: {str(v)[:200]}")
                        
            if step_index == 35:
                print("Step 35 details:")
                for k, v in args.items():
                    print(f"  {k}: type={type(v)}, len={len(str(v)) if v else 0}")
                    if k == "CodeContent":
                        print(f"    Preview: {str(v)[:200]}")
                        
            if step_index == 41:
                print("Step 41 details:")
                for k, v in args.items():
                    print(f"  {k}: type={type(v)}, len={len(str(v)) if v else 0}")
                    if k == "CodeContent":
                        print(f"    Preview: {str(v)[:200]}")
