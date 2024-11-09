"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import logowhite from "@/public/assets/logo-white.png";
import logodark from "@/public/assets/logo-dark.png";
import LoginForm from "./login/page";
import Image from "next/image";
import ThemeSwitch from "@/components/dashboard/Theme-switch";

interface AuthLayoutProps {
  children?: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left side */}
      <div className="flex w-full flex-col justify-between items-center p-8 md:w-1/2">
        {/* Logo */}
        <div className=" flex justify-between w-full">
          <Link href="/" className="image-cont w-4/6 /mx-auto">
            <Image alt="trubank-logo" src={logowhite} className="dark:hidden" />
            <Image
              alt="trubank-logo"
              src={logodark}
              className="dark:block hidden"
            />
          </Link>
          <ThemeSwitch />
        </div>

        {/* Form Container with Animation */}
        <div className="flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={children ? React.Children.count(children) : "default"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              {children || <LoginForm />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <span>© 2024, TruBank</span>
          <Link href="/terms" className="text-primary hover:underline">
            Terms of use
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="hidden md:block md:w-1/2">
        <div className="relative flex h-full items-end justify-center overflow-hidden">
          {/* Decorative swirl background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/assets/login-bg.jpeg')] bg-cover bg-center /opacity-50" />
          </div>

          {/* Text overlay */}
          <h1 className="relative z-10 pb-12 max-w-2xl px-8 lg:text-6xl text-4xl font-bold leading-tight text-white">
            Empowering <br /> your financial freedom
          </h1>
        </div>
      </div>
    </div>
  );
}

// Default login form component
