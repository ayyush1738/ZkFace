import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import bs58 from 'bs58';
import { execSync } from 'child_process';
import * as snarkjs from 'snarkjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FASTAPI_URL = 'http://localhost:8000/predict/';
const SCALE_FACTOR = 100;
const CIRCUIT_NAME = 'deepfake';

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

const run = (cmd) => {
  console.log(`▶️ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
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
      phash: result.phash.startsWith('0x') ? result.phash : '0x' + result.phash,
      cid: bs58.decode(result.cid).reduce((acc, byte) => (acc * 256n + BigInt(byte)), 0n).toString()
    };

    const circuitDir = path.join(__dirname, '../circuit');
    if (!fs.existsSync(circuitDir)) fs.mkdirSync(circuitDir, { recursive: true });

    const inputPath = path.join(circuitDir, 'input.json');
    fs.writeFileSync(inputPath, JSON.stringify(inputData, null, 2));
    console.log('✅ input.json written to:', inputPath);

    const wasmPath = path.join(circuitDir, `${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm`);
    const zkeyPath = path.join(circuitDir, `${CIRCUIT_NAME}_0001.zkey`);
    const witnessPath = path.join(circuitDir, 'witness.wtns');
    const proofPath = path.join(circuitDir, 'proof.json');
    const publicPath = path.join(circuitDir, 'public.json');
    const witnessGenJS = path.join(circuitDir, `${CIRCUIT_NAME}_js/generate_witness.js`);

    // 1. Generate Witness
    run(`node ${witnessGenJS} ${wasmPath} ${inputPath} ${witnessPath}`);

    // 2. Generate Proof
    run(`snarkjs groth16 prove ${zkeyPath} ${witnessPath} ${proofPath} ${publicPath}`);

    // 3. Generate Calldata using snarkjs JS API
    const proof = JSON.parse(fs.readFileSync(proofPath));
    const pub = JSON.parse(fs.readFileSync(publicPath));
    const rawCalldata = await snarkjs.groth16.exportSolidityCallData(proof, pub);

    // 🛠️ Parse the stringified calldata to a proper JS array structure
    const argv = rawCalldata
      .replace(/["[\]\s]/g, '') // remove brackets, quotes, whitespace
      .split(',')
      .map(x => '0x' + BigInt(x).toString(16).padStart(64, '0')); // to padded hex

    const structuredCalldata = [
      [argv[0], argv[1]],                             // a
      [[argv[2], argv[3]], [argv[4], argv[5]]],       // b
      [argv[6], argv[7]],                             // c
      [argv[8]]                                       // publicSignals
    ];

    return res.json({
      ...inputData,
      proof,
      publicSignals: pub,
      calldata: structuredCalldata
    });

  } catch (err) {
    console.error('❌ Controller Error:', err);
    return res.status(500).json({ error: 'Internal Server Error during proof generation' });
  }
};
