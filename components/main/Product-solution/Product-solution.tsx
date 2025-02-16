import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Feature {
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  linkPath?: string;
}

const features: Feature[] = [
  {
    title: "Mobile/Web Banking App",
    description:
      "Empower your customers with online and mobile banking services that allow them to access their accounts and conduct transactions 24/7.",
    imagePath: "/assets/product-solution/mobile-banking.svg", // Replace with your image path
    imageAlt: "Mobile banking illustration",
    linkPath: "/products-solutions/mobile-web-banking-app",
  },
  {
    title: "Account Management",
    description:
      "Manage customer accounts with ease, including account creation, closure, and maintenance. Provide a seamless experience for account types such as savings, current, fixed deposits etc.",
    imagePath: "/assets/product-solution/accout-management.svg",
    imageAlt: "Account management illustration",
    linkPath: "/products-solutions/account-management",
  },
  {
    title: "KYC/AML Compliance",
    description:
      "Implement advanced security protocols such as multi-factor authentication and encrypted data transfer to keep your institution's and customers' information safe.",
    imagePath: "/assets/product-solution/kyc-compliance.svg",
    imageAlt: "KYC compliance illustration",
    linkPath: "/products-solutions/kyc-compliance",
  },
  {
    title: "Customer Management",
    description:
      "Store and manage customer information separately, ensuring personalized service delivery, KYC compliance, and effective data management.",
    imagePath: "/assets/product-solution/customer-management.svg", // Replace with your image path
    imageAlt: "Customer management illustration",
    linkPath: "/products-solutions/customer-management",
  },
  {
    title: "Reporting & Analytics",
    description:
      "Generate comprehensive reports and analytics in real-time, enabling financial institutions to make data-driven decisions that enhance growth and customer satisfaction.",
    imagePath: "/assets/product-solution/reporting-analytics.svg", // Replace with your image path
    imageAlt: "Reporting and analytics illustration",
    linkPath: "/products-solutions/reporting-analytics",
  },
];

export default function SolutionsPage() {
  return (
    <main className="min-h-screen">
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
              Our Solutions
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Core <span className="text-yellow-300">Banking</span>
              <br />
              Platform Overview
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
              Our platform offers a complete solution for managing financial
              operations, from account setup to payments and reporting, with the
              ability to scale and adapt to your institution&apos;s evolving
              needs.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative overflow-hidden px-5 md:px-0 bg-white py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-900">
              FEATURES
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Seamless Solutions For{" "}
              <span className="text-primary">Modern Banking</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Transform your banking experience with advanced capabilities that
              prioritize speed, security, and customer satisfaction.
            </p>
          </div>

          <div className="mt-24 space-y-10 ">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={cn(
                  "grid gap-8 lg:grid-cols-2 lg:gap-16",
                  index % 2 === 1 && "lg:grid-flow-col-dense"
                )}
              >
                <div
                  className={cn(
                    "flex flex-col justify-center",
                    index % 2 === 1 && "lg:col-start-2"
                  )}
                >
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-lg text-gray-600">
                    {feature.description}
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="default"
                      className="bg-primary text-white hover:bg-primary/90"
                      asChild
                    >
                      <Link href={feature.linkPath || "#"}>
                        Read More <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center justify-center lg:col-start-2",
                    index % 2 === 1 && "lg:col-start-1",
                    "order-first lg:order-none"
                  )}
                >
                  <div className="relative aspect-square w-full max-w-[480px]">
                    <Image
                      src={feature.imagePath || "/placeholder.svg"}
                      alt={feature.imageAlt}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
