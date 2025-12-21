import cv2
import numpy as np
import sys
import json
import os

def analyze_temporal(current_path, historical_path):
    if not os.path.exists(current_path) or not os.path.exists(historical_path):
        print(json.dumps({"error": "Missing image files"}))
        return

    img_curr = cv2.imread(current_path)
    img_hist = cv2.imread(historical_path)

    if img_curr is None or img_hist is None:
        print(json.dumps({"error": "Failed to decode images"}))
        return
    ndvi_curr = img_curr[:, :, 1] / 255.0
    ndvi_hist = img_hist[:, :, 1] / 255.0

    avg_ndvi = np.mean(ndvi_curr)
    biomass_score = avg_ndvi * 100 
    diff = ndvi_curr - ndvi_hist 
    
    loss_mask = diff < -0.15 
    loss_pixels = np.count_nonzero(loss_mask)
    total_pixels = img_curr.shape[0] * img_curr.shape[1]
    loss_percentage = (loss_pixels / total_pixels) * 100

    total_area_hectares = 50 
    estimated_carbon_tonnes = total_area_hectares * (avg_ndvi * 150) 

    status = "VERIFIED"
    if biomass_score < 20:
        status = "REJECTED_LOW_BIOMASS"
    elif loss_percentage > 5: 
        status = "REJECTED_DEFORESTATION_DETECTED"

    probable_cause = "N/A"
    if loss_percentage > 1.0:
        if loss_percentage > 15.0:
            probable_cause = "Mass Deforestation (Clear-cutting)"
        else:
            probable_cause = "Selective Logging / Degradation"

    result = {
        "biomass_score": round(biomass_score, 2),
        "carbon_tonnes": int(estimated_carbon_tonnes),
        "deforestation_percent": round(loss_percentage, 2),
        "probable_cause": probable_cause,
        "status": status
    }
    
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Requires 2 arguments"}))
    else:
        analyze_temporal(sys.argv[1], sys.argv[2])