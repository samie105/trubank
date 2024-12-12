import React from "react";
import InformationDetailsForm from "./InformationDetailsForm";
import IDDetailsForm from "./IDDetailsForm";
import IDDetailsForm2 from "./IDDetailsForm2";
import ProofofAddress from "./ProofofAddress";
import ProfileForm from "./ProfileForm";
import ConfirmDetails from "./ConfirmPage";

export default function FormStepController({ step }: { step: number }) {
  return (
    <div>
      {step === 1 && <InformationDetailsForm />}
      {step === 2 && <IDDetailsForm />}
      {step === 3 && <IDDetailsForm2 />}
      {step === 4 && <ProofofAddress />}
      {step === 5 && <ProfileForm />}
      {step === 6 && <ConfirmDetails />}
    </div>
  );
}
