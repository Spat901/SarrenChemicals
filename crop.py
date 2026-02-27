from PIL import Image
import sys

def crop_image_bottom(input_path, output_path):
    print(f"Loading {input_path}")
    image = Image.open(input_path)
    
    # Let's see the current dimensions
    width, height = image.size
    print(f"Original size: {width}x{height}")
    
    # We will simply shave off the bottom. Let's start with 20%
    amount_to_shave_off_bottom = int(height * 0.15)
    
    # Let's inspect the pixels from the bottom up to see where the real content ends
    # This assumes a straight line of text at the bottom.
    
    # If no alpha, get the bounding box of non-white pixels
    # But user said top and sides are good, bottom needs crop.
    # So we'll just chop the bottom manually
    
    # Padded bbox: (63, 265, 951, 975) -> size was 888 x 710
    
    # Let's crop the bottom 10%
    crop_height = int(height * 0.88)
    bbox = (0, 0, width, crop_height)
    
    print(f"Cropping to bbox: {bbox}")
    image = image.crop(bbox)
    
    image.save(output_path)
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    crop_image_bottom(sys.argv[1], sys.argv[2])
