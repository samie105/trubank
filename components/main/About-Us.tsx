import { Eye, Target } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const coreValues = [
    { id: 1, name: "Innovation" },
    { id: 2, name: "Customer-Centricity" },
    { id: 3, name: "Security and Trust" },
    { id: 4, name: "Collaboration and Partnerships" },
    { id: 5, name: "Agility and Adaptability" },
    { id: 6, name: "Accessibility and Financial Inclusion" },
    { id: 7, name: "Sustainability and Social Responsibility" },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] overflow-hidden">
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
          <div className="inline-block mt-20 rounded-full bg-white px-4 py-1 text-sm font-medium text-primary">
            Our Story
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Redefining
            <span className="text-yellow-300">Financial Innovation</span>
            <br />
            for a Connected World
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
            At TruBank, we blend cutting-edge technology with deep industry
            expertise to empower financial institutions and transform the way
            banking works. Together, we build a future of trust, growth and
            opportunity.
          </p>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="bg-white py-24 px-5 md:px-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Mission Statement */}
            <div className="flex flex-col items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Mission Statement
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                To empower financial institutions to deliver exceptional
                customer experiences, drive growth, and thrive in a rapidly
                changing landscape through our innovative, secure, and scalable
                core banking platform.
              </p>
            </div>

            {/* Vision Statement */}
            <div className="flex flex-col items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Vision Statement
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Revolutionizing the future of banking through cutting-edge,
                cloud-based core banking technology that ensures financial
                inclusion and operational excellence.
              </p>
            </div>
          </div>

          {/* Who We Are */}
          <div className="mx-auto mt-20 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Who <span className="text-primary">We Are</span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              TruBank provides cloud-based core banking platforms that help
              financial institutions streamline operations, deliver excellent
              customer experiences, and scale effectively. Our secure and
              scalable platform integrates seamlessly into existing banking
              systems, offering solutions for account management, payments,
              lending, and much more.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-gray-50 py-24 px-5 md:px-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Values List */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                CORE VALUES
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Core Beliefs That Shape
                <br />
                Your <span className="text-primary">Experience</span>
              </p>
              <div className="mt-12 space-y-8 items-start grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-8">
                  {coreValues.slice(0, 4).map((value) => (
                    <div key={value.id} className="flex items-start gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                        {value.id}
                      </div>
                      <div className="text-lg font-medium text-gray-900">
                        {value.name}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-8">
                  {coreValues.slice(4).map((value) => (
                    <div key={value.id} className="flex items-start gap-4">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary text-white">
                        {value.id}
                      </div>
                      <div className="text-lg font-medium text-gray-900">
                        {value.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative aspect-square lg:aspect-auto order-first lg:order-none">
              <Image
                src="/assets/about-us/core_values.svg"
                alt="Core Values Illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
