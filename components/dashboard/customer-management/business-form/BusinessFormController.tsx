import React from "react";
import BusinessDetailForm from "./BusinesssDetailsForm";
import RCNumberAndCACForm from "./BusinessCacUpload";
import OwnerInformationForm from "./OwnerInformationForm";
import BusinessProfileForm from "./BusinessProfileForm";
import BusinessConfirmationPage from "./BusinessConfirmPage";

export default function BusinessFormController({ step }: { step: number }) {
  return (
    <div>
      {step === 1 && <BusinessDetailForm />}
      {step === 2 && <RCNumberAndCACForm />}
      {step === 3 && <OwnerInformationForm />}
      {step === 4 && <BusinessProfileForm />}
      {step === 5 && <BusinessConfirmationPage />}
    </div>
  );
}
