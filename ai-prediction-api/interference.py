import os
import shutil
import uuid
from CViT.cvit_prediction import vids

def run_inference(video_path: str):
    # Step 1: Create a unique temp directory
    unique_id = str(uuid.uuid4())
    temp_dir = os.path.join("api", "uploaded_files", unique_id)
    os.makedirs(temp_dir, exist_ok=True)

    # Step 2: Copy uploaded file into this temp folder
    filename = os.path.basename(video_path)
    temp_path = os.path.join(temp_dir, filename)
    shutil.copy(video_path, temp_path)

    # Step 3: Load model and run prediction on this isolated folder
    weight = "CViT/weight/cvit2_deepfake_detection_ep_50.pth"
    net = "cvit2"
    num_frames = 15
    fp16 = False

    result = vids(weight, temp_dir, None, num_frames, net, fp16)

    # Step 4: Extract result for the uploaded file only
    try:
        idx = result["video"]["name"].index(filename)
        output = {
            "filename": filename,
            "pred_score": result["video"]["pred"][idx],
            "pred_label": result["video"]["pred_label"][idx],
            "klass": result["video"]["klass"][idx],
            "correct_label": result["video"]["correct_label"][idx],
        }
    except ValueError:
        output = {
            "filename": filename,
            "error": "Prediction failed or filename mismatch in result."
        }

    # Step 5: Clean up the temporary directory
    shutil.rmtree(temp_dir)

    return output
