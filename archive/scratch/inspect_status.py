import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except:
            continue
        
        step_index = d.get("step_index")
        if step_index in (33, 34, 35, 36, 41, 42):
            print(f"Step {step_index}: source={d.get('source')}, type={d.get('type')}, status={d.get('status')}")
            if "error" in d:
                print(f"  Error: {d.get('error')}")
            if "output" in d:
                out_str = str(d.get("output"))
                print(f"  Output len: {len(out_str)}")
                print(f"  Output preview: {out_str[:200]}")
