'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Lock } from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/background-beams';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <BackgroundBeams />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="flex justify-center space-x-4 mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30"
            >
              <Shield className="h-8 w-8 text-cyan-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
            >
              <Zap className="h-8 w-8 text-purple-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30"
            >
              <Lock className="h-8 w-8 text-green-400" />
            </motion.div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-400 bg-clip-text text-transparent">
              Privacy-First
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Deepfake Detection
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Detect deepfakes with <span className="text-cyan-400 font-semibold">Zero-Knowledge Proofs</span>.
            <br />
            Verify authenticity without compromising your privacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/verify">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold px-8 py-3 text-lg"
              >
                Start Detecting
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button 
                variant="outline" 
                size="lg"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-3 text-lg"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex justify-center items-center space-x-8 text-sm text-gray-400 pt-8"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Zero-Knowledge Proofs</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>Blockchain Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>IPFS Storage</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}