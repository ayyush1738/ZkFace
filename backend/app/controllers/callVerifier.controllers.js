import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { ethers, BigNumber } from 'ethers';
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  PRIVATE_KEY,
  RPC_URL,
} from '../config/contractConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const toBigNumberArray = (arr) =>
  arr.map(n => BigNumber.from(BigInt(n).toString())); 

export async function verifyZKProofFromFile() {
  try {
    const verifyPath = path.join(__dirname, '../circuit/verify.json');
    const jsonData = JSON.parse(fs.readFileSync(verifyPath, 'utf-8'));

    let { a, b, c, input } = jsonData;

    a = toBigNumberArray(a);
    b = b.map(inner => toBigNumberArray(inner));
    c = toBigNumberArray(c);
    input = toBigNumberArray(input); 

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const result = await contract.verifyProof(a, b, c, input);

    console.log("Verification result:", result);
    return result;
  } catch (err) {
    console.error("Smart contract verification failed:", err);
    return false;
  }
}
