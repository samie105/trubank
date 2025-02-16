import CTAsection from "@/components/main/CTA-section";
import { Footer } from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";
import CustomerMangament from "@/components/main/Product-solution/CustomerManagement";

import React from "react";

export default function page() {
  return (
    <div className="bg-white">
      <Navbar />
      <CustomerMangament />
      <div className="p-8">
        <CTAsection />
      </div>

      <Footer />
    </div>
  );
}
