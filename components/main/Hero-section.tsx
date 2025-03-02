import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden bg-none px-4 md:px-16/ flex  py-16 md:py-24">
      {/* Content */}
      <div className="relative z-10 mx-auto md:mx-20 max-w-7xl">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl mt-20 font-bold leading-tight text-[#ffffff] sm:text-5xl lg:text-6xl">
              Powering Banking
              <br />
              <span className="text-white">From the Core.</span>
            </h2>
            <p className="max-w-lg text-lg text-white/90">
              Welcome to TruBank, the cloud-based core banking platform designed
              to revolutionize financial institutions across Africa and beyond.
            </p>
          </div>

          <div className="flex flex-col/ gap-4 flex-row">
            <Button
              asChild
              variant="secondary"
              className="group inline-flex items-center gap-2 bg-white text-primary hover:bg-white/90"
            >
              <a href="/products-solution">
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="inline-flex items-center gap-2 border-2 border-none bg-transparent text-white transition-colors hover:bg-white/10 hover:text-white"
            >
              <a href="/contacts">
                <Building2 className="h-4 w-4" />
                Request A Demo
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Tech Illustration */}
      <div
        className="absolute bottom-0 right-0 z-0 h-[600px] w-full bg-contain bg-right-bottom bg-no-repeat opacity-90 md:w-[800px]"
        style={{
          backgroundImage: `url('/assets/landing_page_tech.png')`,
        }}
        aria-hidden="true"
      />

      {/* Gradient Overlay for better text visibility */}
      <div
        className="absolute lg:hidden hidden md:block inset-0 z-[1] bg-gradient-to-r from-primary via-priamry/90 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
