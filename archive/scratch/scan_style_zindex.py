with open("style.css", "r", encoding="utf-8") as f:
    for idx, line in enumerate(f):
        if "z-index" in line:
            print(f"{idx+1}: {line.strip()}")
