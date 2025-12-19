import cv2
import numpy as np
import sys
import json
import os

def analyze_image(image_path):
    if not os.path.exists(image_path):
        print(json.dumps({"error": "Image file not found", "path": image_path}))
        return
    img = cv2.imread(image_path)
    
    if img is None:
        print(json.dumps({"error": "Failed to read image using cv2"}))
        return
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)
    total_pixels = img.shape[0] * img.shape[1]
    green_pixels = cv2.countNonZero(mask)
    score = (green_pixels / total_pixels) * 100
    status = "REJECTED"
    if score > 20:
        status = "VERIFIED"
    result = {
        "biomass_score": round(score, 2),
        "green_pixels": green_pixels,
        "total_pixels": total_pixels,
        "status": status
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path argument provided"}))
    else:
        analyze_image(sys.argv[1])