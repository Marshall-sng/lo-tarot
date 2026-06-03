with open("app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "parallax" in line.lower() or "class Starfield" in line:
        # Print surrounding lines
        start = max(0, idx - 5)
        end = min(len(lines), idx + 25)
        print(f"--- Occurrence at line {idx+1} ---")
        for i in range(start, end):
            print(f"{i+1}: {lines[i].rstrip()}")
