"use client"
import CTAsection from "@/components/main/CTA-section";
import { Footer } from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";
import KYCCompliance from "@/components/main/Product-solution/KYC-Compliance";

import React from "react";

export default function page() {
  return (
    <div className="bg-white">
      <Navbar />
      <KYCCompliance />
      <div className="p-8">
        <CTAsection />
      </div>

      <Footer />
    </div>
  );
}
