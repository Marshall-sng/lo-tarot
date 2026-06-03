with open("d:\\gemini-lo-taro\\style.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

def find_selector(sel):
    print(f"Searching for selector: {sel}")
    for idx, line in enumerate(lines):
        if sel in line:
            # print surrounding 5 lines
            print(f"Line {idx+1}:")
            for i in range(max(0, idx-2), min(len(lines), idx+6)):
                print(f"  {i+1}: {lines[i]}", end="")
            print("-" * 30)

find_selector(".card-symbol {")
find_selector(".card-front {")
find_selector(".destiny-card {")
find_selector(".enc-card-symbol {")
