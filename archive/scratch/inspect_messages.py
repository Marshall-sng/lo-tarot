import json
import os

messages_dir = r"C:\Users\Dante\.gemini\antigravity\brain\dc4bbabf-ccc7-4041-b7fd-846ae5f2a793\.system_generated\messages"

for f_name in os.listdir(messages_dir):
    if f_name.endswith(".json") and f_name != "cursor.json" and f_name != "read.json":
        f_path = os.path.join(messages_dir, f_name)
        print(f"File: {f_name} (size: {os.path.getsize(f_path)})")
        try:
            with open(f_path, 'r', encoding='utf-8') as f:
                d = json.load(f)
                # Print keys
                print("  Keys:", list(d.keys()))
                # If there's content or message, print a snippet
                if "content" in d:
                    print(f"  Content length: {len(d['content'])}")
                    print(f"  Content start: {repr(d['content'][:200])}")
        except Exception as e:
            print("  Error reading:", e)
