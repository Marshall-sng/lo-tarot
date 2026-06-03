with open("d:\\gemini-lo-taro\\style.css", "r", encoding="utf-8") as f:
    css = f.read()

import re
selectors = [r"\.card-reveal-wrapper", r"\.card-inner", r"\.card-face", r"\.card-front"]
for s in selectors:
    matches = re.findall(rf"({s}[^{{]*\{{[^}}]*\}})", css, re.DOTALL)
    for m in matches:
        print("Match:\n", m.strip())
        print("-" * 30)
