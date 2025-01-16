"use client";
import React from "react";
import BusinessDetailForm from "./BusinesssDetailsForm";
import BusinessDocumentsUpload from "./BusinessDocumentsUpload";
import ProofofAddressBusiness from "./ProofofAddressBusiness";
import BusinessConfirmationPage from "./BusinessConfirmPage";
import { parseAsInteger, useQueryState } from "nuqs";

export default function BusinessFormController() {
  const [step] = useQueryState("step", parseAsInteger.withDefault(1));

  return (
    <div>
      {step === 1 && <BusinessDetailForm />}
      {step === 2 && <BusinessDocumentsUpload />}
      {step === 3 && <ProofofAddressBusiness />}
      {step === 4 && <BusinessConfirmationPage />}
    </div>
  );
}
