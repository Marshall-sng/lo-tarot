with open("d:\\gemini-lo-taro\\ohzi_source.html", "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

with open("d:\\gemini-lo-taro\\ohzi_style.css", "r", encoding="utf-8", errors="ignore") as f:
    css = f.read()

print("Ohzi HTML size:", len(html))
print("Ohzi CSS size:", len(css))

import re
# Look for background images, canvases, SVGs, colors in Ohzi files
print("\n--- Search in Ohzi HTML ---")
# Find all divs or elements with canvas or background
for line in html.splitlines():
    if any(x in line.lower() for x in ("canvas", "background", "image", "svg", "logo")):
        print("  ", line.strip()[:120])

print("\n--- Search in Ohzi CSS ---")
# Find background, canvas, body styles in CSS
body_match = re.search(r"body\s*\{[^}]*\}", css, re.DOTALL)
if body_match:
    print("Body style:\n", body_match.group())

canvas_match = re.search(r"\.canvas[^{]*\{[^}]*\}", css, re.DOTALL)
if canvas_match:
    print("Canvas container/style:\n", canvas_match.group())
