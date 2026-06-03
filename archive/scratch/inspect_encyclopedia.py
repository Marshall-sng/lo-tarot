with open("d:\\gemini-lo-taro\\app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "encyclopedia-cards-grid" in line:
        print(f"Around line {idx+1}:")
        for i in range(idx - 5, idx + 35):
            if 0 <= i < len(lines):
                print(f"{i+1}: {lines[i]}", end="")
        print("-" * 50)
