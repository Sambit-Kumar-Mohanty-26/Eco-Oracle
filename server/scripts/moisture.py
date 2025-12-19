import cv2
import numpy as np
import sys
import json
import os

def analyze_moisture(image_path):
    if not os.path.exists(image_path):
        print(json.dumps({"error": "File not found"}))
        return

    img = cv2.imread(image_path)
    if img is None:
        print(json.dumps({"error": "Failed to read image"}))
        return

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    lower_red1 = np.array([0, 70, 50])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([170, 70, 50])
    upper_red2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    
    dry_mask = mask1 + mask2

    total_pixels = img.shape[0] * img.shape[1]
    dry_pixels = cv2.countNonZero(dry_mask)

    if total_pixels > 0:
        dryness_score = (dry_pixels / total_pixels) * 100
    else:
        dryness_score = 0

    result = {
        "dryness_score": round(dryness_score, 2),
        "status": "DANGER" if dryness_score > 30 else "SAFE"
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
    else:
        analyze_moisture(sys.argv[1])