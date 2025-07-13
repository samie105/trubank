"use client";

import { FormData, IDType, ProofOfAddressType } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define a more specific type for the API response structure to avoid using 'any'
interface CustomerApiResponse {
  id?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  emailAddress?: string;
  phoneNumber?: string;
  email?: string;
  phone?: string;
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

// Define the store state structure
interface FormState {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  loadEditData: (customerId: string, data: CustomerApiResponse) => void;
}

// Create the Zustand store with persistence
export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      formData: {
        firstName: "",
        lastName: "",
        dob: new Date(),
        gender: undefined,
        email: "",
        phone: "+234",
        country: "Nigeria",
        countryName: "Nigeria",
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
        accountOfficer: null,
        desiredAccount: undefined,
        productType: undefined,
        // Display names for UI purposes
        branchName: undefined,
        accountOfficerName: undefined,
        productTypeName: undefined,
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
      },
      updateFormData: (data) => 
        set((state) => ({
          formData: { ...state.formData, ...data }
        })),
      loadEditData: (customerId, data) => {
        // Initialize an object to hold the mapped data
        const mappedData: Partial<FormData> = {
          customerId: customerId, // Store the customer ID for API calls
        };

        // Map API response fields to form fields
        if (data.firstName) mappedData.firstName = data.firstName;
        if (data.lastName) mappedData.lastName = data.lastName;
        if (data.dateOfBirth) mappedData.dob = new Date(data.dateOfBirth);
        if (data.gender) mappedData.gender = data.gender;
        if (data.emailAddress) mappedData.email = data.emailAddress;
        if (data.phoneNumber) mappedData.phone = data.phoneNumber;
        // Double check both properties to ensure we don't miss either format
        if (data.email) mappedData.email = data.email as string;
        if (data.phone) mappedData.phone = data.phone as string;
        
        if (data.nationality) {
          mappedData.country = data.nationality;
          // For existing customers, we might need to fetch the country name from the API
          // For now, we'll use the country ID as the name if no name is provided
          mappedData.countryName = data.nationality;
        }
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
        if (data.branch?.id) mappedData.branch = data.branch.id;
        if (data.branch?.name) mappedData.branchName = data.branch.name;
        
        if (data.accountOfficerId) mappedData.accountOfficer = data.accountOfficerId;
        if (data.accountOfficer?.id !== undefined) mappedData.accountOfficer = data.accountOfficer.id;
        if (data.accountOfficer?.fullName) mappedData.accountOfficerName = data.accountOfficer.fullName;
        
        if (data.desiredAccount) mappedData.desiredAccount = data.desiredAccount;
        
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
        
        // Update the store with the mapped data
        set((state) => ({
          formData: { ...state.formData, ...mappedData }
        }));
      },
    }),
    {
      name: 'customer-form-storage',
    }
  )
);

// For backward compatibility with the Context API approach
// This allows existing components to work without changes
export function FormProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useFormContext() {
  const { formData, updateFormData, loadEditData } = useFormStore();
  return { formData, updateFormData, loadEditData };
}
