import cv2
import numpy as np
import sys
import json
import os
import requests
import warnings
import base64
import io
import time
from PIL import Image

warnings.filterwarnings("ignore")

BASE_URL = "https://router.huggingface.co/hf-inference/models"

MODEL_PRIMARY = f"{BASE_URL}/nvidia/segformer-b0-finetuned-ade-512-512"

def log_debug(msg):
    sys.stderr.write(f"[Python AI] {msg}\n")
    sys.stderr.flush()

def query_huggingface(api_url, image_data, api_key, retries=3):
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/octet-stream"
    }
    
    for i in range(retries):
        try:
            log_debug(f"Querying {api_url.split('/')[-1]} (Attempt {i+1})...")
            response = requests.post(api_url, headers=headers, data=image_data, timeout=30)
            
            if response.status_code == 200:
                log_debug("✅ Model Response Received.")
                return response.json()
            
            if response.status_code == 503:
                data = response.json()
                wait = data.get('estimated_time', 10)
                log_debug(f"⚠️ Model Loading... Waiting {wait}s")
                time.sleep(wait)
                continue
            
            log_debug(f"❌ API Error {response.status_code}: {response.text[:50]}...")
            return None

        except Exception as e:
            log_debug(f"❌ Connection Error: {str(e)}")
            return None
    return None

def parse_segmentation(api_response, total_pixels):
    if not isinstance(api_response, list): return 0, []

    SAFE_LABELS = [
        "tree", "vegetation", "grass", "plant", "palm", "canopy", "flora", 
        "water", "river", "sea", "lake", "ocean", "mountain", "sky", "cloud"
    ]

    human_activity_px = 0
    detected_features = set()
    all_seen_labels = []
    
    for segment in api_response:
        label = segment.get('label', '').lower()
        score = segment.get('score', 0)

        if score > 0.15:
            all_seen_labels.append(f"{label} ({int(score*100)}%)")

        if score < 0.2: continue 

        try:
            mask_b64 = segment.get('mask')
            if not mask_b64: continue
            
            mask_bytes = base64.b64decode(mask_b64)
            mask_img = Image.open(io.BytesIO(mask_bytes))
            count = np.count_nonzero(np.array(mask_img))
            
            is_safe = any(safe in label for safe in SAFE_LABELS)
            
            if not is_safe:
                if (count / total_pixels) > 0.005: 
                    human_activity_px += count
                    detected_features.add(label.upper())
        except: continue

    if all_seen_labels:
        log_debug(f"🔍 AI SAW: {', '.join(all_seen_labels[:8])}...")

    if total_pixels == 0: return 0, []

    risk_percentage = (human_activity_px / total_pixels) * 100
    
    final_risk_score = risk_percentage * 5.0
        
    return int(min(final_risk_score, 100)), list(detected_features)

def detect_encroachment_ai(image_path):
    api_key = os.environ.get("HF_API_KEY")
    if not api_key: return 0, ["API KEY MISSING"]
    
    try:
        with Image.open(image_path) as img:
            img = img.resize((512, 512)) 
            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            image_data = buf.getvalue()
            total_pixels = 512 * 512

        result = query_huggingface(MODEL_PRIMARY, image_data, api_key)

        if not result: return 0, ["API ERROR"]
        return parse_segmentation(result, total_pixels)
    except Exception as e:
        log_debug(f"System Error: {e}")
        return 0, ["SYSTEM ERROR"]


def analyze_temporal(current_path, historical_path, high_res_path):
    if not os.path.exists(current_path) or not os.path.exists(historical_path):
        print(json.dumps({"error": "Missing images"}))
        return

    img_curr = cv2.imread(current_path)
    img_hist = cv2.imread(historical_path)
    
    if img_curr is None:
        print(json.dumps({"error": "Invalid Image"}))
        return

    ndvi_curr = img_curr[:, :, 1].astype(float) / 255.0
    ndvi_hist = img_hist[:, :, 1].astype(float) / 255.0
    diff = ndvi_curr - ndvi_hist 
    loss_pixels = np.count_nonzero(diff < -0.15)
    total_pixels = img_curr.shape[0] * img_curr.shape[1]
    loss_percentage = float((loss_pixels / total_pixels) * 100)

    pixel_values = img_curr[:, :, 1].reshape((-1, 1))
    pixel_values = np.float32(pixel_values)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    k = 3
    _, labels, centers = cv2.kmeans(pixel_values, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    sorted_indices = np.argsort(centers.flatten())
    counts = np.bincount(labels.flatten())

    if len(counts) < 3:
        count_dense = int(total_pixels)
        count_sparse, count_barren = 0, 0
    else:
        count_barren = int(counts[sorted_indices[0]] if len(counts) > sorted_indices[0] else 0)
        count_sparse = int(counts[sorted_indices[1]] if len(counts) > sorted_indices[1] else 0)
        count_dense = int(counts[sorted_indices[2]] if len(counts) > sorted_indices[2] else 0)

    pct_dense = float((count_dense / total_pixels) * 100)
    pct_sparse = float((count_sparse / total_pixels) * 100)
    pct_barren = float((count_barren / total_pixels) * 100)

    vegetation_mask = (labels.flatten() != sorted_indices[0]) 
    if np.sum(vegetation_mask) > 0:
        precision_score = float(np.mean(pixel_values[vegetation_mask]) / 255.0 * 100)
    else:
        precision_score = 0.0

    total_area_hectares = 50 
    estimated_carbon_tonnes = int(total_area_hectares * ((pct_dense/100) * 180 + (pct_sparse/100) * 50))

    encroachment_risk, features_found = detect_encroachment_ai(high_res_path)

    probable_cause = "Stable Ecosystem"
    status = "VERIFIED"

    if encroachment_risk > 30: 
        probable_cause = f"Human Activity ({', '.join(features_found[:2])})"
        status = "CRITICAL_ENCROACHMENT"
    elif encroachment_risk > 10:
        probable_cause = "Potential Land Use Detected"
        status = "WARNING_ACTIVITY"
    elif loss_percentage > 10.0:
        probable_cause = "Deforestation"
        status = "REJECTED_DEFORESTATION"
    elif precision_score < 65: 
        status = "REJECTED_LOW_BIOMASS"

    result = {
        "biomass_score": round(precision_score, 2), 
        "carbon_tonnes": estimated_carbon_tonnes,   
        "deforestation_percent": round(loss_percentage, 2),
        "encroachment_risk": int(encroachment_risk),
        "probable_cause": probable_cause,
        "status": status,
        "detected_features": features_found,
        "composition": {
            "dense": round(pct_dense, 1),
            "sparse": round(pct_sparse, 1),
            "barren": round(pct_barren, 1)
        }
    }
    print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 4:
        if len(sys.argv) == 3:
            analyze_temporal(sys.argv[1], sys.argv[2], sys.argv[1])
        else:
            print(json.dumps({"error": "Requires arguments"}))
    else:
        analyze_temporal(sys.argv[1], sys.argv[2], sys.argv[3])