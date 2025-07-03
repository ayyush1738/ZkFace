import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ZKDetect - Privacy-Preserving Deepfake Detection',
  description: 'Detect deepfakes with zero-knowledge proofs. Verify authenticity without compromising privacy.',
  keywords: 'deepfake detection, zero-knowledge proofs, blockchain, privacy, AI',
  authors: [{ name: 'ZKDetect Team' }],
  openGraph: {
    title: 'ZKDetect - Privacy-Preserving Deepfake Detection',
    description: 'Detect deepfakes with zero-knowledge proofs. Verify authenticity without compromising privacy.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Providers>
          {children}
          <Toaster theme="dark" />
        </Providers>
      </body>
    </html>
  );
}