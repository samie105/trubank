"use client"
import Image from "next/image";
import { JobsTable } from "./job-table";

export default function CareersPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/assets/howitworksbgpattern.png)",
          }}
        />
        <div className="absolute inset-0 z-10 bg-primary/90" />

        <div className="relative z-20 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full bg-white px-4 py-1 text-sm font-medium text-primary">
              Careers
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Why Work at <span className="text-white/90">TruBank</span>?
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
              Join a company that&apos;s transforming the future of banking with
              innovative technology. At TruBank, we value creativity, teamwork,
              and continuous learning.
            </p>
          </div>
        </div>
      </section>

      {/* Jobs Table Section */}
      <section className="py-16">
        <JobsTable />
      </section>

      {/* Our Culture Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our <span className="text-primary">Culture</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We foster a collaborative, innovative, and inclusive workplace
                where every idea counts.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/assets/careers-culture.jpeg"
                alt="TruBank team members collaborating"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
