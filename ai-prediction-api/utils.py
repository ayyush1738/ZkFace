import os
from datetime import datetime
import cv2
from PIL import Image
import imagehash
import json
import tempfile
import requests

def get_created_date(path):
    timestamp = os.path.getctime(path)
    return datetime.fromtimestamp(timestamp).isoformat()

def get_file_phash(path):
    try:
        if path.endswith((".mp4", ".avi", ".mov")):
            cap = cv2.VideoCapture(path)
            total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.set(cv2.CAP_PROP_POS_FRAMES, total // 2)
            ret, frame = cap.read()
            cap.release()
            if not ret:
                return "error"
            img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        else:
            img = Image.open(path)
        return str(imagehash.phash(img))
    except Exception as e:
        return f"error: {str(e)}"


def upload_json_to_ipfs(data: dict):
    PINATA_API_KEY = os.getenv("PINATA_API_KEY")
    PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")

    if not PINATA_API_KEY or not PINATA_API_SECRET:
        raise ValueError("Pinata API credentials not set in environment variables.")

    # Write JSON to a temp file
    with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix=".json") as tmp_json:
        json.dump(data, tmp_json, indent=2)
        temp_json_path = tmp_json.name

    try:
        with open(temp_json_path, 'rb') as f:
            files = {'file': (os.path.basename(temp_json_path), f)}
            headers = {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_API_SECRET,
            }
            response = requests.post('https://api.pinata.cloud/pinning/pinFileToIPFS', files=files, headers=headers)
            response.raise_for_status()
            ipfs_result = response.json()
            return ipfs_result['IpfsHash']
    finally:
        os.remove(temp_json_path)
