import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VerifySection } from '@/components/sections/verify-section';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="pt-20">
        <VerifySection />
      </main>
      <Footer />
    </div>
  );
}