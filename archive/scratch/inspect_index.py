with open("d:\\gemini-lo-taro\\index.html", "r", encoding="utf-8") as f:
    html = f.read()

import re

keywords = ["parallax", "bg-", "clock", "scales", "aspect", "magic"]
print("Scanning index.html for remnants...")
for kw in keywords:
    matches = list(re.finditer(kw, html, re.IGNORECASE))
    print(f"Keyword '{kw}': {len(matches)} occurrences")
    for m in matches[:5]:
        start = max(0, m.start() - 30)
        end = min(len(html), m.end() + 30)
        snippet = html[start:end].replace("\n", " ")
        print(f"  Snippet: ...{snippet}...")
print("-" * 50)
