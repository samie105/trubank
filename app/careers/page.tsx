import CareersPage from "@/components/main/careers/career";
import CTAsection from "@/components/main/CTA-section";
import { Footer } from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";
import React from "react";

export default function page() {
  return (
    <div className="bg-white">
      {" "}
      <Navbar />
      <CareersPage />
      <div className="px-8 bg-white py-12">
        <CTAsection />
      </div>
      <Footer />
    </div>
  );
}
