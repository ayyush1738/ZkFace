'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationResult {
  isDeepfake: boolean;
  confidence: number;
  txHash: string;
  ipfsCid: string;
  timestamp: Date;
}

export function VerifySection() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const simulateProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing steps
    const steps = [
      { message: 'Uploading image...', progress: 20 },
      { message: 'Running AI analysis...', progress: 40 },
      { message: 'Generating Zero-Knowledge Proof...', progress: 70 },
      { message: 'Verifying on blockchain...', progress: 90 },
      { message: 'Complete!', progress: 100 },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(step.progress);
      toast.info(step.message);
    }

    // Simulate result
    const mockResult: VerificationResult = {
      isDeepfake: Math.random() > 0.5,
      confidence: Math.random() * 30 + 70, // 70-100%
      txHash: '0x' + Math.random().toString(16).substr(2, 40),
      ipfsCid: 'Qm' + Math.random().toString(36).substr(2, 44),
      timestamp: new Date(),
    };

    setResult(mockResult);
    setIsProcessing(false);
    setProgress(0);
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
              Verify Image Authenticity
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload an image to detect if it's been manipulated using our privacy-preserving AI.
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
                  Upload Image
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
                    <p className="text-cyan-400">Drop the image here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-300 mb-2">
                        Drag & drop an image here, or click to select
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <Badge className="absolute top-2 right-2 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      <Image className="h-3 w-3 mr-1" />
                      {uploadedFile?.name}
                    </Badge>
                  </motion.div>
                )}

                <Button
                  onClick={simulateProcessing}
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
                        {result.isDeepfake ? 'Deepfake Detected' : 'Authentic Image'}
                      </h3>
                      <p className="text-gray-300 mt-2">
                        Confidence: {result.confidence.toFixed(1)}%
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400">Transaction Hash:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                            {result.txHash.substring(0, 10)}...
                          </code>
                          <ExternalLink className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-gray-400">IPFS CID:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                            {result.ipfsCid.substring(0, 10)}...
                          </code>
                          <ExternalLink className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white" />
                        </div>
                      </div>
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
                    <p>Upload an image to see verification results</p>
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