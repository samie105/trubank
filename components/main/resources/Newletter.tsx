"use client";

import type React from "react";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Thanks for subscribing!", {
      description: "You'll receive our newsletter updates soon.",
    });

    setEmail("");
    setIsLoading(false);
  };

  return (
    <section className="relative rounded-2xl overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 bg-primary opacity-100"
        style={{
          backgroundImage: "url('/assets/howitworksbgpattern.png')",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="absolute inset-0  bg-primary opacity-80 rounded-2xl"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Join TruBank Newsletter!
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Stay updated with the latest in digital banking and fintech.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col gap-4 sm:flex-row bg-white/20 p-3 rounded-xl  sm:gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-white/10/ bg-transparent border-none ring-0 focus-within:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 text-white placeholder:text-white/60"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 bg-white px-8 text-primary hover:bg-white/90"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Toaster />
    </section>
  );
}
