import { PageWrapper } from "@/components/layout/PageWrapper";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import ModelShowcase from "@/components/landing/ModelShowcase";
import PricingSection from "@/components/landing/PricingSection";
import Testimonials from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTAFooter } from "@/components/landing/CTAFooter";

export default function LandingPage() {
  return (
    <PageWrapper>
      <Hero />
      <HowItWorks />
      <ModelShowcase />
      <PricingSection />
      <Testimonials />
      <FAQ />
      <CTAFooter />
    </PageWrapper>
  );
}
