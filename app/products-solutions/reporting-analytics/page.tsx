import CTAsection from "@/components/main/CTA-section";
import { Footer } from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";
import ReportingAnalytics from "@/components/main/Product-solution/Reporting-Analytics";

import React from "react";

export default function page() {
  return (
    <div className="bg-white">
      <Navbar />
      <ReportingAnalytics />
      <div className="p-8">
        <CTAsection />
      </div>

      <Footer />
    </div>
  );
}
