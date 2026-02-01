from PIL import Image, ImageChops

def crop_borders(image_path, output_path):
    try:
        img = Image.open(image_path)
        
        # Convert to RGBA
        img = img.convert('RGBA')
            
        # Get the background color from the top-left pixel
        bg_color = img.getpixel((0,0))
        
        # Create a background image of the same color
        bg = Image.new(img.mode, img.size, bg_color)
        
        # specific handling for AI Fiqh logo if it fails standard crop
        # We'll use a simpler bbox method based on alpha channel if purely transparent, 
        # or difference from background color
        
        diff = ImageChops.difference(img, bg)
        # More sensitive difference detection
        bbox = diff.getbbox()
        
        if bbox:
            print(f"Bbox found: {bbox}")
            # Add a small padding? or exact crop? User wants tight crop.
            cropped_img = img.crop(bbox)
            cropped_img.save(output_path)
            print(f"Successfully cropped {image_path} to {output_path}. New size: {cropped_img.size}")
        else:
            # If no bbox found (maybe solid color match?), try cropping alpha if it exists
            print(f"No difference from background found in {image_path}. Checking alpha channel...")
            alpha = img.split()[-1]
            bbox = alpha.getbbox()
            if bbox:
                print(f"Alpha bbox found: {bbox}")
                cropped_img = img.crop(bbox)
                cropped_img.save(output_path)
                print(f"Successfully cropped {image_path} using alpha to {output_path}")
            else:
                print(f"Could not crop {image_path} - image seems empty or solid")
                # Fallback: just copy it or save as is?
                img.save(output_path)
                print(f"Saved original as fallback to {output_path}")

    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Process AI Fiqh Logo Only (Bank Rakyat already done)
crop_borders('public/images/ai-fiqh-logo.png', 'public/images/ai-fiqh-logo-cropped.png')
