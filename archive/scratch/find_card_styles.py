with open("d:\\gemini-lo-taro\\style.css", "r", encoding="utf-8") as f:
    css = f.read()

import re
keywords = [r"\.card-symbol", r"\.card-front", r"\.destiny-card", r"\.enc-card-symbol", r"\.encyclopedia-card-wrapper"]

print("Scanning style.css for card elements styling...")
for kw in keywords:
    matches = re.findall(rf"({kw}[^{{]*\{{[^}}]*\}})", css, re.DOTALL)
    for m in matches:
        print("Match:\n", m.strip())
        print("-" * 30)
