with open("d:\\gemini-lo-taro\\app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("=== showCardReveal function logic ===")
found_reveal = False
for idx, line in enumerate(lines):
    if "function showCardReveal" in line:
        found_reveal = True
        for i in range(idx, idx + 45):
            print(f"{i+1}: {lines[i]}", end="")
        break

print("\n=== final-report page card generation ===")
for idx, line in enumerate(lines):
    if "destiny-cards-row" in line or "class=\"card-tag\"" in line:
        print(f"Around line {idx+1}:")
        for i in range(idx - 5, idx + 25):
            if 0 <= i < len(lines):
                print(f"{i+1}: {lines[i]}", end="")
        print("-" * 50)
