'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Globe, Zap } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your videos and AI predictions remain completely private while still providing verifiable proof of authenticity.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    icon: Eye,
    title: 'Transparent Verification',
    description: 'Anyone can verify the authenticity proof on the blockchain without accessing your sensitive data.',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    icon: Globe,
    title: 'Decentralized Trust',
    description: 'No central authority controls the verification process. Trust is established through cryptographic proofs.',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Lightning Speed',
    description: 'Advanced AI models and optimized ZKP generation provide results in seconds, not minutes.',
    gradient: 'from-orange-400 to-red-500',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900/50 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Why Choose ZKDetect?
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of deepfake detection with privacy-preserving technology.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-black/50 backdrop-blur border-gray-800 hover:border-gray-700 transition-all duration-300 group">
                <CardHeader>
                  <div className={`inline-flex p-4 rounded-lg bg-gradient-to-r ${benefit.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-2xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}