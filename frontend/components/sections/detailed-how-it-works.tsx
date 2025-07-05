'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Brain, Lock, CheckCircle, Server, Globe } from 'lucide-react';

const detailedSteps = [
  {
    id: 1,
    icon: Upload,
    title: 'Video Upload & Preprocessing',
    description: 'Your video is securely uploaded and preprocessed locally before any analysis begins.',
    details: [
      'End-to-end encryption during upload',
      'Local preprocessing to protect privacy',
      'Perceptual hash (pHash) generation',
      'Metadata extraction and sanitization'
    ],
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20'
  },
  {
    id: 2,
    icon: Brain,
    title: 'AI Model Analysis',
    description: 'Advanced EfficientNet-ViT hybrid model analyzes the video for deepfake indicators.',
    details: [
      'EfficientNet feature extraction',
      'Vision Transformer attention analysis',
      'Multi-scale deepfake detection',
      'Confidence score generation'
    ],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  {
    id: 3,
    icon: Lock,
    title: 'Zero-Knowledge Proof Generation',
    description: 'Generate cryptographic proof that validates the AI prediction without revealing sensitive data.',
    details: [
      'zk-SNARK circuit compilation',
      'Witness generation from AI output',
      'Proof generation with private inputs',
      'Public verification key creation'
    ],
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  {
    id: 4,
    icon: CheckCircle,
    title: 'Smart Contract Verification',
    description: 'Submit the proof to Ethereum smart contract for decentralized verification.',
    details: [
      'Proof submission to blockchain',
      'Smart contract verification',
      'Gas-optimized verification',
      'Immutable result storage'
    ],
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  {
    id: 5,
    icon: Server,
    title: 'Result Processing',
    description: 'Process and format the verification results for user consumption.',
    details: [
      'Result interpretation',
      'Confidence level calculation',
      'Timestamp verification',
      'Transaction hash generation'
    ],
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  },
  {
    id: 6,
    icon: Globe,
    title: 'IPFS Storage',
    description: 'Store metadata and proof data on IPFS for decentralized access and permanence.',
    details: [
      'Metadata IPFS upload',
      'Content addressing',
      'Distributed storage',
      'Public accessibility'
    ],
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  }
];

export function DetailedHowItWorks() {
  return (
    <section className="py-20 min-h-screen bg-gradient-to-b from-black to-gray-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              How ZKDetect Works
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A comprehensive look at our privacy-preserving deepfake detection process using Zero-Knowledge Proofs.
          </p>
        </motion.div>

        <div className="space-y-8">
          {detailedSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`bg-black/50 backdrop-blur border ${step.borderColor} hover:bg-black/70 transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-center gap-6">
                    <div className={`flex-shrink-0 p-4 rounded-full ${step.bgColor}`}>
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">
                          Step {step.id}
                        </Badge>
                        <CardTitle className="text-white text-2xl">{step.title}</CardTitle>
                      </div>
                      <p className="text-gray-300 text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-20">
                    {step.details.map((detail, detailIndex) => (
                      <motion.div
                        key={detailIndex}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (detailIndex * 0.05) }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50"
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color.replace('text-', 'from-')} to-white`}></div>
                        <span className="text-gray-300">{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur border-gray-700">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Privacy-First Architecture
              </h3>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Our system ensures that sensitive data like video content, perceptual hashes, and AI prediction scores 
                never leave your device in plaintext. Only the cryptographic proof is shared, maintaining complete privacy 
                while enabling public verification.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}