import re

style_path = "d:\\gemini-lo-taro\\style.css"
with open(style_path, "r", encoding="utf-8") as f:
    content = f.read()

keywords = [
    "parallax", "bg-", "clock", "scales", "spin", "swing", 
    "aspect", "hand", "beam", "glow", "gradient", "filter"
]

print("Scanning style.css for remnants...")
for kw in keywords:
    matches = list(re.finditer(kw, content, re.IGNORECASE))
    print(f"Keyword '{kw}': {len(matches)} occurrences")
    # Show first 3 matches and their lines
    for m in matches[:3]:
        start = max(0, m.start() - 40)
        end = min(len(content), m.end() + 40)
        snippet = content[start:end].replace("\n", " ")
        print(f"  Snippet: ...{snippet}...")
print("-" * 50)
