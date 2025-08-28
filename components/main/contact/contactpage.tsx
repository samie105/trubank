"use client";
import { ContactForm } from "./contact-form";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary py-32">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: "url('/assets/howitworksbgpattern.png')",
            backgroundRepeat: "repeat",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            We&apos;re Here to Help
          </h1>
          <p className="mt-4 text-xl text-white/90">Get in Touch Anytime</p>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2/">
            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="space-y-6/ grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start border border-gray-200 p-4 rounded-md space-x-4">
                  <MapPin className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-black/80">
                      Head Office
                    </h3>
                    <p className="mt-1 text-gray-600">
                    205, Tonyvic Plaza, Nsukka, Enugu State, Nigeria.   </p>
                  </div>
                </div>

                <div className="flex items-start border border-gray-200 p-4 rounded-md space-x-4">
                  <Phone className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-black/80">
                      Phone
                    </h3>
                    <p className="mt-1 text-gray-600">+2347007003300</p>
                  </div>
                </div>

                <div className="flex items-start border border-gray-200 p-4 rounded-md space-x-4">
                  <Mail className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-black/80">
                      Email
                    </h3>
                    <p className="mt-1 text-gray-600">info@trubank.ng</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              {/* <div className="aspect-[4/3] w-full overflow-hidden rounded-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5076902536187!2d7.413972675774285!3d9.002386089377927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e73a0d5f6b0d9%3A0x5e5a8d9c5c5c5c5c!2sEFAB%20Estate%20Lokogoma!5e0!3m2!1sen!2sng!4v1710876547774!5m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                ></iframe>
              </div> */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
