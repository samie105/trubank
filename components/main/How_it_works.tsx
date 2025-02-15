"use client";

import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Initial Consultation",
    description: "Our team assesses your institution's unique needs.",
  },
  {
    number: 2,
    title: "Custom Integration",
    description:
      "We customize and integrate the TruBank platform into your existing systems.",
  },
  {
    number: 3,
    title: "Training & Support",
    description:
      "We provide comprehensive training for your staff and offer 24/7 technical support.",
  },
  {
    number: 4,
    title: "Continuous Improvements",
    description:
      "TruBank evolves with your institution through regular updates and new feature releases.",
  },
];

export function HowItWorks() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const stepsPerSlide = 3;
  const totalSlides = Math.ceil(steps.length / stepsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            HOW IT WORKS
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simplifying <span className="text-primary">Banking</span>,
            <br />
            One Step At A Time
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-gray-600">
            Discover how our streamlined process empowers your institution with
            tailored solutions, seamless integration, and ongoing support to
            drive innovation and efficiency.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Navigation Buttons */}
          <div className="absolute left-0 right-0 top-1/2 z-10 flex -translate-y-1/2 justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="h-12 w-12 rounded-full bg-white/80 shadow-lg backdrop-blur-sm hover:bg-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="h-12 w-12 rounded-full bg-white/80 shadow-lg backdrop-blur-sm hover:bg-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Steps Grid */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="grid w-full shrink-0 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {steps
                    .slice(
                      slideIndex * stepsPerSlide,
                      (slideIndex + 1) * stepsPerSlide
                    )
                    .map((step) => (
                      <div
                        key={step.number}
                        className="relative flex flex-col items-start p-6"
                      >
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xl font-semibold text-primary">
                            {step.number}
                          </span>
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">
                          {step.title}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  currentSlide === index
                    ? "w-8 bg-primary"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary to-primary p-8 text-center sm:p-12">
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
    </section>
  );
}
