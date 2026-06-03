with open("d:\\gemini-lo-taro\\app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

# Find occurrences of card class or card title properties
keywords = ["card-symbol", "card-lo-title", "card-en-title", "card-front", "drawnCards", "showCardReveal"]

print("Scanning app.js for card rendering logic...")
for kw in keywords:
    matches = list(re.finditer(kw, js))
    print(f"Keyword '{kw}': {len(matches)} occurrences")
    for m in matches[:3]:
        start = max(0, m.start() - 60)
        end = min(len(js), m.end() + 60)
        snippet = js[start:end].replace("\n", " ")
        print(f"  Snippet: ...{snippet}...")
print("-" * 50)
