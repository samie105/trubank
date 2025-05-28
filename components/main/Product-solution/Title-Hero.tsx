import React from "react";

export default function TitleHero({ title }: { title: string }) {
  return (
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
        <div className="inline-block mt-10 rounded-full bg-white px-4 py-1 text-sm font-medium text-primary">
          Our Features
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
