import cv2
import numpy as np
import sys
import json

def analyze_image(image_path):
    # 1. Load the image [cite: 382]
    img = cv2.imread(image_path)
    
    if img is None:
        print(json.dumps({"error": "Image not found"}))
        return

    # 2. Convert to HSV (Hue, Saturation, Value) for better color masking [cite: 383]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # 3. Define the "Green" range
    # Since your Sentinel script returns [1-NDVI, NDVI, 0], healthy trees are pure Green.
    # We define a mask to catch that specific bright green.
    lower_green = np.array([40, 40, 40])
    upper_green = np.array([80, 255, 255])

    # 4. Create a mask (1 for green pixels, 0 for others)
    mask = cv2.inRange(hsv, lower_green, upper_green)

    # 5. Count pixels
    total_pixels = img.shape[0] * img.shape[1]
    green_pixels = cv2.countNonZero(mask)
    
    # 6. Calculate Biomass Score (0-100)
    score = (green_pixels / total_pixels) * 100

    # 7. Determine Status
    status = "REJECTED"
    if score > 50: # Threshold can be adjusted
        status = "VERIFIED"

    # 8. Output JSON [cite: 384]
    result = {
        "biomass_score": round(score, 2),
        "green_pixels": green_pixels,
        "status": status
    }
    
    # Print JSON to stdout so Node.js can read it
    print(json.dumps(result))

if __name__ == "__main__":
    # Get the file path passed from Node.js
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
    else:
        analyze_image(sys.argv[1])