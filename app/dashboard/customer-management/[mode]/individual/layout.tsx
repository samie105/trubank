import React from "react";
import { StepController } from "@/components/dashboard/customer-management/Individual-Form/step-controller";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className=" flex flex-col md:grid md:grid-cols-12 md:gap-4">
      {/* Sidebar with StepController */}
      <div className="w-full sticky top-0 z-50 md:col-span-3 h-full bg-background md:p-4 p-2">
        <StepController />
      </div>

      {/* Main content */}
      <div className="w-full md:col-span-9 p-4">{children}</div>
    </div>
  );
}
