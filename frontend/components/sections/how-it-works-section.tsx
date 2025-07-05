'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Brain, Lock, CheckCircle } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Video',
    description: 'Securely upload your video using our encrypted interface. Videos are processed locally first.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    step: '02',
    icon: Brain,
    title: 'AI Analysis',
    description: 'Our EfficientNet-ViT model analyzes the video for deepfake indicators with high accuracy.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    step: '03',
    icon: Lock,
    title: 'Generate ZKP',
    description: 'Create a Zero-Knowledge Proof that verifies the result without revealing sensitive data.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Verify On-Chain',
    description: 'Submit the proof to Ethereum smart contract for transparent, immutable verification.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A simple 4-step process that ensures privacy while providing verifiable results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="h-full bg-gray-900/50 backdrop-blur border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="relative">
                    <div className={`inline-flex p-4 rounded-full ${step.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <CardTitle className="text-white text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}