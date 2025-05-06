"use client";

import { FormData, IDType, ProofOfAddressType } from "@/types/types";
import React, { createContext, useContext, useState, useEffect } from "react";

// Define a more specific type for the API response structure to avoid using 'any'
interface CustomerApiResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  emailAddress?: string;
  phoneNumber?: string;
  nationality?: string;
  maritalStatus?: string;
  alternatePhoneNumber?: string;
  employmentStatus?: string;
  taxIdenttfictionNumber?: string;
  residentialAddress?: string;
  idType?: string;
  idNumber?: string;
  idExpiryDate?: string;
  idIssuingAuthority?: string;
  proofOfAddressType?: string;
  proofOfAddressIssuingAuthority?: string;
  proofOfAddressDateIssue?: string;
  branchId?: string;
  accountOfficerId?: string;
  desiredAccount?: string;

  meansOfIdentification?: {
    meansOfIdentificationFile?: string;
    meansOfIdentificationFileType?: string;
    meansOfIdentificationFileName?: string;
  };
  proofOfAddress?: {
    proofOfAddressFile?: string;
    proofOfAddressType?: string;
    proofOfAddressFileName?: string;
  };
  profilePicture?: {
    profilePicture?: string;
    profilePictureType?: string;
    profilePictureName?: string;
  };
  branch?: {
    id?: string;
    name?: string;
  };
  accountOfficer?: {
    id?: string;
    fullName?: string;
  };
  employmentDetails?: {
    currentEmployerName?: string;
    employerAddress?: string;
    jobTitle?: string;
    employementStateDate?: string;
    employementEndDate?: string;
    employmentVerificationDocument?: string;
  };
  guarantorDetails?: {
    guarantorFullName?: string;
    guarantorRelationshipToCustomer?: string;
    guarantorPhoneNumber?: string;
    guarantorEmailAddress?: string;
    guarantorAddress?: string;
    guarantorFileDocument?: string;
  };
  nextOfKinDetails?: {
    nextOfKinFullName?: string;
    nextOfKinRelationshipToCustomer?: string;
    nextOfKinPhoneNumber?: string;
    nextOfKinEmailAddress?: string;
    nextOfKinAddress?: string;
  };
  [key: string]: string | number | boolean | object | undefined; // More specific index signature
}

// Extend FormData type to include customerId for edit operations
interface EditFormData extends FormData {
  customerId?: string;
}

