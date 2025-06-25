from fastapi import FastAPI, UploadFile, File
import os

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

    # Here you would call your deepfake prediction function
    # e.g. result = predict(temp_path)

    return {"filename": filename, "status": "File received. Processing not implemented yet."}
