import express from 'express';
import cors from 'cors';
import ipfsRoutes from './app/routes/calldata.routes.js';
import healthcheckRouter from './app/routes/healthcheck.routes.js';
import dotenv from 'dotenv';
import { Connection, Transaction, SendTransactionError } from '@solana/web3.js';
dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', ipfsRoutes);
app.use('/api', healthcheckRouter);

app.post("/api/submit-txn", async (req,res) => {
  try {
  const txn = req.body.signedTx;
  if(!txn) 
    return res.status(500).json({message: "Transaction required"})
  const connection = new Connection("https://api.devnet.solana.com");
  const signedTx = Transaction.from(Buffer.from(txn, "base64"));
  
  // Check account balance before sending
  const feePayer = signedTx.feePayer;
  if (feePayer) {
    const balance = await connection.getBalance(feePayer);
    
    if (balance === 0) {
      return res.status(400).json({
        error: "Insufficient balance. Please airdrop SOL to your wallet.",
        details: `Fee payer ${feePayer.toString()} has 0 SOL balance.`
      });
    }
  }
  
  const txid = await connection.sendRawTransaction(signedTx.serialize());
  return res.status(201).json({transaction : txid});
} catch(err) {
  console.log("Error", err.message);
  
  // Handle SendTransactionError specifically
  if (err instanceof SendTransactionError) {
    const logs = await err.getLogs();
    console.log("Transaction logs:", logs);
    return res.status(400).json({
      error: "Transaction failed",
      message: err.message,
      logs: logs
    });
  }
  
  return res.status(400).json({error: err.message})
}
})


app.listen(PORT, () => {
  console.log(`Service running at http://localhost:${PORT}`);
});