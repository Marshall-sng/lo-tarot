with open("d:\\gemini-lo-taro\\app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("=== generateSharePoster drawing logic ===")
for i in range(928, 1065):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end="")
