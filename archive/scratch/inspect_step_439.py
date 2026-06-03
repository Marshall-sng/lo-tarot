import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except:
            continue
        
        step_index = d.get("step_index")
        if step_index in (439, 440, 441):
            print(f"Step {step_index}: source={d.get('source')}, type={d.get('type')}")
            for k in ("output", "content", "tool_calls"):
                if k in d:
                    print(f"  {k}: {repr(d[k])[:300]}")
            print("-" * 50)
