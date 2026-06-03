with open("d:\\gemini-lo-taro\\app.js", "r", encoding="utf-8") as f:
    js = f.read()

import re
matches = list(re.finditer(r"title-letter|section__title|letter", js, re.IGNORECASE))
print(f"Occurrences in app.js: {len(matches)}")
for m in matches[:10]:
    start = max(0, m.start() - 40)
    end = min(len(js), m.end() + 40)
    print(f"  Snippet: ...{js[start:end].replace('\n', ' ')}...")
print("-" * 50)
