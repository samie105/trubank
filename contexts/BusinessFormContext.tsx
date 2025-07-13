"use client";
import { BusinessFormData } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define a more specific type for the API response structure
interface BusinessApiResponse {
  id?: string;
  busienssName?: string;
  busienssType?: string;
  businessAddress?: string;
  emailAddress?: string;
  phoneNumber?: string;
  email?: string; // Add alternative field name
  phone?: string; // Add alternative field name
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

interface BusinessFormState {
  formData: EditBusinessFormData;
  updateFormData: (data: Partial<EditBusinessFormData>) => void;
  loadEditData: (businessId: string, data: BusinessApiResponse) => void;
}

// Create Zustand store with persistence
export const useBusinessFormStore = create<BusinessFormState>()(
  persist(
    (set) => ({
      formData: {
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
        accountOfficer: null,
        accountOfficerId: null,
        desiredAccount: "",
        type: 2,
        // Display names for UI purposes
        branchName: "",
        accountOfficerName: "",
        desiredAccountName: "",
      },
      updateFormData: (data) => 
        set((state) => ({ 
          formData: { ...state.formData, ...data }
        })),
      loadEditData: (businessId, data) => {
        // Initialize an object to hold the mapped data
        const mappedData: Partial<EditBusinessFormData> = {
          businessId: businessId, // Store the business ID for API calls
        };

        // Map API response fields to form fields
        if (data.busienssName) mappedData.businessName = data.busienssName;
        if (data.busienssType) mappedData.businessType = data.busienssType;
        if (data.businessAddress) mappedData.businessAddress = data.businessAddress;
        
        // Handle both email field formats
        if (data.emailAddress) mappedData.email = data.emailAddress;
        if (data.email) mappedData.email = data.email as string;
        
        // Handle both phone field formats
        if (data.phoneNumber) mappedData.phoneNumber = data.phoneNumber;
        if (data.phone) mappedData.phoneNumber = data.phone as string;
        
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
        if (data.branch?.name) mappedData.branchName = data.branch.name;
        
        if (data.accountOfficerId) mappedData.accountOfficerId = data.accountOfficerId;
        else if (data.accountOfficer?.id) mappedData.accountOfficerId = data.accountOfficer.id;
        if (data.accountOfficer?.fullName) mappedData.accountOfficerName = data.accountOfficer.fullName;
        
        if (data.desiredAccount) mappedData.desiredAccount = data.desiredAccount;
        
        console.log("Loading complete business data for editing:", mappedData);
        
        // Update the store with the mapped data
        set((state) => ({
          formData: { ...state.formData, ...mappedData }
        }));
      },
    }),
    {
      name: 'customer-business-form-storage',
    }
  )
);

// For backward compatibility with the Context API approach
// This allows existing components to work without changes
export function BusinessFormProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useBusinessForm() {
  const { formData, updateFormData, loadEditData } = useBusinessFormStore();
  return { formData, updateFormData, loadEditData };
}
