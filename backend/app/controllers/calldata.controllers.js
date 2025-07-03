import axios from 'axios';
import FormData from 'form-data';

const FASTAPI_URL = 'http://localhost:8000/predict/';
const SCALE_FACTOR = 100;

const scaleFloat = (num, factor) => Math.round(num * factor).toString(10);

const fetchCIDFromFastAPI = async (fileBuffer, filename) => {
  try {
    const form = new FormData();
    form.append("file", fileBuffer, filename);

    const response = await axios.post(FASTAPI_URL, form, {
      headers: form.getHeaders()
    });

    const { ipfs_cid, phash, prediction_score } = response.data;

    return { cid: ipfs_cid, phash, prediction_score };
  } catch (error) {
    console.error('Error getting CID from FastAPI:', error.message);
    return null;
  }
};

export const processAndGetIPFSData = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Missing video file upload' });
    }

    const result = await fetchCIDFromFastAPI(file.buffer, file.originalname);

    if (!result) {
      return res.status(500).json({ error: 'Failed to process file' });
    }

    // Optionally scale prediction_score if needed
    const scaled_score = scaleFloat(result.prediction_score, SCALE_FACTOR);

    return res.json({
      prediction_score: scaled_score,
      phash: result.phash,
      cid: result.cid
    });
  } catch (err) {
    console.error('Controller Error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
