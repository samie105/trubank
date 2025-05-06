/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { parseAsInteger, useQueryState } from "nuqs"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { fetchCustomerAction } from "@/server/customer-management/fetch-customer"
import { useFormContext } from "@/contexts/FormContext"
import InformationDetailsForm from "./InformationDetailsForm"
import IDDetailsForm from "./IDDetailsForm"
import ProofofAddress from "./ProofofAddress"
import EmploymentDetails from "./EmploymentDetails"
import GuarantorForm from "./GuarantorForm"
import NextOfKin from "./NextOfKin"
import ConfirmDetails from "./ConfirmPage"
import type { IndividualCustomer } from "@/server/customer-management/fetch-customers"
import type { FormData } from "@/types/types"
import { BusinessFormSkeleton } from "../business-form/business-form-skeleton"

// Define type for formatted API data
export interface FormattedApiData {
  Branch?: string;
  AccountOfficer?: string;
  DesiredAccount?: string;
  Type?: number;
  "MeansOfIdentity.IdType"?: number;
  "MeansOfIdentity.IdNumber"?: string;
  "MeansOfIdentity.IdIssuingAuthority"?: string;
  "MeansOfIdentity.IdExpiryDate"?: string;
  "MeansOfIdentity.IdFile"?: string | null;
  "PersonalInformations.FirstName"?: string;
  "PersonalInformations.MiddleName"?: string;
  "PersonalInformations.LastName"?: string;
  "PersonalInformations.Gender"?: string;
  "PersonalInformations.DateOfBirth"?: string;
  "PersonalInformations.MaritalStatus"?: string;
  "PersonalInformations.Nationality"?: string;
  "PersonalInformations.ResidentialAddress"?: string;
  "PersonalInformations.EmailAddress"?: string;
  "PersonalInformations.Password"?: string;
  "PersonalInformations.PhoneNumber"?: string;
  "PersonalInformations.AlternatePhoneNumber"?: string;
  "PersonalInformations.EmploymentStatus"?: string;
  "PersonalInformations.TaxIdenttfictionNumber"?: string;
  "ProofOfAddress.ProofOfAddressType"?: number;
  "ProofOfAddress.ProofOfAddressIssuingAuthority"?: string;
  "ProofOfAddress.ProofOfAddressDateIssue"?: string;
  "ProofOfAddress.ProofOfAddressFile"?: string | null;
  "EmploymentDetails.CurrentEmployerName"?: string;
  "EmploymentDetails.EmployerAddress"?: string;
  "EmploymentDetails.JobTitle"?: string;
  "EmploymentDetails.EmployementStateDate"?: string;
  "EmploymentDetails.EmployementEndDate"?: string;
  "EmploymentDetails.EmploymentVerificationDocument"?: string | null;
  "GuarantorDetails.GuarantorFullName"?: string;
  "GuarantorDetails.GuarantorRelationshipToCustomer"?: string;
  "GuarantorDetails.GuarantorPhoneNumber"?: string;
  "GuarantorDetails.GuarantorEmailAddress"?: string;
  "GuarantorDetails.GuarantorAddress"?: string;
  "GuarantorDetails.GuarantorIdFile"?: string | null;
  "NxtOfKinDetails.NextOfKinFullName"?: string;
  "NxtOfKinDetails.NextOfKinRelationshipToCustomer"?: string;
  "NxtOfKinDetails.NextOfKinPhoneNumber"?: string;
  "NxtOfKinDetails.NextOfKinEmailAddress"?: string;
  "NxtOfKinDetails.NextOfKinAddress"?: string;
  ProfilePicture?: string | null;
}

// Helper function to handle file objects
const fileToString = (file: File | string | null | undefined): string | null | undefined => {
  if (!file) return file;
  // If it's already a string, return it
  if (typeof file === 'string') return file;
  // If it's a File object, it should have already been converted to a base64 string
  // by the upload process elsewhere in the app
  return undefined;
};

