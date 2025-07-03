import express from 'express';
import cors from 'cors';
import ipfsRoutes from './app/routes/calldata.routes.js';
import healthcheckRouter from './app/routes/healthcheck.routes.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', ipfsRoutes);
app.use('/api', healthcheckRouter);


app.listen(PORT, () => {
  console.log(`Service running at http://localhost:${PORT}`);
});