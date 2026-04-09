import os

def generate_array(folder_name):
    folder_path = f"images/{folder_name}"
    # Get all .jpg files and sort them
    files = [f for f in os.listdir(folder_path) if f.lower().endswith('.jpg')]
    files.sort()
    
    print(f"\n✅ Found {len(files)} photos in images/{folder_name}/")
    print("\nCopy the code below and paste it into your gallery file:\n")
    print("const photos = [")
    
    for filename in files:
        title = filename.replace(".jpg", "").replace(".JPG", "")
        print(f'    {{ src: "images/{folder_name}/{filename}", title: "{title}", desc: "Placeholder description - edit this later" }},')
    
    print("];")
    print("\nDone! Just copy from 'const photos =' to the last line.")

# Ask user which gallery
print("Which gallery do you want to generate?")
print("1. japan")
print("2. sydney")
print("3. melbourne")
print("4. adelaide")
choice = input("\nEnter number (1-4): ").strip()

folders = {"1": "japan", "2": "sydney", "3": "melbourne", "4": "adelaide"}

if choice in folders:
    generate_array(folders[choice])
else:
    print("Invalid choice.")