// Function to format form data for API submission
export const formatFormDataForApi = (formData: FormData): FormattedApiData => {
  const apiData: FormattedApiData = {
    // Critical account fields (top level)
    Branch: formData.branch,
    AccountOfficer: formData.accountOfficer,
    DesiredAccount: formData.desiredAccount,
    Type: 1, // Individual customer type
    
    // Personal Information (nested)
    "PersonalInformations.FirstName": formData.firstName,
    "PersonalInformations.LastName": formData.lastName,
    "PersonalInformations.DateOfBirth": formData.dob instanceof Date ? formData.dob.toISOString() : formData.dob,
    "PersonalInformations.Gender": formData.gender,
    "PersonalInformations.EmailAddress": formData.email,
    "PersonalInformations.PhoneNumber": formData.phone,
    "PersonalInformations.Nationality": formData.country,
    "PersonalInformations.MaritalStatus": formData.maritalStatus,
    "PersonalInformations.AlternatePhoneNumber": formData.alternatePhone,
    "PersonalInformations.EmploymentStatus": formData.employmentStatus,
    "PersonalInformations.TaxIdenttfictionNumber": formData.tin,
    "PersonalInformations.ResidentialAddress": formData.address,
    
    // Means of Identity (nested)
    "MeansOfIdentity.IdType": typeof formData.idType === 'string' ? parseInt(formData.idType) : undefined,
    "MeansOfIdentity.IdNumber": formData.idNumber,
    "MeansOfIdentity.IdIssuingAuthority": formData.issuingAuthority,
    "MeansOfIdentity.IdExpiryDate": formData.expiryDate instanceof Date ? formData.expiryDate.toISOString() : formData.expiryDate,
    "MeansOfIdentity.IdFile": fileToString(formData.IdFile),
    
    // Proof of Address (nested)
    "ProofOfAddress.ProofOfAddressType": typeof formData.addressProofType === 'string' ? parseInt(formData.addressProofType) : undefined,
    "ProofOfAddress.ProofOfAddressIssuingAuthority": formData.issuingAuthorityPOA,
    "ProofOfAddress.ProofOfAddressDateIssue": formData.dateOfIssue instanceof Date ? formData.dateOfIssue.toISOString() : formData.dateOfIssue,
    "ProofOfAddress.ProofOfAddressFile": fileToString(formData.proofOfAddress),
    
    // Employment Details (nested)
    "EmploymentDetails.CurrentEmployerName": formData.currentEmployerName,
    "EmploymentDetails.EmployerAddress": formData.employerAddress,
    "EmploymentDetails.JobTitle": formData.jobTitle,
    "EmploymentDetails.EmployementStateDate": formData.startDate instanceof Date ? formData.startDate.toISOString() : formData.startDate,
    "EmploymentDetails.EmployementEndDate": formData.endDate instanceof Date ? formData.endDate.toISOString() : formData.endDate,
    "EmploymentDetails.EmploymentVerificationDocument": fileToString(formData.employmentDocument),
    
    // Guarantor Details (nested)
    "GuarantorDetails.GuarantorFullName": formData.guarantorFullName,
    "GuarantorDetails.GuarantorRelationshipToCustomer": formData.guarantorRelationship,
    "GuarantorDetails.GuarantorPhoneNumber": formData.guarantorPhone,
    "GuarantorDetails.GuarantorEmailAddress": formData.guarantorEmail,
    "GuarantorDetails.GuarantorAddress": formData.guarantorAddress,
    "GuarantorDetails.GuarantorIdFile": fileToString(formData.guarantorId),
    
    // Next of Kin Details (nested)
    "NxtOfKinDetails.NextOfKinFullName": formData.nextOfKinFullName,
    "NxtOfKinDetails.NextOfKinRelationshipToCustomer": formData.nextOfKinRelationship,
    "NxtOfKinDetails.NextOfKinPhoneNumber": formData.nextOfKinPhone,
    "NxtOfKinDetails.NextOfKinEmailAddress": formData.nextOfKinEmail,
    "NxtOfKinDetails.NextOfKinAddress": formData.nextOfKinAddress,
    
    // Profile Picture (top level)
    ProfilePicture: fileToString(formData.profileImage)
  };
  console.log(apiData)
  return apiData;
};

