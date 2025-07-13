import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "animate.css";
import { Suspense } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Trubank – Modern Core Banking Software for Fintechs & Digital Banks",
  description: "Trubank offers a next-gen core banking system built for fintechs, digital banks, and financial institutions. Enjoy seamless account management, real-time transfers, and regulatory-ready reporting.",
  keywords: "core banking software, fintech banking, digital bank solution, Nigeria banking software, banking technology, Trubank, fintech infrastructure, financial services software, online banking system, real-time banking",
  openGraph: {
    title: "Trubank – Modern Core Banking Software for Fintechs & Digital Banks",
    description: "Trubank is a next-gen core banking solution designed for fintechs and digital banks. Real-time account management, seamless transfers, and powerful reporting.",
    url: "https://trubankng.com/",
    type: "website",
    images: [
      {
        url: "https://trubankng.com/assets/logo-dark.png",
        alt: "Trubank - Modern Core Banking Software"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Trubank – Modern Core Banking Software for Fintechs & Digital Banks",
    description: "Explore a next-generation banking platform tailored for financial innovation. Trusted by fintechs and digital banks.",
    images: ["https://trubankng.com/assets/logo-dark.png"]
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)]`}
      >
        <Toaster />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            {" "}
            <Suspense>{children}</Suspense>
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
