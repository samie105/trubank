"use client";

import { FormData } from "@/types/types";
import React, { createContext, useContext, useState, useEffect } from "react";

type FormContextType = {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    dob: new Date(),
    gender: undefined,
    email: "",
    phone: "+234",
    country: "Nigeria",
    maritalStatus: "",
    alternatePhone: "",
    employmentStatus: "",
    tin: "",
    state: "Abia",
    address: "",
    idType: undefined,
    idNumber: "",
    idDocument: null,
    idType2: undefined,
    expiryDate: new Date(),
    issuingAuthority: "",
    issuingAuthorityPOA: "",
    idNumber2: "",
    idDocument2: null,
    proofOfAddress: null,
    dateOfIssue: new Date(),
    addressProofType: "",
    profileImage: null,
    branch: undefined,
    accountOfficer: "",
    desiredAccount: undefined,
    employerAddress: "",
    jobTitle: "",
    startDate: new Date(),
    endDate: new Date(),
    employmentDocument: null,
    guarantorFullName: "",
    guarantorRelationship: "",
    guarantorPhone: "",
    guarantorEmail: "",
    guarantorAddress: "",
    guarantorId: null,
    nextOfKinFullName: "",
    nextOfKinPhone: "",
    nextOfKinEmail: "",
    nextOfKinAddress: "",
    nextOfKinRelationship: "",
  });

  useEffect(() => {
    const savedData = localStorage.getItem("customerForm");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prevData) => {
      const newData = { ...prevData, ...data };
      localStorage.setItem("customerForm", JSON.stringify(newData));
      return newData;
    });
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
