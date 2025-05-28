"use client"
import { FeaturesSection } from "@/components/main/Features-section";
import { Footer } from "@/components/main/Footer";
import HeroSection from "@/components/main/Hero-section";
import { HowItWorks } from "@/components/main/How_it_works";
import Navbar from "@/components/main/Navbar";
import { Testimonials } from "@/components/main/Testimonials";
import { PartnersSlider } from "@/components/main/Trusted-Partner";

export default function Home() {
  return (
    <div>
      <section className="h-screen bg-primary overflow-hidden">
        <Navbar />
        <HeroSection />
      </section>
      <FeaturesSection />
      <PartnersSlider />
      <Testimonials />
      <HowItWorks />
      <Footer />
    </div>
  );
}
