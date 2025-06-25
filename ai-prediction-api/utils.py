import os
from datetime import datetime
import cv2
from PIL import Image
import imagehash

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
