import json

transcript_path = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\logs\transcript.jsonl"

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            d = json.loads(line)
        except:
            continue
        
        step_index = d.get("step_index")
        if step_index in (11, 12, 19, 20):
            # Check if '<truncated' is in the json representation of the step
            s = json.dumps(d)
            print(f"Step {step_index}: has '<truncated': {'<truncated' in s}")
            print(f"Step {step_index} keys: {list(d.keys())}")
            if "content" in d:
                print(f"  Content len: {len(d['content'])}")
                print(f"  Content start: {repr(d['content'][:100])}")
            if "output" in d:
                print(f"  Output len: {len(d['output'])}")
                print(f"  Output start: {repr(d['output'][:100])}")