type FormContextType = {
  formData: EditFormData;
  updateFormData: (data: Partial<EditFormData>) => void;
  loadEditData: (customerId: string, data: CustomerApiResponse) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<EditFormData>({
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
    address: "",
    idType: undefined,
    idNumber: "",
    IdFile: null,
    expiryDate: new Date(),
    issuingAuthority: "",
    issuingAuthorityPOA: "",
    proofOfAddress: null,
    dateOfIssue: new Date(),
    addressProofType: undefined,
    profileImage: null,
    branch: undefined,
    accountOfficer: "",
    desiredAccount: undefined,
    productType: undefined,
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
    currentEmployerName: "",
    nextOfKinRelationship: "",
  });

  useEffect(() => {
    // Load form data from localStorage on initial render
    const savedData = localStorage.getItem("customerForm");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  /**
   * Updates form data and persists to localStorage.
   * This ensures all previous data is preserved, and only changed fields are updated.
   */
  const updateFormData = (data: Partial<EditFormData>) => {
    setFormData((prevData) => {
      const newData = { ...prevData, ...data };
      localStorage.setItem("customerForm", JSON.stringify(newData));
      return newData;
    });
  };

  /**
   * Special function for loading complete customer data in edit mode.
   * This ensures we have all necessary fields from the existing record.
   * 
   * @param customerId - The ID of the customer being edited
   * @param data - The complete customer data from the API
   */
  const loadEditData = (customerId: string, data: CustomerApiResponse) => {
    // Initialize an object to hold the mapped data
    const mappedData: Partial<EditFormData> = {
      customerId: customerId, // Store the customer ID for API calls
    };

    // Map API response fields to form fields
    if (data.firstName) mappedData.firstName = data.firstName;
    if (data.lastName) mappedData.lastName = data.lastName;
    if (data.dateOfBirth) mappedData.dob = new Date(data.dateOfBirth);
    if (data.gender) mappedData.gender = data.gender;
    if (data.emailAddress) mappedData.email = data.emailAddress;
    if (data.phoneNumber) mappedData.phone = data.phoneNumber;
    if (data.nationality) mappedData.country = data.nationality;
    if (data.maritalStatus) mappedData.maritalStatus = data.maritalStatus;
    if (data.alternatePhoneNumber) mappedData.alternatePhone = data.alternatePhoneNumber;
    if (data.employmentStatus) mappedData.employmentStatus = data.employmentStatus;
    if (data.taxIdenttfictionNumber) mappedData.tin = data.taxIdenttfictionNumber;
    if (data.residentialAddress) mappedData.address = data.residentialAddress;
    
    // Identification data
    if (data.idType) mappedData.idType = data.idType as IDType;
    if (data.idNumber) mappedData.idNumber = data.idNumber;
    if (data.meansOfIdentification?.meansOfIdentificationFile) {
      mappedData.IdFile = data.meansOfIdentification.meansOfIdentificationFile;
    }
    if (data.idExpiryDate) mappedData.expiryDate = new Date(data.idExpiryDate);
    if (data.idIssuingAuthority) mappedData.issuingAuthority = data.idIssuingAuthority;
    
    // Proof of Address
    if (data.proofOfAddressType) mappedData.addressProofType = data.proofOfAddressType as ProofOfAddressType;
    if (data.proofOfAddressIssuingAuthority) mappedData.issuingAuthorityPOA = data.proofOfAddressIssuingAuthority;
    if (data.proofOfAddressDateIssue) mappedData.dateOfIssue = new Date(data.proofOfAddressDateIssue);
    if (data.proofOfAddress?.proofOfAddressFile) {
      mappedData.proofOfAddress = data.proofOfAddress.proofOfAddressFile;
    }
    
    // Profile image
    if (data.profilePicture?.profilePicture) mappedData.profileImage = data.profilePicture.profilePicture;
    
    // CRITICAL ACCOUNT FIELDS - important to preserve these
    if (data.branchId) mappedData.branch = data.branchId;
    else if (data.branch?.id) mappedData.branch = data.branch.id;
    
    if (data.accountOfficerId) mappedData.accountOfficer = data.accountOfficerId;
    else if (data.accountOfficer?.id) mappedData.accountOfficer = data.accountOfficer.id;
    
    if (data.desiredAccount) mappedData.desiredAccount = data.desiredAccount;
    // else if (data.productId) mappedData.productId = data.productId;
    // else if (data.productType) mappedData.productType = data.productType;
    
    // Employment details
    if (data.employmentDetails) {
      if (data.employmentDetails.currentEmployerName) mappedData.currentEmployerName = data.employmentDetails.currentEmployerName;
      if (data.employmentDetails.employerAddress) mappedData.employerAddress = data.employmentDetails.employerAddress;
      if (data.employmentDetails.jobTitle) mappedData.jobTitle = data.employmentDetails.jobTitle;
      if (data.employmentDetails.employementStateDate) mappedData.startDate = new Date(data.employmentDetails.employementStateDate);
      if (data.employmentDetails.employementEndDate) mappedData.endDate = new Date(data.employmentDetails.employementEndDate);
      if (data.employmentDetails.employmentVerificationDocument) {
        mappedData.employmentDocument = data.employmentDetails.employmentVerificationDocument;
      }
    }
    
    // Guarantor details
    if (data.guarantorDetails) {
      if (data.guarantorDetails.guarantorFullName) mappedData.guarantorFullName = data.guarantorDetails.guarantorFullName;
      if (data.guarantorDetails.guarantorRelationshipToCustomer) {
        mappedData.guarantorRelationship = data.guarantorDetails.guarantorRelationshipToCustomer;
      }
      if (data.guarantorDetails.guarantorPhoneNumber) mappedData.guarantorPhone = data.guarantorDetails.guarantorPhoneNumber;
      if (data.guarantorDetails.guarantorEmailAddress) mappedData.guarantorEmail = data.guarantorDetails.guarantorEmailAddress;
      if (data.guarantorDetails.guarantorAddress) mappedData.guarantorAddress = data.guarantorDetails.guarantorAddress;
      if (data.guarantorDetails.guarantorFileDocument) mappedData.guarantorId = data.guarantorDetails.guarantorFileDocument;
    }
    
    // Next of Kin details
    if (data.nextOfKinDetails) {
      if (data.nextOfKinDetails.nextOfKinFullName) mappedData.nextOfKinFullName = data.nextOfKinDetails.nextOfKinFullName;
      if (data.nextOfKinDetails.nextOfKinRelationshipToCustomer) {
        mappedData.nextOfKinRelationship = data.nextOfKinDetails.nextOfKinRelationshipToCustomer;
      }
      if (data.nextOfKinDetails.nextOfKinPhoneNumber) mappedData.nextOfKinPhone = data.nextOfKinDetails.nextOfKinPhoneNumber;
      if (data.nextOfKinDetails.nextOfKinEmailAddress) mappedData.nextOfKinEmail = data.nextOfKinDetails.nextOfKinEmailAddress;
      if (data.nextOfKinDetails.nextOfKinAddress) mappedData.nextOfKinAddress = data.nextOfKinDetails.nextOfKinAddress;
    }
    
    console.log("Loading complete customer data for editing:", mappedData);
    
    // Set the form data with the mapped values and save to localStorage
    setFormData(prevData => {
      const newData = { ...prevData, ...mappedData };
      localStorage.setItem("customerForm", JSON.stringify(newData));
      return newData;
    });
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, loadEditData }}>
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
