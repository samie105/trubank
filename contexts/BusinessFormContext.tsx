"use client";
import { BusinessFormData } from "@/types/types";
import React, { createContext, useContext, useState, useEffect } from "react";

interface BusinessFormContextType {
  formData: BusinessFormData;
  updateFormData: (data: Partial<BusinessFormData>) => void;
}

const BusinessFormContext = createContext<BusinessFormContextType | undefined>(
  undefined
);

export const BusinessFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<BusinessFormData>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("CustomerBusinessForm");
      return savedData
        ? JSON.parse(savedData)
        : {
            businessName: "",
            businessType: "",
            industrySector: "",
            businessAddress: "",
            email: "",
            phoneNumber: "",
            rcNumber: "",
            cacDocument: null,
            ownerFirstName: "",
            ownerLastName: "",
            ownerPhoneNumber: "",
            ownerEmail: "",
            ownerTitle: "",
            branch: "",
            desiredAccount: "",
            accountOfficer: "",
          };
    }
    return {
      businessName: "",
      businessType: "",
      industrySector: "",
      businessAddress: "",
      email: "",
      phoneNumber: "",
      rcNumber: "",
      cacDocument: null,
      ownerFirstName: "",
      ownerLastName: "",
      ownerPhoneNumber: "",
      ownerEmail: "",
      ownerTitle: "",
      branch: "",
      desiredAccount: "",
      accountOfficer: "",
    };
  });

  useEffect(() => {
    localStorage.setItem("CustomerBusinessForm", JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (data: Partial<BusinessFormData>) => {
    setFormData((prevData) => ({ ...prevData, ...data }));
  };

  return (
    <BusinessFormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </BusinessFormContext.Provider>
  );
};

export const useBusinessForm = () => {
  const context = useContext(BusinessFormContext);
  if (context === undefined) {
    throw new Error(
      "useBusinessForm must be used within a BusinessFormProvider"
    );
  }
  return context;
};
