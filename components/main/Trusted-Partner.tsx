"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Partner {
  name: string;
  logo: string;
  width: number;
  height: number;
}

const partners: Partner[] = [
  {
    name: "Cent",
    logo: "/assets/main-slides/Tencent.png",
    width: 120,
    height: 40,
  },
  {
    name: "OpenSea",
    logo: "/assets/main-slides/OpenSea.png",
    width: 120,
    height: 40,
  },
  {
    name: "Fox Hub",
    logo: "/assets/main-slides/Fox Hub.png",
    width: 120,
    height: 40,
  },
  {
    name: "Hexa",
    logo: "/assets/main-slides/Hexa.png",
    width: 120,
    height: 40,
  },
  {
    name: "Aven",
    logo: "/assets/main-slides/Aven.png",
    width: 120,
    height: 40,
  },
  {
    name: "Goldline",
    logo: "/assets/main-slides/Goldline.png",
    width: 120,
    height: 40,
  },
  {
    name: "Kanba",
    logo: "/assets/main-slides/Kanba.png",
    width: 120,
    height: 40,
  },
  {
    name: "Shutterfly",
    logo: "/assets/main-slides/Shutterfly.png",
    width: 120,
    height: 40,
  },
  {
    name: "Circle",
    logo: "/assets/main-slides/Circle.png",
    width: 120,
    height: 40,
  },
];

export function PartnersSlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <section className="bg-white py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Trusted By <span className="text-primary">20,000+</span> known
            companies
          </h2>
        </div>

        <div className="relative mt-12">
          {/* Gradient overlays */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent" />

          <Carousel
            opts={{
              align: "center",
              loop: true,
              skipSnaps: false,
              dragFree: true,
            }}
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {/* First set of partners */}
              {partners.map((partner, index) => (
                <CarouselItem
                  key={`${partner.name}-${index}`}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                >
                  <div className="flex items-center justify-center p-2">
                    <div className="relative h-12 w-[120px]">
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={`${partner.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
              {/* Duplicate set for seamless loop */}
              {partners.map((partner, index) => (
                <CarouselItem
                  key={`${partner.name}-duplicate-${index}`}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                >
                  <div className="flex items-center justify-center p-2">
                    <div className="relative h-12 w-[120px]">
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={`${partner.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
