'use client';

import React, { useState, useCallback, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, CheckCircle, XCircle, Loader2, ExternalLink, History, Calendar, X, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useConnection, useWallet, WalletContext } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation'
import { Transaction, Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program } from "@project-serum/anchor";
import { idl } from '../../../backend/app/controllers/proof_verification_program.js';

interface VerificationResult {
  isDeepfake: boolean;
  confidence: number;
  phash: string;
  ipfsCid: string;
  verified: boolean;
  timestamp: Date;
  signature: string;
  predictionLabel: string;
}

interface ProofAccount {
  pubkey: string;
  user: string;
  predictionScore: number;
  phash: string;
  cid: string;
  verified: boolean;
  timeProofed: number;
}

export function VerifySection() {
  const router = useRouter();
  const { connected } = useContext(WalletContext);

  useEffect(() => {
    if (!connected) {
      toast.error("Please connect the wallet");
      router.push("/");
    }
  }, [connected, router]);

  if (!connected) return null;



  const { publicKey, signTransaction } = useWallet();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [proofAccounts, setProofAccounts] = useState<ProofAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ProofAccount | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const fetchUserProofAccounts = useCallback(async () => {
    if (!publicKey) return;

    setLoadingAccounts(true);
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const dummyKeypair = Keypair.generate();

      // Create a simple wallet implementation for read-only operations
      const wallet = {
        publicKey: dummyKeypair.publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };

      const provider = new AnchorProvider(connection, wallet, {});
      const programId = new PublicKey("71MAQYwkwnJqyt5yRvFPBcs9t7mnsRyc3Eih9qNjCCDa");
      const program = new Program(idl as any, programId, provider);

      const offsetOfUser = 8;
      const proofAccountsData = await connection.getProgramAccounts(programId, {
        filters: [
          {
            dataSize: 186,
          },
          {
            memcmp: {
              offset: offsetOfUser,
              bytes: publicKey.toBase58(),
            },
          },
        ],
      });

      const accounts: ProofAccount[] = [];
      for (const acc of proofAccountsData) {
        try {
          const account = await program.account.proofDetail.fetch(acc.pubkey) as any;
          accounts.push({
            pubkey: acc.pubkey.toString(),
            user: account.user.toBase58(),
            predictionScore: account.predictionScore,
            phash: account.phash,
            cid: account.cid,
            verified: account.verified,
            timeProofed: Number(account.timeProofed)
          });
        } catch (err) {
          console.error('Error fetching account:', err);
        }
      }

      setProofAccounts(accounts.sort((a, b) => b.timeProofed - a.timeProofed));
    } catch (error) {
      console.error('Error fetching proof accounts:', error);
      toast.error('Failed to fetch verification history');
    } finally {
      setLoadingAccounts(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchUserProofAccounts();
    }
  }, [publicKey, fetchUserProofAccounts]);

  const processVideo = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Show initial progress
      setProgress(10);
      toast.info('Uploading video and processing...');

      // Create form data
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('userPubkey', publicKey?.toString() || '');

      // Make API call to backend
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setProgress(60);
      toast.info('Sign the transaction to store prove on blockchain');

      const data = await response.json();

      const recoveredTx = Transaction.from(Buffer.from(data.transaction, "base64"));
      if (!signTransaction) {
        throw new Error("Wallet not connected or sign transaction not available");
      }
      const signedTx = await signTransaction(recoveredTx);
      const signedRes = await fetch("http://localhost:5001/api/submit-txn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedTx: signedTx.serialize().toString("base64"),
        }),
      });
      if (!signedRes.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setProgress(80);
      toast.info('Finalizing results...');

      const signature = await signedRes.json();

      setProgress(100);
      toast.success('Processing complete!');

      // Map API response to our result interface
      const result: VerificationResult = {
        isDeepfake: data.prediction_label === 'FAKE',
        confidence: parseFloat(data.prediction_score),
        phash: data.phash,
        ipfsCid: data.cid,
        verified: signedRes.ok,
        timestamp: new Date(),
        signature: signature.transaction || '',
        predictionLabel: data.prediction_label
      };

      setResult(result);
      fetchUserProofAccounts(); // Refresh the accounts list
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error('Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <section className="py-20 min-h-screen bg-gradient-to-b from-black to-gray-900/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Verify Video Authenticity
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload a video to detect if it&apos;s been manipulated using our privacy-preserving AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-black/50 backdrop-blur border-gray-800 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5 text-cyan-400" />
                  Upload Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-gray-600 hover:border-gray-500'
                    }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-cyan-400">Drop the video here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-300 mb-2">
                        Drag & drop a video here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        MP4, MOV, AVI, MKV up to 100MB
                      </p>
                    </div>
                  )}
                </div>

                {videoPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <Badge className="absolute top-2 right-2 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      <Video className="h-3 w-3 mr-1" />
                      {uploadedFile?.name}
                    </Badge>
                  </motion.div>
                )}

                <Button
                  onClick={processVideo}
                  disabled={!uploadedFile || isProcessing}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Generate Proof'
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-gray-400 text-center">
                      {progress}% Complete
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Side - Results and History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Verification Results Section */}
            <Card className="bg-black/50 backdrop-blur border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Verification Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className={`inline-flex p-4 rounded-full mb-4 ${result.isDeepfake
                          ? 'bg-red-500/20 border border-red-500/30'
                          : 'bg-green-500/20 border border-green-500/30'
                        }`}>
                        {result.isDeepfake ? (
                          <XCircle className="h-8 w-8 text-red-400" />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-green-400" />
                        )}
                      </div>
                      <h3 className={`text-2xl font-bold ${result.isDeepfake ? 'text-red-400' : 'text-green-400'
                        }`}>
                        {result.isDeepfake ? 'Deepfake Detected' : 'Authentic Video'}
                      </h3>
                      <p className="text-gray-300 mt-2">
                        Prediction: {result.predictionLabel} | Confidence: {result.confidence.toFixed(1)}%
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400">Perceptual Hash:</span>
                        <div className="flex items-center gap-2">
                          <code
                            className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded cursor-pointer hover:bg-cyan-500/20"
                            onClick={() => {
                              navigator.clipboard.writeText(result.phash);
                              toast.success('Perceptual hash copied to clipboard!');
                            }}
                            title="Click to copy"
                          >
                            {result.phash.substring(0, 10)}...
                          </code>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400">IPFS CID:</span>
                        <div className="flex items-center gap-2">
                          <code
                            className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded cursor-pointer hover:bg-purple-500/20"
                            onClick={() => {
                              navigator.clipboard.writeText(result.ipfsCid);
                              toast.success('IPFS CID copied to clipboard!');
                            }}
                            title="Click to copy"
                          >
                            {result.ipfsCid.substring(0, 10)}...
                          </code>
                        </div>
                      </div>
                      {result.verified && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <span className="text-gray-400">Blockchain Verified:</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-400">Yes</span>
                          </div>
                        </div>
                      )}
                      {result.verified && result.signature && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <span className="text-gray-400">Transaction:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                              {result.signature.substring(0, 10)}...
                            </code>
                            <span
                              className="cursor-pointer hover:text-white"
                              onClick={() => {
                                window.open(`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`, '_blank');
                              }}
                              title="View on Solana Explorer"
                            >
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400">Verified At:</span>
                        <span className="text-gray-300">
                          {result.timestamp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Upload a video to see verification results</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification History Section */}
            <Card className="bg-black/50 backdrop-blur border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-400" />
                  Verification History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAccounts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    <span className="ml-2 text-gray-300">Loading history...</span>
                  </div>
                ) : proofAccounts.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {proofAccounts.map((account, index) => (
                      <motion.div
                        key={account.pubkey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:bg-purple-500/10"
                        onClick={() => setSelectedAccount(account)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {account.verified ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                            <Badge className={`text-xs ${account.predictionScore > 55
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-green-500/20 text-green-400 border-green-500/30'
                              }`}>
                              {account.predictionScore > 55 ? 'FAKE' : 'REAL'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(account.timeProofed * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-300">
                          Score: {account.predictionScore}% | Hash: {account.phash.substring(0, 8)}...
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No verification history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Account Details Modal */}
        {selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAccount(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/90 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Verification Details
                  </span>
                </h2>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status Card */}
                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-full mb-4 ${selectedAccount.predictionScore > 50
                      ? 'bg-red-500/20 border border-red-500/30'
                      : 'bg-green-500/20 border border-green-500/30'
                    }`}>
                    {selectedAccount.predictionScore > 50 ? (
                      <XCircle className="h-8 w-8 text-red-400" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold ${selectedAccount.predictionScore > 50 ? 'text-red-400' : 'text-green-400'
                    }`}>
                    {selectedAccount.predictionScore > 50 ? 'Deepfake Detected' : 'Authentic Video'}
                  </h3>
                  <p className="text-gray-300 mt-2">
                    Confidence Score: {selectedAccount.predictionScore}%
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Account Address</h4>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded flex-1">
                          {selectedAccount.pubkey.substring(0, 20)}...
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAccount.pubkey);
                            toast.success('Account address copied!');
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">User Address</h4>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded flex-1">
                          {selectedAccount.user.substring(0, 20)}...
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAccount.user);
                            toast.success('User address copied!');
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Verification Status</h4>
                      <div className="flex items-center gap-2">
                        {selectedAccount.verified ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className={selectedAccount.verified ? 'text-green-400' : 'text-red-400'}>
                          {selectedAccount.verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Perceptual Hash</h4>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded flex-1">
                          {selectedAccount.phash.substring(0, 20)}...
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAccount.phash);
                            toast.success('Perceptual hash copied!');
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">IPFS CID</h4>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded flex-1">
                          {selectedAccount.cid.substring(0, 20)}...
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAccount.cid);
                            toast.success('IPFS CID copied!');
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Verification Date</h4>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">
                          {new Date(selectedAccount.timeProofed * 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* View on Explorer */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      window.open(`https://explorer.solana.com/address/${selectedAccount.pubkey}?cluster=devnet`, '_blank');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 rounded-lg transition-all duration-200 text-white font-semibold"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Solana Explorer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}