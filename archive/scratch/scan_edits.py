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
            if name in ("replace_file_content", "multi_replace_file_content", "write_to_file"):
                target = args.get("TargetFile", "")
                if "index.html" in target or "style.css" in target:
                    # Print the details of this change
                    print(f"Step {step_index}: {name} to {target}")
                    if name == "replace_file_content":
                        print(f"  Lines: {args.get('StartLine')}-{args.get('EndLine')}")
                        print(f"  Target: {repr(args.get('TargetContent'))[:100]}")
                        print(f"  Replacement: {repr(args.get('ReplacementContent'))[:100]}")
                    elif name == "multi_replace_file_content":
                        chunks = args.get("ReplacementChunks", [])
                        print(f"  Multi-chunks: {len(chunks)} chunks")
                        for idx, chunk in enumerate(chunks):
                            print(f"    Chunk {idx}: lines {chunk.get('StartLine')}-{chunk.get('EndLine')}")
                            print(f"      Target: {repr(chunk.get('TargetContent'))[:100]}")
                            print(f"      Replacement: {repr(chunk.get('ReplacementContent'))[:100]}")
                    elif name == "write_to_file":
                        print(f"  Overwrite: {args.get('Overwrite')}")
                        print(f"  Content length: {len(args.get('CodeContent', ''))}")
