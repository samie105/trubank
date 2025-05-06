"use client";
import { BusinessFormData } from "@/types/types";
import React, { createContext, useContext, useState, useEffect } from "react";

// Define a more specific type for the API response structure
interface BusinessApiResponse {
  id?: string;
  busienssName?: string;
  busienssType?: string;
  businessAddress?: string;
  emailAddress?: string;
  phoneNumber?: string;
  registrationNumber?: string;
  website?: string;
  taxIdentificationNumber?: string;
  natureOfBusiness?: string;
  branchId?: string;
  accountOfficerId?: string;
  desiredAccount?: string;
  branch?: {
    id?: string;
    name?: string;
  };
  accountOfficer?: {
    id?: string;
    fullName?: string;
  };
  businessIncorporationDocument?: {
    theFile?: string;
    fileType?: number;
  };
  memorandumOfAssociationDocument?: {
    theFile?: string;
    fileType?: number;
  };
  businessLicenseDocument?: {
    theFile?: string;
    fileType?: number;
  };
  proofOfAddress?: {
    utilityFile?: string;
    utilityType?: number;
    utilityIssuer?: string;
    utilityDateIssuer?: string;
  };
  [key: string]: string | number | boolean | object | undefined;
}

// Extend BusinessFormData type to include businessId for edit operations
interface EditBusinessFormData extends BusinessFormData {
  businessId?: string;
}

interface BusinessFormContextType {
  formData: EditBusinessFormData;
  updateFormData: (data: Partial<EditBusinessFormData>) => void;
  loadEditData: (businessId: string, data: BusinessApiResponse) => void;
}

const BusinessFormContext = createContext<BusinessFormContextType | undefined>(
  undefined
);

export const BusinessFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<EditBusinessFormData>(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("CustomerBusinessForm");
      return savedData
        ? JSON.parse(savedData)
        : {
            businessName: "",
            businessType: "",
            businessAddress: "",
            email: "",
            phoneNumber: "",
            registrationNumber: "",
            tin: "",
            natureOfBusiness: "",
            website: "",
            businessIncorporationCertificate: null,
            memorandumArticles: null,
            businessLicense: null,
            utilityBillType: "",
            utilityBillIssuer: "",
            issueDateOfBill: new Date(),
            utilityBill: null,
            branch: "",
            branchId: "",
            accountOfficer: "",
            accountOfficerId: "",
            desiredAccount: "",
            type: 2,
          };
    }
    return {
      businessName: "",
      businessType: "",
      businessAddress: "",
      email: "",
      phoneNumber: "",
      registrationNumber: "",
      tin: "",
      natureOfBusiness: "",
      website: "",
      businessIncorporationCertificate: null,
      memorandumArticles: null,
      businessLicense: null,
      utilityBillType: "",
      utilityBillIssuer: "",
      issueDateOfBill: new Date(),
      utilityBill: null,
      branch: "",
      branchId: "",
      accountOfficer: "",
      accountOfficerId: "",
      desiredAccount: "",
      type: 2,
    };
  });

  useEffect(() => {
    localStorage.setItem("CustomerBusinessForm", JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (data: Partial<EditBusinessFormData>) => {
    setFormData((prevData) => ({ ...prevData, ...data }));
  };

  /**
   * Special function for loading complete business data in edit mode.
   * This ensures we have all necessary fields from the existing record.
   * 
   * @param businessId - The ID of the business being edited
   * @param data - The complete business data from the API
   */
  const loadEditData = (businessId: string, data: BusinessApiResponse) => {
    // Initialize an object to hold the mapped data
    const mappedData: Partial<EditBusinessFormData> = {
      businessId: businessId, // Store the business ID for API calls
    };

    // Map API response fields to form fields
    if (data.busienssName) mappedData.businessName = data.busienssName;
    if (data.busienssType) mappedData.businessType = data.busienssType;
    if (data.businessAddress) mappedData.businessAddress = data.businessAddress;
    if (data.emailAddress) mappedData.email = data.emailAddress;
    if (data.phoneNumber) mappedData.phoneNumber = data.phoneNumber;
    if (data.registrationNumber) mappedData.registrationNumber = data.registrationNumber;
    if (data.taxIdentificationNumber) mappedData.tin = data.taxIdentificationNumber;
    if (data.natureOfBusiness) mappedData.natureOfBusiness = data.natureOfBusiness;
    if (data.website) mappedData.website = data.website;
    
    // Documents
    if (data.businessIncorporationDocument?.theFile) {
      mappedData.businessIncorporationCertificate = data.businessIncorporationDocument.theFile;
    }
    if (data.memorandumOfAssociationDocument?.theFile) {
      mappedData.memorandumArticles = data.memorandumOfAssociationDocument.theFile;
    }
    if (data.businessLicenseDocument?.theFile) {
      mappedData.businessLicense = data.businessLicenseDocument.theFile;
    }
    
    // Utility Bill
    if (data.proofOfAddress?.utilityType) {
      mappedData.utilityBillType = data.proofOfAddress.utilityType.toString();
    }
    if (data.proofOfAddress?.utilityIssuer) {
      mappedData.utilityBillIssuer = data.proofOfAddress.utilityIssuer;
    }
    if (data.proofOfAddress?.utilityDateIssuer) {
      mappedData.issueDateOfBill = data.proofOfAddress.utilityDateIssuer;
    }
    if (data.proofOfAddress?.utilityFile) {
      mappedData.utilityBill = data.proofOfAddress.utilityFile;
    }
    
    // Branch and Account Officer
    if (data.branchId) mappedData.branchId = data.branchId;
    else if (data.branch?.id) mappedData.branchId = data.branch.id;
    
    if (data.accountOfficerId) mappedData.accountOfficerId = data.accountOfficerId;
    else if (data.accountOfficer?.id) mappedData.accountOfficerId = data.accountOfficer.id;
    
    if (data.desiredAccount) mappedData.desiredAccount = data.desiredAccount;
    
    console.log("Loading complete business data for editing:", mappedData);
    
    // Set the form data with the mapped values and save to localStorage
    setFormData(prevData => {
      const newData = { ...prevData, ...mappedData };
      localStorage.setItem("CustomerBusinessForm", JSON.stringify(newData));
      return newData;
    });
  };

  return (
    <BusinessFormContext.Provider value={{ formData, updateFormData, loadEditData }}>
      {children}
    </BusinessFormContext.Provider>
  );
};

export const useBusinessForm = () => {
  const context = useContext(BusinessFormContext);
  if (context === undefined) {
    throw new Error("useBusinessForm must be used within a BusinessFormProvider");
  }
  return context;
};