export default function FormStepController() {
  const [step] = useQueryState("step", parseAsInteger.withDefault(1))
  const [isLoading, setIsLoading] = useState(false)
  const params = useParams()
  const searchParams = useSearchParams()
  const { updateFormData } = useFormContext()

  const customerId = searchParams.get("id") || (params.id as string)

  console.log( customerId)

  // Fetch customer data action
  const { execute: fetchCustomer } = useAction(fetchCustomerAction, {
    onExecute() {
      setIsLoading(true)
      toast.loading("Loading customer data...", { id: "fetch-customer" })
    },
    onSuccess(data) {
      toast.dismiss("fetch-customer")

      if (data.data?.success) {
        // Type assertion to IndividualCustomer since we're in the individual form
        const customerData = data.data.data as IndividualCustomer

        if (customerData) {
          // Format the data to match the required structure
          const formattedData: FormData = {
            // Personal Information
            firstName: customerData.firstName || "",
            lastName: customerData.lastName || "",
            dob: customerData.dateOfBirth ? new Date(customerData.dateOfBirth) : new Date(),
            gender: customerData.gender?.toLowerCase() || "",
            email: customerData.emailAddress || "",
            phone: customerData.phoneNumber || "",
            country: customerData.nationality || "",
            maritalStatus: customerData.maritalStatus || "",
            alternatePhone: customerData.alternatePhoneNumber || "",
            employmentStatus: customerData.employmentStatus || "",
            tin: customerData.taxIdentificationNumber || "",
            address: customerData.residentialAddress || "",

            // ID Details
            idType: customerData.idType as any,
            idNumber: customerData.idNumber || "",
            IdFile: null,
            expiryDate: customerData.idExpiryDate ? new Date(customerData.idExpiryDate) : new Date(),
            issuingAuthority: customerData.idIssuingAuthority || "",

            // Proof of Address
            proofOfAddress: null,
            dateOfIssue: customerData.proofOfAddressDateIssue
              ? new Date(customerData.proofOfAddressDateIssue)
              : new Date(),
            addressProofType: customerData.proofOfAddressType as any,
            issuingAuthorityPOA: customerData.proofOfAddressIssuingAuthority || "",

            // Account Information
            profileImage: null,
            branch: customerData.branchId || "",
            accountOfficer: customerData.accountOfficerId || "",
            desiredAccount: customerData.desiredAccount || "",
            
            // Employment Details
            employerAddress: customerData.employmentDetails?.employerAddress || "",
            jobTitle: customerData.employmentDetails?.jobTitle || "",
            currentEmployerName: customerData.employmentDetails?.currentEmployerName || "",
            startDate: customerData.employmentDetails?.employementStateDate
              ? new Date(customerData.employmentDetails.employementStateDate)
              : new Date(),
            endDate: customerData.employmentDetails?.employementEndDate
              ? new Date(customerData.employmentDetails.employementEndDate)
              : new Date(),
            employmentDocument: customerData.employmentDetails?.employmentVerificationDocument || null,

            // Guarantor Details
            guarantorFullName: customerData.guarantorDetails?.guarantorFullName || "",
            guarantorRelationship: customerData.guarantorDetails?.guarantorRelationshipToCustomer || "",
            guarantorPhone: customerData.guarantorDetails?.guarantorPhoneNumber || "",
            guarantorEmail: customerData.guarantorDetails?.guarantorEmailAddress || "",
            guarantorAddress: customerData.guarantorDetails?.guarantorAddress || "",
            guarantorId: customerData.guarantorDetails?.guarantorFileDocument || null,

            // Next of Kin Details
            nextOfKinFullName: customerData.nextOfKinDetails?.nextOfKinFullName || "",
            nextOfKinPhone: customerData.nextOfKinDetails?.nextOfKinPhoneNumber || "",
            nextOfKinEmail: customerData.nextOfKinDetails?.nextOfKinEmailAddress || "",
            nextOfKinAddress: customerData.nextOfKinDetails?.nextOfKinAddress || "",
            nextOfKinRelationship: customerData.nextOfKinDetails?.nextOfKinRelationshipToCustomer || "",
          }

          // Update form data in context
          updateFormData(formattedData)

          // Also save to localStorage for persistence
          localStorage.setItem("customerForm", JSON.stringify(formattedData))

          toast.success("Customer data loaded successfully")
        } else {
          toast.error("Invalid customer data format")
        }
      } else {
        toast.error(data.data?.error || "Failed to fetch customer data")
      }

      setIsLoading(false)
    },
    onError(error) {
      toast.dismiss("fetch-customer")
      toast.error(error.error.serverError || "An error occurred while fetching customer data")
      setIsLoading(false)
    },
  })

  // Fetch customer data on component mount if in edit mode
  useEffect(() => {
    if (customerId) {
      fetchCustomer({
        userId: customerId,
        customerType: "individual",
      })
    }
  }, [ customerId, fetchCustomer])

  if (isLoading) {
    return <BusinessFormSkeleton />
  }

  return (
    <div>
      {step === 1 && <InformationDetailsForm />}
      {step === 2 && <IDDetailsForm />}
      {step === 3 && <ProofofAddress />}
      {step === 4 && <EmploymentDetails />}
      {step === 5 && <GuarantorForm />}
      {step === 6 && <NextOfKin />}
      {step === 7 && <ConfirmDetails params={params} />}
    </div>
  )
}

