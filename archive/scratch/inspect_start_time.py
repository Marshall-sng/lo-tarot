import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
            print(f"Step {d.get('step_index')}: created_at={d.get('created_at')}, source={d.get('source')}, type={d.get('type')}")
            # print first 5 steps
            if d.get("step_index") and d.get("step_index") > 5:
                break
        except Exception as e:
            print(e)
            continue
