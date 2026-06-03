with open("d:\\gemini-lo-taro\\app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re

keywords = ["parallax", "bg-", "clock", "scales", "aspect", "magic"]
print("Scanning app.js for remnants...")
for kw in keywords:
    matches = list(re.finditer(kw, js, re.IGNORECASE))
    print(f"Keyword '{kw}': {len(matches)} occurrences")
    for m in matches[:5]:
        start = max(0, m.start() - 30)
        end = min(len(js), m.end() + 30)
        snippet = js[start:end].replace("\n", " ")
        print(f"  Snippet: ...{snippet}...")
print("-" * 50)
