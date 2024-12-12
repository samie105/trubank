import { BusinessFormProvider } from "@/contexts/BusinessFormContext";
import { FormProvider } from "@/contexts/FormContext";
import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FormProvider>
        <BusinessFormProvider>{children}</BusinessFormProvider>
      </FormProvider>
    </>
  );
}
