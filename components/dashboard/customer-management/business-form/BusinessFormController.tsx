/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { parseAsInteger, useQueryState } from "nuqs"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { fetchCustomerAction } from "@/server/customer-management/fetch-customer"
import BusinessDetailForm from "./BusinesssDetailsForm"
import BusinessDocumentsUpload from "./BusinessDocumentsUpload"
import ProofofAddressBusiness from "./ProofofAddressBusiness"
import BusinessConfirmationPage from "./BusinessConfirmPage"
import { BusinessFormSkeleton } from "./business-form-skeleton"
import type { BusinessCustomer } from "@/server/customer-management/fetch-customers"
import { BusinessFormData } from "@/types/types"
import { useBusinessForm } from "@/contexts/BusinessFormContext"

// Define type for formatted API data
export interface BusinessFormattedApiData {
  busienssName?: string;
  RegistrationNumber?: string;
  TaxIdentificationNumber?: string;
  NatureOfBusiness?: string;
  busienssType?: string;
  BusinessAddress?: string;
  PhoneNumber?: string;
  EmailAddress?: string;
  Website?: string;
  BranchId?: string;
  AccountOfficerId?: string;
  "BusinessIncorporationDocument.FileType"?: number;
  "BusinessIncorporationDocument.TheFile"?: string | null;
  "MemorandumOfAssociationDocument.FileType"?: number;
  "MemorandumOfAssociationDocument.TheFile"?: string | null;
  "BusinessLicenseDocument.FileType"?: number;
  "BusinessLicenseDocument.TheFile"?: string | null;
  "ProofOfAddress.UtilityType"?: number;
  "ProofOfAddress.UtilityIssuer"?: string;
  "ProofOfAddress.UtilityDateIssuer"?: string;
  "ProofOfAddress.UtilityFile"?: string | null;
  DesiredAccount?: string;
  Type?: number;
}

// Helper function to handle file objects
const fileToString = (file: File | string | null | undefined): string | null | undefined => {
  if (!file) return file;
  // If it's already a string, return it
  if (typeof file === 'string') return file;
  // If it's a File object, it should have already been converted to a base64 string elsewhere
  return undefined;
};

// Function to format form data for API submission
export const formatBusinessDataForApi = (formData: BusinessFormData): BusinessFormattedApiData => {
  const apiData: BusinessFormattedApiData = {
    // Business Information - Note: API expects "busienssName" and "busienssType" (with typo)
    busienssName: formData.businessName,
    RegistrationNumber: formData.registrationNumber,
    TaxIdentificationNumber: formData.tin,
    NatureOfBusiness: formData.natureOfBusiness,
    busienssType: formData.businessType,
    BusinessAddress: formData.businessAddress,
    PhoneNumber: formData.phoneNumber,
    EmailAddress: formData.email,
    Website: formData.website,
    
    // Critical account fields (top level)
    BranchId: formData.branchId || formData.branch,
    AccountOfficerId: formData.accountOfficerId || formData.accountOfficer,
    DesiredAccount: formData.desiredAccount,
    Type: formData.type || 2, // Business customer type
    
    // Business Documents (nested)
    "BusinessIncorporationDocument.FileType": 9, // BusinessIncorporationCertificate
    "BusinessIncorporationDocument.TheFile": fileToString(formData.businessIncorporationCertificate),
    
    "MemorandumOfAssociationDocument.FileType": 10, // MemorandumArticlesAssociation
    "MemorandumOfAssociationDocument.TheFile": fileToString(formData.memorandumArticles),
    
    "BusinessLicenseDocument.FileType": 11, // BusinessLicense
    "BusinessLicenseDocument.TheFile": fileToString(formData.businessLicense),
    
    // Proof of Address (nested)
    "ProofOfAddress.UtilityType": typeof formData.utilityBillType === 'string' ? parseInt(formData.utilityBillType) : undefined,
    "ProofOfAddress.UtilityIssuer": formData.utilityBillIssuer,
    "ProofOfAddress.UtilityDateIssuer": formData.issueDateOfBill instanceof Date 
      ? formData.issueDateOfBill.toISOString() 
      : typeof formData.issueDateOfBill === 'string' 
        ? formData.issueDateOfBill 
        : undefined,
    "ProofOfAddress.UtilityFile": fileToString(formData.utilityBill),
  };

  // Filter out undefined values before submission
  const filteredData = Object.fromEntries(
    Object.entries(apiData).filter(([_, value]) => value !== undefined)
  ) as BusinessFormattedApiData;
  
  // Log the exact payload being sent to the API
  console.log("Business Form API Payload:", JSON.stringify(filteredData, null, 2));
  
  return filteredData;
};

