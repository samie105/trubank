"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  title: string;
  quote: string;
  image: string;
  thumbnail: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Tony E.",
    location: "Co-Founder, VeloBank",
    title: "Trubank gave us the power to launch our digital bank in under 90 days.",
    quote:
      "We were looking for a core banking partner that could scale with our ambition. Trubank delivered exactly that. Their flexible product engine, ledger architecture, and seamless onboarding process helped us go live fast — with full control over our fees, GL mapping, and customer flows.",
    image: "/assets/TestimonialNew/Picture 1.jpg",
    thumbnail: "/assets/TestimonialNew/Picture 1.jpg",
  },
  {
    id: 2,
    name: "Fatima Lawal",
    location: "Head of Operations, Crescent MFB",
    title: "With Trubank, we digitized our entire banking operations without writing a single line of code.",
    quote:
      "Our institution had struggled with legacy systems for years. Trubank’s no-code setup allowed our internal teams to configure products, accounts, and reporting easily — all tailored to our regulatory needs. It’s transformed how we serve customers.",
    image: "/assets/TestimonialNew/Picture 2.jpg",
    thumbnail: "/assets/TestimonialNew/Picture 2.jpg",
  },
  {
    id: 3,
    name: "Adetomiwa B.",
    location: "CTO, NovaSwitch",
    title: "The transaction posting engine and GL/SL framework are enterprise-grade.",
    quote:
      "We’ve used multiple core banking systems in the past, but Trubank stood out for its elegant approach to double-entry accounting, fee handling, and custom transaction logic. Our dev team could integrate and customize quickly without losing compliance fidelity.",
    image: "/assets/TestimonialNew/Picture 3.jpg",
    thumbnail: "/assets/TestimonialNew/Picture 3.jpg",
  },
  {
    id: 4,
    name: "Grace Ijeoma",
    location: "Product Manager, FieldLine Finance",
    title: "Trubank is more than software — it’s a full infrastructure solution.",
    quote:
      "We use Trubank to power agent wallets, savings products, and internal transfers. The support team worked closely with us to align the platform with our branch structure and product offerings. It’s a robust core for any serious fintech operator.",
    image: "/assets/TestimonialNew/picture 4.jpg",
    thumbnail: "/assets/TestimonialNew/picture 4.jpg",
  },
];

export function Testimonials() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white px-3 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            TESTIMONIAL
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What Our <span className="text-primary">Clients</span>
            <br />
            Say About Us?
          </p>
        </div>

        <div className="mt-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "transition-opacity duration-500",
                index === activeTestimonial
                  ? "block opacity-100"
                  : "hidden opacity-0"
              )}
            >
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                {/* Image */}
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl lg:aspect-[5/4]">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={`Testimonial by ${testimonial.name}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center">
                  <div className="mb-6">
                    <svg
                      className="h-12 w-12 text-primary"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                  </div>

                  <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                    {testimonial.title}
                  </h3>
                  <p className="mb-8 text-sm text-gray-600">
                    {testimonial.quote}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    – {testimonial.name},{" "}
                    <span className="text-gray-600">
                      {testimonial.location}
                    </span>
                  </p>

                  {/* Thumbnails */}
                  <div className="mt-8 flex gap-3">
                    {testimonials.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTestimonial(idx)}
                        className={cn(
                          "relative h-12 w-12 overflow-hidden rounded-full transition-all",
                          idx === activeTestimonial
                            ? "ring-2 ring-primary ring-offset-2"
                            : "opacity-50 hover:opacity-100"
                        )}
                      >
                        <Image
                          src={t.thumbnail || "/placeholder.svg"}
                          alt={`Switch to ${t.name}'s testimonial`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
