import express from 'express';
import { getProcessedIPFSData } from '../controllers/calldata.controllers.js';

const router = express.Router();

router.get('/ipfs-data', getProcessedIPFSData);

export default router;
