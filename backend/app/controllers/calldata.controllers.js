import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    console.error('❌ Error getting CID from FastAPI:', error.message);
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

    const scaled_score = scaleFloat(result.prediction_score, SCALE_FACTOR);

    const inputData = {
      prediction_score: scaled_score,
      phash: result.phash,
      cid: result.cid
    };

    // Ensure circuit/ directory exists
    const circuitDir = path.join(__dirname, '../circuit');
    if (!fs.existsSync(circuitDir)) {
      fs.mkdirSync(circuitDir, { recursive: true });
    }

    // Write input.json
    const inputPath = path.join(circuitDir, 'input.json');
    fs.writeFileSync(inputPath, JSON.stringify(inputData, null, 2));

    console.log('✅ input.json written to:', inputPath);

    return res.json(inputData);
  } catch (err) {
    console.error('❌ Controller Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