export default function BusinessFormController() {
  const [step] = useQueryState("step", parseAsInteger.withDefault(1))
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const params = useParams()
  const searchParams = useSearchParams()
  const {updateFormData} = useBusinessForm()
  const customerId = searchParams.get("id") || (params.id as string)
  const isEditMode = !!customerId

  // Fetch customer data action
  const { execute: fetchCustomer } = useAction(fetchCustomerAction, {
    onExecute() {
      setIsLoading(true)
      setDataLoaded(false)
      toast.loading("Loading business data...", { id: "fetch-business" })
    },
    onSuccess(data) {
      toast.dismiss("fetch-business")

      if (data.data?.success) {
        // Type assertion to BusinessCustomer since we're in the business form
        const customerData = data.data.data as BusinessCustomer

        if (customerData) {
          try {
            // Format the data to match the required structure
            const formattedBusinessData = {
              businessName: customerData.busienssName || "", 
              registrationNumber: customerData.registrationNumber || "",
              tin: customerData.taxIdentificationNumber || "",
              natureOfBusiness: customerData.natureOfBusiness || "",
              businessType: customerData.busienssType || "",
              businessAddress: customerData.businessAddress || "",
              phoneNumber: customerData.phoneNumber || "",
              email: customerData.emailAddress || "",
              website: customerData.website || "",

              // Business Registration Documents
              businessIncorporationCertificate:
                customerData.incorporationCertificate?.incorporationCertificateFile || null,
              memorandumArticles: customerData.memorandumAssociation?.memorandumAssociationFile || null,
              businessLicense: customerData.businessLicence?.businessLicenceFile || null,

              // Proof of Address
              utilityBillType: customerData.utilityType || "",
              utilityBillIssuer: customerData.utilityIssuer || "",
              issueDateOfBill: customerData.utilityDateIssuer ? new Date(customerData.utilityDateIssuer) : new Date(),
              utilityBill: customerData.utility?.utilityFile || null,

              // Account Information
              branch: customerData.branchId || "",
              desiredAccount: customerData.productType || "", // Store in desiredAccount field
              accountOfficer: customerData.accountOfficerId || "",
            }

            // Store in localStorage for persistence
            localStorage.setItem("CustomerBusinessForm", JSON.stringify(formattedBusinessData))
            updateFormData(formattedBusinessData)

            // Mark data as loaded successfully
            setDataLoaded(true)
            toast.success("Business data loaded successfully")
          } catch (error) {
            console.error("Error formatting business data:", error)
            toast.error("Error processing business data")
            // Even though there was an error, we should still mark as loaded
            // to prevent infinite loading state
            setDataLoaded(true)
          }
        } else {
          toast.error("Invalid business data format")
          setDataLoaded(true)
        }
      } else {
        toast.error(data.data?.error || "Failed to fetch business data")
        setDataLoaded(true)
      }

      setIsLoading(false)
    },
    onError(error) {
      toast.dismiss("fetch-business")
      toast.error(error.error.serverError || "An error occurred while fetching business data")
      setIsLoading(false)
      // Even on error, mark as loaded to prevent infinite loading state
      setDataLoaded(true)
    },
  })

  // Clear localStorage when not in edit mode to prevent showing old data
  useEffect(() => {
    if (!isEditMode) {
      localStorage.removeItem("CustomerBusinessForm")
      setDataLoaded(true)
    }
  }, [isEditMode])

  // Fetch customer data on component mount if in edit mode
  useEffect(() => {
    if (isEditMode && customerId) {
      fetchCustomer({
        userId: customerId,
        customerType: "business",
      })
    }
  }, [isEditMode, customerId, fetchCustomer])

  // Show loading skeleton while data is being fetched
  if (isLoading || (isEditMode && !dataLoaded)) {
    return <BusinessFormSkeleton />
  }

  return (
    <div>
      {step === 1 && <BusinessDetailForm />}
      {step === 2 && <BusinessDocumentsUpload />}
      {step === 3 && <ProofofAddressBusiness isEditMode={isEditMode}/>}
      {step === 4 && <BusinessConfirmationPage isEditMode={isEditMode} customerId={customerId}/>}
    </div>
  )
}

