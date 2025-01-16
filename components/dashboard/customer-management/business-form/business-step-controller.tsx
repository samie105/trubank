"use client";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, Briefcase } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Business Profile Details",
    icon: <User className="h-5 w-5" />,
  },

  {
    id: 2,
    title: "Business Registration Documents",
    icon: <Briefcase className="h-5 w-5" />,
  },
  { id: 3, title: "Proof of Address", icon: <MapPin className="h-5 w-5" /> },
];

export function BusinessStepController() {
  const [formStep] = useQueryState("step", parseAsInteger.withDefault(1));
  return (
    <div className="py-4 px-2">
      {/* Progress bar */}
      <div className="sticky z-[9999px] md:relative top-0">
        <p className="text-sm mb-3 font-medium text-muted-foreground">
          Step {formStep === 4 ? "3" : formStep} of {steps.length}
        </p>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
            style={{ width: `${(formStep / 4) * 100}%` }}
          />
        </div>
        <div className="mt-2 text- md:hidden">
          <p className="text-base font-semibold text-foreground">
            {formStep === 1 && "Business Profile Details"}
            {formStep === 2 && "Business Registration Documents"}
            {formStep === 3 && "Proof of Address"}
          </p>
        </div>
      </div>
      <div className="relative hidden md:block mt-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center md:mb-8 last:mb-0">
            <div className="relative flex justify-center">
              {/* Vertical line */}
              {index !== steps.length - 1 && (
                <div
                  className={`absolute top-12  w-[2px] h-4 
                    ${formStep > step.id ? "bg-primary" : "bg-secondary"}`}
                />
              )}
              {/* Step circle */}
              <div
                className={`rounded-full transition-all p-2 border-2 
                  ${
                    formStep === step.id
                      ? "border-foreground/70 bg-none text-foreground/70"
                      : formStep > step.id
                      ? "border-primary bg-none text-primary"
                      : "border bg-background text-muted-foreground"
                  }`}
              >
                {step.icon}
              </div>
            </div>
            {/* Step text */}
            <div
              className={`ml-4 text-sm transition-all font-medium
                ${
                  formStep === step.id
                    ? "text-foreground/90"
                    : formStep > step.id
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
            >
              {step.title}
            </div>
          </div>
        ))}
      </div>
      <Separator className="mt-5 md:hidden" />
    </div>
  );
}
