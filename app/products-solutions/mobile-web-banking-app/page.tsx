"use client"
import { Footer } from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";
import MobileBanking from "@/components/main/Product-solution/Mobile-Web";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";
import Link from "next/link";

export default function page() {
  return (
    <div className="bg-white">
      <Navbar />
      <MobileBanking />
      <div className="p-8">
        {" "}
        <div
          className="relative mt-16 rounded-2xl bg-primary p-8 text-center sm:p-12 bg-cover bg-center"
          style={{
            backgroundImage: "url(/assets/howitworksbgpattern.png)",
          }}
        >
          <div className="absolute inset-0 bg-primary opacity-80 rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              Empower your Institution Today
            </h3>
            <p className="text-sm mt-3 font-medium text-white/80">
              Let Trubank transform your digital banking experience with a
              tailored solution that fits your needs. Whether you&apos;re looking to
              enhance customer satisfaction, streamline operations, or expand
              your services, our Mobile/Web Banking App delivers unmatched
              value.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/contacts">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
