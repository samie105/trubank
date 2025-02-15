import type React from "react";
import {
  ArrowRight,
  Cloud,
  Smartphone,
  RefreshCcw,
  Lock,
  LinkIcon,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const features: FeatureProps[] = [
  {
    title: "Modular Core Banking Platform",
    description:
      "TruBank offers a fully customizable, cloud-based platform where banks can select and deploy the specific modules they need, including account management, payments, and loans.",
    icon: Building2,
  },
  {
    title: "Cloud-Based Scalability",
    description:
      "With a cloud infrastructure, your institution can easily scale as your customer base and transaction volume grows, without performance issues.",
    icon: Cloud,
  },
  {
    title: "Real-Time Transaction Processing",
    description:
      "Ensure transactions are processed instantly, providing real-time updates and better user experience for your customers.",
    icon: RefreshCcw,
  },
  {
    title: "Robust Security And Compliance",
    description:
      "We prioritize your data security with multi-factor authentication, encryption, and compliance with global financial regulations.",
    icon: Lock,
  },
  {
    title: "API Integration For Seamless Connections",
    description:
      "Easily connect with third party services such as payment gateways, KYC providers, and more through our secure and flexible APIs.",
    icon: LinkIcon,
  },
  {
    title: "Digital Banking Support",
    description:
      "Enable your customers to enjoy secure mobile and online banking services from anywhere, with seamless multi-channel support.",
    icon: Smartphone,
  },
];

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="text-center">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          OUR CORE FEATURES
        </h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Explore The Tools That <br className="hidden md:block" /> Transform
          Your <span className="text-primary">Finances</span>
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid Container */}
        <div className="relative grid items-center gap-12 lg:grid-cols-[1fr,1.5fr]">
          {/* Image Column - Absolute on mobile, grid column on desktop */}
          <div
            className="absolute -top-20 md:bottom-0 left-0 z-0 h-[60%] w-full bg-contain bg-left-top opacity-10  md:bg-left-bottom bg-no-repeat md:opacity-90 lg:relative lg:h-full lg:w-full"
            style={{
              backgroundImage: `url('/assets/feature_section_tech.png')`,
            }}
            aria-hidden="true"
          />

          {/* Content Column */}
          <div className="relative z-10 lg:col-start-2">
            <div className="mt-16 grid gap-8 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="relative rounded-2xl bg-transparent p-6 transition-shadow "
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-7 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Link
                href="#"
                className="inline-flex justify-center w-full items-center text-sm font-semibold text-primary hover:text-primary/80"
              >
                Learn More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
