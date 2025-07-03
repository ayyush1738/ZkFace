import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { DetailedHowItWorks } from '@/components/sections/detailed-how-it-works';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="pt-20">
        <DetailedHowItWorks />
      </main>
      <Footer />
    </div>
  );
}