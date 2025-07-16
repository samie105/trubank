import { Metadata } from "next";
import CTAsection from "@/components/main/CTA-section";
import { Footer } from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";
import SolutionsPage from "@/components/main/Product-solution/Product-solution";
import React from "react";

export const metadata: Metadata = {
  title: "Trubank Solutions – Digital Core Banking Platform for Fintechs",
  description: "Discover Trubank's robust features: wallet management, account creation, transaction processing, GL/SL setup, regulatory reporting, and more. Built for scalability and compliance.",
  keywords: "banking solutions, fintech software Nigeria, core banking features, wallet system, GL SL management, account generation, financial compliance, fintech infrastructure, banking APIs, Trubank platform",
  openGraph: {
    title: "Trubank Solutions – Digital Core Banking Platform for Fintechs",
    description: "Explore our powerful suite of banking solutions — account management, transaction processing, GL/SL setup, and more.",
    url: "https://trubank.ng/solutions",
    type: "website",
    images: [
      {
        url: "https://trubank.ng/assets/logo-dark.png",
        alt: "Trubank Solutions – Digital Core Banking Platform for Fintechs"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Trubank Solutions – Digital Core Banking Platform for Fintechs",
    description: "Comprehensive banking features built for modern fintechs. Flexible, scalable, and regulation-ready.",
    images: ["https://trubank.ng/assets/logo-dark.png"]
  }
};

export default function page() {
  return (
    <div>
      <Navbar />
      <SolutionsPage />
      <div className="px-8 mt-5 bg-white py-12">
        <CTAsection />
      </div>

      <Footer />
    </div>
  );
}
