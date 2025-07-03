import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ipfsRoutes from './routes/calldata.routes.js';

dotenv.config();

const PORT = process.env.PORT || 5001

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', ipfsRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minting service running at http://0.0.0.0:${PORT}`);
});