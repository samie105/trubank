"use client";
import React from "react";
import InformationDetailsForm from "./InformationDetailsForm";
import IDDetailsForm from "./IDDetailsForm";
import ProofofAddress from "./ProofofAddress";
import ConfirmDetails from "./ConfirmPage";
import { parseAsInteger, useQueryState } from "nuqs";
import EmploymentDetails from "./EmploymentDetails";
import GuarantorForm from "./GuarantorForm";
import NextOfKin from "./NextOfKin";

export default function FormStepController() {
  const [step] = useQueryState("step", parseAsInteger.withDefault(1));

  return (
    <div>
      {step === 1 && <InformationDetailsForm />}
      {step === 2 && <IDDetailsForm />}
      {step === 3 && <ProofofAddress />}
      {step === 4 && <EmploymentDetails />}
      {step === 5 && <GuarantorForm />}
      {step === 6 && <NextOfKin />}
      {step === 7 && <ConfirmDetails />}
    </div>
  );
}
