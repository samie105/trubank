"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";

interface Article {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  slug: string;
  author: string;
}

interface FeaturedArticlesCarouselProps {
  articles: Article[];
}

export function FeaturedArticlesCarousel({
  articles,
}: FeaturedArticlesCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollPrev = React.useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = React.useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {articles.map((article) => (
            <div
              key={article.id}
              className="relative rounded-xl overflow-hidden flex-[0_0_100%]"
            >
              <Link
                href={`/blog/${article.slug}`}
                className="group rounded-sm block"
              >
                <div className="aspect-[16/9] rounded-xl sm:aspect-[21/9] w-full overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    width={1200}
                    height={600}
                    className="object-cover w-full rounded-xl h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t rounded-xl from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-200">
                    <span>{article.category}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{article.date}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{article.author}</span>
                  </div>
                  <h2 className="mt-2 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white line-clamp-2 sm:line-clamp-none">
                    {article.title}
                  </h2>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-4 right-4 flex space-x-2 sm:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/80 text-gray-800 opacity-75 backdrop-blur-sm transition-opacity hover:opacity-100"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/80 text-gray-800 opacity-75 backdrop-blur-sm transition-opacity hover:opacity-100"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>

      <div className="hidden sm:block">
        <Button
          variant="default"
          size="icon"
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-gray-800 opacity-75 backdrop-blur-sm transition-opacity hover:opacity-100"
          onClick={scrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous slide</span>
        </Button>
        <Button
          variant="default"
          size="icon"
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-gray-800 opacity-75 backdrop-blur-sm transition-opacity hover:opacity-100"
          onClick={scrollNext}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next slide</span>
        </Button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
        {articles.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
            onClick={() => scrollTo(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
