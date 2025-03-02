import React from "react";
import Navbar from "@/components/main/Navbar";
import { Footer } from "@/components/main/Footer";
import CTAsection from "@/components/main/CTA-section";

export default function page() {
  return (
    <div className="bg-white">
      <Navbar />
      <section className="relative min-h-[40vh] overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/assets/howitworksbgpattern.png)",
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-primary/90" />

        {/* Content */}
        <div className="relative z-20 mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
          <span className="inline-block mt-10 rounded-full bg-white px-4 py-1 text-sm font-medium text-primary">
            Documentation
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-yellow-300">Proper </span>Documentation
          </h1>{" "}
          <p className="text-center  text-lg text-gray-200 mt-4">
            Access user guides and product manuals for easy reference.
          </p>
        </div>
      </section>
      <div className="p-8">
        <CTAsection />
      </div>
      <Footer />
    </div>
  );
}
