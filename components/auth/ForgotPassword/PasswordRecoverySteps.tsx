"use client";
import React from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import ForgotPassword from "./Forgotpassword";
import OtpVerification from "./OTPVerification";
import NewPassword from "./NewPassword";

export default function PasswordRecoverySteps() {
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(0));
  return (
    <>
      {step === 0 && <ForgotPassword setStep={setStep} />}
      {step === 1 && <OtpVerification setStep={setStep} />}
      {step === 2 && <NewPassword />}
    </>
  );
}
