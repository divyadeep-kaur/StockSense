import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { WaveDivider } from "@/components/landing/wave-divider";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InventoryFlow } from "@/components/landing/inventory-flow";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WaveDivider />
        <Features />
        <HowItWorks />
        <InventoryFlow />
        <DashboardPreview />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
