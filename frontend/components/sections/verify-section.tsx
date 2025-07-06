'use client';

import React, { useState, useCallback, useContext } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useConnection, useWallet, WalletContext } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation'
import { Transaction } from '@solana/web3.js';

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

export function VerifySection() {
  const router = useRouter();
  const {connected} = useContext(WalletContext);
  if(!connected) {
    toast.error("Please connect the wallet");
    router.push("/");
  }

  const {publicKey, signTransaction} = useWallet();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VerificationResult | null>(null);

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
      console.log(signedRes);
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
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-black/50 backdrop-blur border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5 text-cyan-400" />
                  Upload Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
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

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
                      <div className={`inline-flex p-4 rounded-full mb-4 ${
                        result.isDeepfake 
                          ? 'bg-red-500/20 border border-red-500/30' 
                          : 'bg-green-500/20 border border-green-500/30'
                      }`}>
                        {result.isDeepfake ? (
                          <XCircle className="h-8 w-8 text-red-400" />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-green-400" />
                        )}
                      </div>
                      <h3 className={`text-2xl font-bold ${
                        result.isDeepfake ? 'text-red-400' : 'text-green-400'
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}