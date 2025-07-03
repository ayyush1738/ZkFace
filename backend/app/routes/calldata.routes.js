import express from 'express';
import multer from 'multer';
import { processAndGetIPFSData } from '../controllers/calldata.controllers.js';

const router = express.Router();
const upload = multer(); // memory storage

router.post('/upload', upload.single('file'), processAndGetIPFSData);

export default router;
