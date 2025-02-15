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
    name: "James T.",
    location: "Uganda",
    title: "Effortless Financial Management",
    quote:
      "As a freelancer, I need tools that help me stay on top of invoices, payments, and savings. This service has streamlined all of that and more. It's intuitive, reliable, and has completely changed how I handle my money.",
    image: "/assets/main-testimonials/James-T-Uganda.jpeg",
    thumbnail: "/assets/main-testimonials/James-T-Uganda.jpeg",
  },
  {
    id: 2,
    name: "Marcus W.",
    location: "South Africa",
    title: "Banking That Works For My Lifestyle",
    quote:
      "I travel often and need a banking service that's accessible and secure. This app delivers in every way. From easy account management to quick customer support, it's like they thought of everything I'd need.",
    image: "/assets/main-testimonials/Marcus-W-SA.jpeg",
    thumbnail: "/assets/main-testimonials/Marcus-W-SA.jpeg",
  },
  {
    id: 3,
    name: "Kwame O.",
    location: "Ghana",
    title: "Reliable Banking, Anytime",
    quote:
      "Living in Accra, I need a banking solution I can trust, especially for transactions across borders. This service has been a game-changer. The app is seamless, and customer support is always ready to help. I've never felt more in control of my finances.",
    image: "/assets/main-testimonials/Kwame-O-Ghana.jpeg",
    thumbnail: "/assets/main-testimonials/Kwame-O-Ghana.jpeg",
  },
  {
    id: 4,
    name: "Chijioke A.",
    location: "Nigeria",
    title: "Banking That Keeps Up With My Hustle",
    quote:
      "As an entrepreneur in Lagos, I need a banking partner that's reliable and fast. This platform delivers every time! From smooth transfers to real-time alerts, it's like they understand my business inside out. I've never felt this confident about my finances.",
    image: "/assets/main-testimonials/Chijoke-A-Nigeria.png",
    thumbnail: "/assets/main-testimonials/Chijoke-A-Nigeria.png",
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
    <section className="bg-white py-24">
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
