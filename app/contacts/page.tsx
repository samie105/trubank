"use client";
import ContactPage from "@/components/main/contact/contactpage";
import CTAsection from "@/components/main/CTA-section";
import Navbar from "@/components/main/Navbar";
import React from "react";
import { Footer } from "react-day-picker";

export default function page() {
  return (
    <div className="bg-white">
      {" "}
      <Navbar />
      <ContactPage />
      <div className="px-8 bg-white py-12">
        <CTAsection />
      </div>
      <Footer />
    </div>
  );
}
