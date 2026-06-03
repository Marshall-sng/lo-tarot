with open("d:\\gemini-lo-taro\\style.css", "r", encoding="utf-8") as f:
    css = f.read()

import re
# find all selectors containing section__title or title-letter
matches = re.findall(r"([^{}\n]*section__title[^{}]*\{[^}]*\})", css, re.IGNORECASE | re.DOTALL)
for m in matches:
    print("Match:\n", m.strip())
    print("-" * 30)

matches2 = re.findall(r"([^{}\n]*title-letter[^{}]*\{[^}]*\})", css, re.IGNORECASE | re.DOTALL)
for m in matches2:
    print("Match:\n", m.strip())
    print("-" * 30)

matches3 = re.findall(r"([^{}\n]*section__[^{}]*\{[^}]*\})", css, re.IGNORECASE | re.DOTALL)
for m in matches3:
    print("Match:\n", m.strip())
    print("-" * 30)
