"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

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

        <div className="mt-16 relative">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 p-2 md:-ml-4">
              {steps.map((step) => (
                <CarouselItem
                  key={step.number}
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2"
                >
                  <Card className="bg-white text-black border-gray-100">
                    <CardHeader>
                      <CardTitle className="flex flex-col gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xl font-semibold text-primary">
                            {step.number}
                          </span>
                        </div>
                        <div className="text-gray-600">{step.title}</div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{step.description}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* <CarouselPrevious />
            <CarouselNext /> */}
          </Carousel>

          {/* Mini Navigation Arrows and Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  current === index + 1 ? "bg-primary" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
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
      </div>
    </section>
  );
}
