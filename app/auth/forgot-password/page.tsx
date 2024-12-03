import PasswordRecoverySteps from "@/components/auth/ForgotPassword/PasswordRecoverySteps";
import React, { Suspense } from "react";

export default function page() {
  return (
    <Suspense>
      <PasswordRecoverySteps />
    </Suspense>
  );
}
