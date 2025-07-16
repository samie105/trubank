import React from "react";
import { Metadata } from "next";
import AboutPage from "@/components/main/About-Us";
import CTAsection from "@/components/main/CTA-section";
import { Footer } from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";

export const metadata: Metadata = {
  title: "About Trubank – Powering the Future of Digital Banking",
  description: "Trubank is a technology-driven banking platform focused on helping fintechs and banks scale faster. Learn about our mission, team, and commitment to financial innovation.",
  keywords: "about Trubank, fintech company Nigeria, digital banking platform, financial technology, core banking innovation, banking software team, fintech mission, Trubank profile, core banking company",
  openGraph: {
    title: "About Trubank – Powering the Future of Digital Banking",
    description: "Learn more about Trubank's vision, values, and mission to drive digital transformation in financial services.",
    url: "https://trubank.ng/about",
    type: "website",
    images: [
      {
        url: "https://trubank.ng/assets/logo-dark.png",
        alt: "About Trubank – Powering the Future of Digital Banking"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "About Trubank – Powering the Future of Digital Banking",
    description: "We are committed to building flexible and secure banking software to help financial institutions grow and innovate.",
    images: ["https://trubank.ng/assets/logo-dark.png"]
  }
};

export default function page() {
  return (
    <div>
      <Navbar />
      <AboutPage />
      <div className="px-8 bg-white py-12">
        <CTAsection />
      </div>

      <Footer />
    </div>
  );
}
