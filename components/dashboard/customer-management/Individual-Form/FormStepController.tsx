import React from "react";
import InformationDetailsForm from "./InformationDetailsForm";
import IDDetailsForm from "./IDDetailsForm";

export default function FormStepController({ step }: { step: number }) {
  return (
    <div>
      {step === 1 && <InformationDetailsForm />}
      {step === 2 && <IDDetailsForm />}
    </div>
  );
}
