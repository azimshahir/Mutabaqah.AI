from PIL import Image, ImageChops

def crop_borders(image_path, output_path):
    try:
        img = Image.open(image_path)
        
        # Convert to RGB if needed to detect background color reliably
        if img.mode != 'RGB' and img.mode != 'RGBA':
            img = img.convert('RGBA')
            
        bg = Image.new(img.mode, img.size, img.getpixel((0,0)))
        diff = ImageChops.difference(img, bg)
        diff = ImageChops.add(diff, diff, 2.0, -100)
        bbox = diff.getbbox()
        
        if bbox:
            # Crop to the bounding box
            cropped_img = img.crop(bbox)
            cropped_img.save(output_path)
            print(f"Successfully cropped {image_path} to {output_path}. New size: {cropped_img.size}")
        else:
            print(f"No content found to crop in {image_path}")
            
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Process Bank Rakyat Logo
crop_borders('public/images/bank-rakyat-logo.png', 'public/images/bank-rakyat-logo-cropped.png')

# Process AI Fiqh Logo
crop_borders('public/images/ai-fiqh-logo.png', 'public/images/ai-fiqh-logo-cropped.png')
