from PIL import Image, ImageChops
import numpy as np

def make_transparent_and_crop(path, output_path, tolerance=30):
    try:
        img = Image.open(path).convert('RGBA')
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Check if pixel is near white
            if item[0] > 255-tolerance and item[1] > 255-tolerance and item[2] > 255-tolerance:
                newData.append((255, 255, 255, 0)) # Make transparent
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        # Now crop
        alpha = img.split()[-1]
        bbox = alpha.getbbox()
        if bbox:
            img = img.crop(bbox)
            img.save(output_path)
            print(f"Processed {path} -> {output_path} (Size: {img.size})")
        else:
            print(f"Failed to find content in {path}")
            
    except Exception as e:
        print(f"Error processing {path}: {e}")

# Process both just to be sure
make_transparent_and_crop('public/images/ai-fiqh-logo.png', 'public/images/ai-fiqh-logo-cropped.png')
# Bank Rakyat might already be transparent but let's re-run standard crop just in case
# Actually stick to the one that worked for bank rakyat or apply generic crop
