from fastapi import FastAPI, UploadFile, File
import os
from interference import run_inference
from utils import get_file_phash, get_created_date  # ✅ Import utility functions

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "ZKFace API is live!"}

@app.post("/predict/")
async def predict_video(file: UploadFile = File(...)):
    filename = file.filename
    contents = await file.read()

    # Save uploaded file
    temp_path = os.path.join("temp", filename)
    os.makedirs("temp", exist_ok=True)
    with open(temp_path, "wb") as f:
        f.write(contents)

    # Run your model inference
    result = run_inference(temp_path)

    phash = get_file_phash(temp_path)
    created_date = get_created_date(temp_path)

    return {
        "filename": result["filename"],
        "prediction_score": result["pred_score"],
        "prediction_label": result["pred_label"],
        "predicted_class": result["klass"],
        "ground_truth": result["correct_label"],
        "phash": phash,                            
        "created_date": created_date               
    }
