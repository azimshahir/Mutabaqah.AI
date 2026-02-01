from PIL import Image

def analyze_image(path):
    try:
        img = Image.open(path)
        print(f"File: {path}")
        print(f"Format: {img.format}")
        print(f"Mode: {img.mode}")
        print(f"Size: {img.size}")
        
        # Check corners for color
        corners = [
            (0, 0),
            (img.width-1, 0),
            (0, img.height-1),
            (img.width-1, img.height-1)
        ]
        print("Corner pixels:", [img.getpixel(pos) for pos in corners])
        
    except Exception as e:
        print(f"Error: {e}")

analyze_image('public/images/ai-fiqh-logo-cropped.png')
analyze_image('public/images/ai-fiqh-logo.png')
