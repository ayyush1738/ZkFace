from fastapi import FastAPI, UploadFile, File
import os
from interference import run_inference
from utils import get_file_phash, get_created_date, upload_json_to_ipfs
from dotenv import load_dotenv
load_dotenv()


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

    # Run model inference
    result = run_inference(temp_path)

    # Extract metadata
    phash = get_file_phash(temp_path)
    created_date = get_created_date(temp_path)

    # Merge full result
    final_result = {
        "filename": result.get("filename"),
        "prediction_score": result.get("pred_score"),
        "prediction_label": result.get("pred_label"),
        "predicted_class": result.get("klass"),
        "ground_truth": result.get("correct_label"),
        "phash": phash,
        "created_date": created_date
    }

    # Upload JSON to IPFS
    ipfs_cid = upload_json_to_ipfs(final_result)

    return {
        **final_result,
        "ipfs_cid": ipfs_cid,
        "ipfs_url": f"https://gateway.pinata.cloud/ipfs/{ipfs_cid}"
    }
