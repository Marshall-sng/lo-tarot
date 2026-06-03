with open("d:\\gemini-lo-taro\\app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "function triggerWelcomeLetterAnimation()" in line:
        print(f"Line {idx+1}:")
        for i in range(idx, idx + 25):
            if i < len(lines):
                print(f"{i+1}: {lines[i]}", end="")
        break
