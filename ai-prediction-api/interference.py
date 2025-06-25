import os
import shutil
from cvit_prediction import vids  # works due to PYTHONPATH

def run_inference(video_path: str):
    temp_dir = "api/uploaded_files"
    os.makedirs(temp_dir, exist_ok=True)

    filename = os.path.basename(video_path)
    temp_path = os.path.join(temp_dir, filename)
    shutil.copy(video_path, temp_path)

    weight = "CViT/weight/cvit2_deepfake_detection_ep_50.pth"
    net = "cvit2"
    num_frames = 15
    fp16 = False

    result = vids(weight, temp_dir, None, num_frames, net, fp16)

    idx = result["video"]["name"].index(filename)
    return {
        "filename": filename,
        "pred_score": result["video"]["pred"][idx],
        "pred_label": result["video"]["pred_label"][idx],
        "klass": result["video"]["klass"][idx],
        "correct_label": result["video"]["correct_label"][idx],
    }
