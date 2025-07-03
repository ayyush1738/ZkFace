import { create } from 'ipfs-http-client';
import axios from 'axios';
import { decode } from 'base58-universal';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs';
const ipfs = create({ url: 'http://127.0.0.1:5001' }); // local IPFS node
const SCALE_FACTOR = 100;

const hexToDecimal = (hex) => BigInt(`0x${hex}`).toString(10);
const scaleFloat = (num, factor) => Math.round(num * factor).toString(10);

const cidToDecimal = (cid) => {
  const bytes = decode(cid);
  const hex = Buffer.from(bytes).toString('hex');
  const bigIntValue = BigInt(`0x${hex}`);
  return bigIntValue.toString(10);
};

const getLatestCID = async (directoryCID) => {
  try {
    let latestCID = null;
    for await (const file of ipfs.ls(directoryCID)) {
      latestCID = file.cid.toString();
    }
    return latestCID;
  } catch (error) {
    console.error('Error fetching latest CID:', error.message);
    return null;
  }
};

const fetchFromIPFS = async (cid) => {
  try {
    const response = await axios.get(`${IPFS_GATEWAY}/${cid}`);
    const data = response.data;

    const pHash = data.phash || data.video?.phash;
    const pred = data.prediction_score || data.video?.pred;

    if (!pHash || pred === undefined) {
      throw new Error("Invalid IPFS JSON structure.");
    }

    return {
      pHash: hexToDecimal(pHash),
      cid: cidToDecimal(cid),
      ai_prediction: scaleFloat(Array.isArray(pred) ? pred[0] : pred, SCALE_FACTOR),
      threshold: scaleFloat(0.55, SCALE_FACTOR)
    };
  } catch (error) {
    console.error('Error fetching data from IPFS:', error.message);
    return null;
  }
};

export const getProcessedIPFSData = async (req, res) => {
  try {
    const { directoryCID } = req.query;

    if (!directoryCID) {
      return res.status(400).json({ error: 'Missing directoryCID query parameter' });
    }

    const latestCID = await getLatestCID(directoryCID);
    if (!latestCID) {
      return res.status(404).json({ error: 'No files found under the provided CID' });
    }

    const processedData = await fetchFromIPFS(latestCID);
    if (!processedData) {
      return res.status(500).json({ error: 'Failed to process IPFS data' });
    }

    return res.json(processedData);
  } catch (err) {
    console.error('Controller Error:', err.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
