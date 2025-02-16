import CTAsection from "@/components/main/CTA-section";
import { Footer } from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";
import SolutionsPage from "@/components/main/Product-solution";
import React from "react";

export default function page() {
  return (
    <div>
      <Navbar />
      <SolutionsPage />
      <div className="px-8 bg-white py-12">
        <CTAsection />
      </div>

      <Footer />
    </div>
  );
}
