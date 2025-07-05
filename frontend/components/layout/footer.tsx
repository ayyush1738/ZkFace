import Link from 'next/link';
import { Shield, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-cyan-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ZKDetect
              </span>
            </Link>
            <p className="text-gray-400 max-w-md">
              Privacy-preserving deepfake detection using Zero-Knowledge Proofs. 
              Verify authenticity without compromising your data.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/how-it-works" className="block text-gray-400 hover:text-white transition-colors">
                How it Works
              </Link>
              <Link href="/verify" className="block text-gray-400 hover:text-white transition-colors">
                Verify
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://github.com/ayyush1738/ZkFace" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://x.com/AyushSingh1738" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ZKDetect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}