import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except:
            continue
        
        step_index = d.get("step_index")
        if step_index > 150:
            tool_calls = d.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name")
                args = tc.get("args") or {}
                target = args.get("TargetFile", "")
                if "index.html" in target:
                    print(f"Step {step_index}: {name} on index.html")
                    if name == "replace_file_content":
                        print(f"  Lines: {args.get('StartLine')}-{args.get('EndLine')}")
                        print(f"  Target: {repr(args.get('TargetContent'))}")
                        print(f"  Replacement: {repr(args.get('ReplacementContent'))}")
                    elif name == "multi_replace_file_content":
                        chunks = args.get("ReplacementChunks", [])
                        for idx, chunk in enumerate(chunks):
                            print(f"    Chunk {idx}: {chunk.get('StartLine')}-{chunk.get('EndLine')}")
                            print(f"      Target: {repr(chunk.get('TargetContent'))}")
                            print(f"      Replacement: {repr(chunk.get('ReplacementContent'))}")
                    elif name == "write_to_file":
                        print(f"  Content len: {len(args.get('CodeContent', ''))}")
