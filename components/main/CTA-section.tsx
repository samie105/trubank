import { ArrowRight } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

export default function CTAsection() {
  return (
    <div
      className="relative mt-16 rounded-2xl bg-primary p-8 text-center sm:p-12 bg-cover bg-center"
      style={{
        backgroundImage: "url(/assets/howitworksbgpattern.png)",
      }}
    >
      <div className="absolute inset-0 bg-primary opacity-80 rounded-2xl"></div>
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to Power Your Financial Institution?
        </h3>
        <Button
          size="lg"
          className="mt-6 bg-white text-primary hover:bg-white/90"
        >
          Get Started Today
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
