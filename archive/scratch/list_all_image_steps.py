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
            # Match generate_image or arguments containing image names
            if "generate_image" in name or "bg_desktop" in str(args) or "bg_mobile" in str(args):
                print(f"Step {step_index}: tool={name}, keys in args: {list(args.keys())}")
                if "Prompt" in args:
                    print(f"  Prompt: {args['Prompt']}")
                if "TargetFile" in args:
                    print(f"  TargetFile: {args['TargetFile']}")
