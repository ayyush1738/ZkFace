import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import bs58 from 'bs58';
import { execSync } from 'child_process';
import * as snarkjs from 'snarkjs';
import { verifyZKProofFromFile } from './callVerifier.controllers.js'; 

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

    const { ipfs_cid, phash, prediction_score, prediction_label } = response.data;
    return { cid: ipfs_cid, phash, prediction_score, prediction_label };
  } catch (error) {
    console.error('Error getting CID from FastAPI:', error.message);
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
    if (!file) return res.status(400).json({ error: 'Missing video file upload' });

    const result = await fetchCIDFromFastAPI(file.buffer, file.originalname);
    if (!result) return res.status(500).json({ error: 'Failed to process file' });

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

    const wasmPath = path.join(circuitDir, `${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm`);
    const zkeyPath = path.join(circuitDir, `${CIRCUIT_NAME}_0001.zkey`);
    const witnessPath = path.join(circuitDir, 'witness.wtns');
    const proofPath = path.join(circuitDir, 'proof.json');
    const publicPath = path.join(circuitDir, 'public.json');
    const witnessGenJS = path.join(circuitDir, `${CIRCUIT_NAME}_js/generate_witness.js`);

    run(`node ${witnessGenJS} ${wasmPath} ${inputPath} ${witnessPath}`);
    run(`snarkjs groth16 prove ${zkeyPath} ${witnessPath} ${proofPath} ${publicPath}`);

    const proof = JSON.parse(fs.readFileSync(proofPath));
    const pub = JSON.parse(fs.readFileSync(publicPath));
    const rawCalldata = await snarkjs.groth16.exportSolidityCallData(proof, pub);

    const argv = rawCalldata
      .replace(/["[\]\s]/g, '')
      .split(',')
      .map(x => '0x' + BigInt(x).toString(16).padStart(64, '0'));

    const structuredCalldata = [
      [argv[0], argv[1]],
      [[argv[2], argv[3]], [argv[4], argv[5]]],
      [argv[6], argv[7]],
      [argv[8]]
    ];

    const verifyData = {
      a: structuredCalldata[0],
      b: structuredCalldata[1],
      c: structuredCalldata[2],
      input: structuredCalldata[3]
    };

    const verifyPath = path.join(circuitDir, 'verify.json');
    fs.writeFileSync(verifyPath, JSON.stringify(verifyData, null, 2));
    console.log('verify.json written.');

    const isValid = await verifyZKProofFromFile(); 
    return res.json({
      ...inputData,
      phash: result.phash,
      cid: result.cid,
      label: result.prediction_label,
      verified: isValid
    });

  } catch (err) {
    console.error('Controller Error:', err);
    return res.status(500).json({ error: 'Internal Server Error during proof generation' });
  }
};
