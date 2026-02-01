from PIL import Image, ImageChops
import math

def distance(c1, c2):
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def crop_dark_background(path, output_path, tolerance=10):
    try:
        img = Image.open(path).convert('RGB')
        width, height = img.size
        
        # Get background color from bottom-right pixel
        bg_color = img.getpixel((width - 1, height - 1))
        print(f"Detected background color: {bg_color}")
        
        # Find borders manually
        left, top, right, bottom = 0, 0, width, height

        # Find bottom crop line (scan from bottom up)
        for y in range(height - 1, -1, -1):
            row_is_bg = True
            for x in range(width):
                pixel = img.getpixel((x, y))
                if distance(pixel, bg_color) > tolerance:
                    row_is_bg = False
                    break
            if not row_is_bg:
                bottom = y + 1
                break
        
        # Find right crop line (scan from right to left)
        for x in range(width - 1, -1, -1):
            col_is_bg = True
            for y in range(height):  # Scan full height or just up to new bottom? Full height is safer
                pixel = img.getpixel((x, y))
                if distance(pixel, bg_color) > tolerance:
                    col_is_bg = False
                    break
            if not col_is_bg:
                right = x + 1
                break
                
        # Find top crop line (scan from top down) - just in case
        for y in range(height):
            row_is_bg = True
            for x in range(width):
                 pixel = img.getpixel((x, y))
                 if distance(pixel, bg_color) > tolerance:
                    row_is_bg = False
                    break
            if not row_is_bg:
                top = y
                break

        # Find left crop line (scan from left to right) - just in case
        for x in range(width):
            col_is_bg = True
            for y in range(height):
                pixel = img.getpixel((x, y))
                if distance(pixel, bg_color) > tolerance:
                    col_is_bg = False
                    break
            if not col_is_bg:
                left = x
                break

        print(f"Cropping to box: ({left}, {top}, {right}, {bottom})")
        
        # Crop
        cropped_img = img.crop((left, top, right, bottom))
        
        # Optional: Make background transparent? User didn't explicitly ask but it's usually better.
        # But if the text is white and bg is dark, making it transparent is good.
        # Let's keep it simple first: just crop the spatial dimensions.
        
        cropped_img.save(output_path)
        print(f"Saved to {output_path}")

    except Exception as e:
        print(f"Error: {e}")

crop_dark_background('public/images/ai-fiqh-logo.png', 'public/images/ai-fiqh-logo-cropped.png')
