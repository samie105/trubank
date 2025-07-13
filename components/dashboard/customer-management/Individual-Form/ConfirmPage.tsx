/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { parseAsInteger, useQueryState } from "nuqs"
import { format } from "date-fns"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useFormContext } from "@/contexts/FormContext"
import { useAction } from "next-safe-action/hooks"
import { createCustomerAction } from "@/server/customer-management/create-customer"
import { editCustomerAction } from "@/server/customer-management/edit-customer"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { logoutAction } from "@/server/auth/auth-server"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { AlertCircle, XCircle } from "lucide-react"

// Helper function to get missing fields for guidance (doesn't block submission)
const getMissingFields = (formData: any) => {
  const recommendedFields = [
    { key: "firstName", label: "First Name", section: "Personal Information" },
    { key: "lastName", label: "Last Name", section: "Personal Information" },
    { key: "dob", label: "Date of Birth", section: "Personal Information" },
    { key: "gender", label: "Gender", section: "Personal Information" },
    { key: "email", label: "Email", section: "Personal Information" },
    { key: "phone", label: "Phone Number", section: "Personal Information" },
    { key: "country", label: "Country", section: "Address" },
    { key: "address", label: "Address", section: "Address" },
    { key: "idType", label: "ID Type", section: "Identification" },
    { key: "idNumber", label: "ID Number", section: "Identification" },
  ]

  return recommendedFields.filter(field => !formData[field.key])
}

// Group missing fields by section
const groupMissingFieldsBySection = (missingFields: any[]) => {
  const grouped: Record<string, string[]> = {}
  
  missingFields.forEach(field => {
    if (!grouped[field.section]) {
      grouped[field.section] = []
    }
    grouped[field.section].push(field.label)
  })
  
  return grouped
}

// Map field path from API to UI field with proper section and message
const mapFieldPathToUIField = (fieldPath: string, errorMessage: string): {key: string, label: string, section: string, message: string} => {
  // Split the path to get section and field name
  // e.g., "PersonalInformations.Nationality" → ["PersonalInformations", "Nationality"]
  const pathParts = fieldPath.split('.');
  const fieldName = pathParts[pathParts.length - 1]; // Get the last part as field name
  const sectionName = pathParts.length > 1 ? pathParts[0] : "General";
  
  // Map section names to UI sections
  const sectionMap: Record<string, string> = {
    "PersonalInformations": "Personal Information",
    "PersonalDetails": "Personal Information", 
    "EmploymentDetails": "Employment Information",
    "IdentificationDetails": "Identification",
    "AddressDetails": "Address",
    "GuarantorDetails": "Guarantor & Next of Kin Information",
    "NextOfKinDetails": "Guarantor & Next of Kin Information",
    "AccountDetails": "Account Information",
    "ProofOfAddress": "Proof of Address"
  };
  
  // Map field names to UI labels
  const fieldMap: Record<string, string> = {
    // Personal Information fields
    "FirstName": "First Name",
    "LastName": "Last Name",
    "MiddleName": "Middle Name",
    "DateOfBirth": "Date of Birth",
    "Dob": "Date of Birth",
    "Gender": "Gender",
    "Email": "Email",
    "EmailAddress": "Email",
    "Phone": "Phone Number",
    "PhoneNumber": "Phone Number",
    "MaritalStatus": "Marital Status",
    "AlternatePhone": "Alternate Phone",
    "EmploymentStatus": "Employment Status",
    "Tin": "Tax Identification Number",
    "Nationality": "Nationality",
    
    // Address fields
    "Country": "Country",
    "Address": "Address",
    "ResidentialAddress": "Address",
    
    // Identification fields
    "IdType": "ID Type",
    "IdNumber": "ID Number",
    "ExpiryDate": "Expiry Date",
    "IssuingAuthority": "Issuing Authority",
    "IdDocument": "ID Document",
    
    // Proof of Address fields
    "AddressProofType": "Type of Address Proof",
    "IssuingAuthorityPOA": "Issuing Authority",
    "DateOfIssue": "Date of Issue",
    "ProofOfAddress": "Proof of Address Document",
    
    // Employment fields
    "CurrentEmployerName": "Current Employer Name",
    "EmployerName": "Current Employer Name",
    "EmployerAddress": "Employer Address",
    "JobTitle": "Job Title",
    "StartDate": "Start Date",
    "EndDate": "End Date",
    "EmploymentDocument": "Employment Document",
    
    // Account Info fields
    "Branch": "Branch",
    "AccountOfficer": "Account Officer",
    "ProductType": "Product Type",
    "ProfileImage": "Profile Image",
    "DesiredAccount": "Product Type"
  };
  
  // Get the mapped section or create a proper section name
  const section = sectionMap[sectionName] || formatFieldName(sectionName);
  
  // Get the mapped field label or create one from the field name
  const label = fieldMap[fieldName] || formatFieldName(fieldName);
  
  return {
    key: fieldName,
    label,
    section,
    message: errorMessage
  };
};

// Parse API error responses into usable format
const parseApiErrors = (error: any) => {
  let errorMessage = "Failed to update customer";
  const errorDetails: string[] = [];
  const errorFields: {key: string, label: string, section: string, message: string}[] = [];
  let rawError: any = error.data;
  
  try {
    console.log("Raw API error:", error);
    console.log("Raw API error data:", JSON.stringify(error.data, null, 2));
    
    rawError = error.data;
    
    // Extract the main error message
    if (error.data?.title) {
      errorMessage = error.data.title;
    } else if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (error.error?.serverError) {
      errorMessage = error.error.serverError;
    }
    
    // Handle empty response
    if (!error.data || (typeof error.data === 'object' && Object.keys(error.data).length === 0)) {
      console.log("Empty API response detected");
      return { 
        errorMessage: "Failed to update customer - no error details provided", 
        errorDetails: ["Empty response from server"], 
        errorFields: [{
          key: "general",
          label: "Server Error",
          section: "General Information",
          message: "No specific error details were provided by the server"
        }], 
        rawError 
      };
    }
    
    // Process validation errors from the API response
    if (error.data?.errors) {
      console.log("Processing validation errors:", error.data.errors);
      
      Object.entries(error.data.errors).forEach(([fieldPath, messages]) => {
        // Handle array of error messages
        const messageList = Array.isArray(messages) ? messages : [messages];
        const actualErrorMessage = messageList.join(', ');
        
        // Add to details
        errorDetails.push(`${fieldPath}: ${actualErrorMessage}`);
        
        // Map the field path to UI field
        const mappedField = mapFieldPathToUIField(fieldPath, actualErrorMessage);
        if (mappedField) {
          errorFields.push(mappedField);
        }
      });
    }
    
    // Handle other error formats
    if (error.data?.validationErrors) {
      Object.entries(error.data.validationErrors).forEach(([field, msg]) => {
        const msgText = typeof msg === 'string' ? msg : JSON.stringify(msg);
        errorDetails.push(`${field}: ${msgText}`);
        
        const mappedField = mapFieldPathToUIField(field, msgText);
        if (mappedField) {
          errorFields.push(mappedField);
        }
      });
    }
    
    // If no specific errors found, add general error
    if (errorFields.length === 0) {
      errorFields.push({
        key: "general",
        label: "Form Data",
        section: "General Information",
        message: errorMessage
      });
    }

    console.log("Processed error:", {
      message: errorMessage,
      details: errorDetails,
      fields: errorFields
    });
  } catch (e) {
    console.error("Error parsing API error response:", e);
    errorFields.push({
      key: "general",
      label: "Form Data",
      section: "General Information",
      message: "An unexpected error occurred while processing the error response"
    });
  }
  
  return { errorMessage, errorDetails, errorFields, rawError };
};

// Format display values by replacing underscores with spaces
const formatDisplayValue = (value: string | undefined): string | undefined => {
  if (!value) return value;
  return value.replace(/_/g, " ");
};

// Format field name to be more readable
// e.g., "JobTitle" → "Job Title"
const formatFieldName = (fieldName: string): string => {
  return fieldName
    // Insert spaces before capital letters
    .replace(/([A-Z])/g, ' $1')
    // Handle special cases like "ID" that should stay uppercase
    .replace(/ Id /g, ' ID ')
    // Trim and ensure first letter is capitalized
    .trim()
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());
};

// Group error fields by section, similar to missing fields grouping
const groupErrorFieldsBySection = (errorFields: {key: string, label: string, section: string, message: string}[]) => {
  const grouped: Record<string, {label: string, message: string}[]> = {};
  
  errorFields.forEach(field => {
    if (!grouped[field.section]) {
      grouped[field.section] = [];
    }
    
    // Only add if not already in the section
    const existingField = grouped[field.section].find(f => f.label === field.label);
    if (!existingField) {
      grouped[field.section].push({
        label: field.label,
        message: field.message
      });
    }
  });
  
  return grouped;
};

export default function ConfirmDetails({ params }: { params?: any }) {
  const { formData } = useFormContext()
  const [, setStep] = useQueryState("step", parseAsInteger)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMissingFieldsDialog, setShowMissingFieldsDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState<{ 
    message: string, 
    details: string[], 
    fields: {key: string, label: string, section: string, message: string}[],
    rawError?: any
  }>({ message: "", details: [], fields: [] });

  // Add a memoized grouped error structure for easy rendering
  const groupedErrorFields = groupErrorFieldsBySection(showErrorDialog.fields);

  // Get missing fields (for guidance only)
  const missingFields = formData ? getMissingFields(formData) : []
  const hasMissingFields = missingFields.length > 0
  const groupedMissingFields = groupMissingFieldsBySection(missingFields)

  // Check if we're in edit mode
  const isEditMode = params?.id || searchParams.get("edit") === "true"
  const customerId = params?.id || searchParams.get("id")

  // Action to handle logout
  const { execute: executeLogout } = useAction(logoutAction, {
    onSuccess() {
      router.push("/auth/login")
    },
  })

  // Handle re-login
  const handleReLogin = () => {
    executeLogout()
  }

  // Create customer action
  const { execute: executeCreate } = useAction(createCustomerAction, {
    onExecute() {
      setIsSubmitting(true)
      toast.loading("Submitting your application...", { id: "create-customer" })
    },
    onSuccess(data) {
      toast.dismiss("create-customer")
      if (data.data?.success) {
        toast.success(data.data.message || "Your application has been submitted successfully!")
        console.log("Customer created successfully:", data.data)
        // Redirect to success page or dashboard with customer ID
        router.push(`/dashboard/customer-management?success=true&id=${data.data.customerId || ""}`)
      } else {
        console.error("Failed to create customer:", data.data)

        // Check if it's an authentication error (401)
        if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
          toast.error(
            <div className="flex items-center">
              <p>{data.data.error || "Your session has expired. Please log in again."}</p>
              <Button onClick={handleReLogin} variant={"outline"} className="mt-2 text-white w-full">
                Re-login
              </Button>
            </div>,
          )
        } else {
          // Show error dialog with validation errors
          const { errorMessage, errorDetails, errorFields, rawError } = parseApiErrors(data);
          setShowErrorDialog({ message: errorMessage, details: errorDetails, fields: errorFields, rawError });
          toast.dismiss("create-customer");
        }

        setIsSubmitting(false)
      }
    },
    onError(error) {
      toast.dismiss("create-customer")
      
      // Show error dialog with validation errors
      const { errorMessage, errorDetails, errorFields, rawError } = parseApiErrors(error);
      setShowErrorDialog({ message: errorMessage, details: errorDetails, fields: errorFields, rawError });
      
      setIsSubmitting(false)
    },
    onSettled() {
      toast.dismiss("create-customer")
    },
  })

  // Edit customer action
  const { execute: executeEdit } = useAction(editCustomerAction, {
    onExecute: () => {
      setIsSubmitting(true);
      toast.loading("Updating customer information...", { id: "edit-customer" });
    },
    onSuccess: (data) => {
      toast.dismiss("edit-customer");
      
      // Check if data and data.data exist to avoid undefined errors
      if (!data || !data.data) {
        console.error("Empty response received:", data);
        setShowErrorDialog({ 
          message: "Failed to update customer. The server returned an empty response.", 
          details: ["Empty response from server"], 
          fields: [{
            key: "general",
            label: "Server Error",
            section: "General Information",
            message: "The server returned an empty response. Please try again or contact support."
          }],
          rawError: data?.data
        });
        setIsSubmitting(false);
        return;
      }
      
      // Define a success result type to help TypeScript
      type SuccessResult = {
        success: true;
        message: string;
        customerId: string;
        customerData: any;
      };
      
      if (data.data?.success) {
        // Cast to the success type for TypeScript
        const successData = data.data as SuccessResult;
        toast.success(successData.message || "Customer information updated successfully!");
        console.log("Customer updated successfully:", successData);
        // Redirect to customer management page
        router.push(`/dashboard/customer-management?updated=true&id=${successData.customerId || ""}`);
      } else {
        console.error("Failed to update customer:", data.data);
        
        // Log the full API response for debugging
        console.log("API response status:", data.data?.statusCode);
        console.log("Raw API response:", JSON.stringify(data.data, null, 2));

        // If the error object is empty, provide a meaningful default error
        if (Object.keys(data.data || {}).length === 0) {
          setShowErrorDialog({ 
            message: "Failed to update customer. Unknown error occurred.", 
            details: ["The server responded with an empty error object"], 
            fields: [{
              key: "employmentDetails",
              label: "Employment Information",
              section: "Employment Information",
              message: "There may be missing required employment details"
            }],
            rawError: data.data
          });
          setIsSubmitting(false);
          return;
        }

        // Type for error result
        type ErrorResult = {
          success: false;
          error: string;
          statusCode: number;
          details?: any;
        };

        // Check if it's an authentication error (401)
        const errorData = data.data as ErrorResult;
        if (errorData.statusCode === 401 || errorData.error?.includes("Authentication required")) {
          toast.error(
            <div className="flex items-center">
              <p>{errorData.error || "Your session has expired. Please log in again."}</p>
              <Button onClick={handleReLogin} variant={"outline"} className="mt-2 text-white w-full">
                Re-login
              </Button>
            </div>
          );
        } else {
          // Show error dialog with validation errors
          const { errorMessage, errorDetails, errorFields, rawError } = parseApiErrors(data);
          setShowErrorDialog({ message: errorMessage, details: errorDetails, fields: errorFields, rawError });
        }

        setIsSubmitting(false);
      }
    },
    onError: (error) => {
      toast.dismiss("edit-customer");
      
      // Handle null or undefined error objects
      if (!error) {
        console.error("Null or undefined error received");
        setShowErrorDialog({ 
          message: "Failed to update customer. Unknown error occurred.", 
          details: ["No error details available"], 
          fields: [{
            key: "general",
            label: "Unknown Error",
            section: "General Information",
            message: "An unknown error occurred. Please try again or contact support."
          }],
          rawError: error
        });
        setIsSubmitting(false);
        return;
      }
      
      // Log the full error for debugging
      console.log("API error response:", error);
      
      // Show error dialog with validation errors
      const { errorMessage, errorDetails, errorFields, rawError } = parseApiErrors(error);
      setShowErrorDialog({ message: errorMessage, details: errorDetails, fields: errorFields, rawError });
      
      setIsSubmitting(false);
    },
    onSettled: () => {
      toast.dismiss("edit-customer");
    }
  });

  if (!formData) {
    return <div>Loading...</div>
  }

  const handleMakeChanges = () => {
    setStep(1)
  }

  const handleCancel = () => {
    // Clear all form data from localStorage
    localStorage.removeItem("customerForm")
    // Redirect to customer management dashboard
    router.push("/dashboard/customer-management")
  }

  const handleConfirmAndSubmit = () => {
    console.log("Form submitted:", formData)

    // If there are missing fields, show the dialog instead of toasting errors
    if (hasMissingFields) {
      setShowMissingFieldsDialog(true)
      return
    }

    // Skip required field validation
    if (!formData) {
      toast.error("Form data is missing")
      return
    }

    // Validate required fields before submission
    if (!formData.branch || !formData.accountOfficer || !formData.desiredAccount) {
      toast.error("Missing required fields: Branch, Account Officer, or Desired Account")
      return
    }

    // Create a copy of formData with the correct types for submission
    const submissionData = {
      // Required fields - we know these exist because of the validation above
      branch: formData.branch!,
      accountOfficer: formData.accountOfficer!,
      desiredAccount: formData.desiredAccount!,
      customerId: String(customerId || ""),
      
      // Optional fields from formData
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      dob: formData.dob instanceof Date ? formData.dob.toISOString() : formData.dob || undefined,
      gender: formData.gender || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      maritalStatus: formData.maritalStatus || undefined,
      alternatePhone: formData.alternatePhone || undefined,
      employmentStatus: formData.employmentStatus || undefined,
      tin: formData.tin || undefined,
      country: formData.country || undefined,
      address: formData.address || undefined,
      idType: formData.idType || undefined,
      idNumber: formData.idNumber || undefined,
      expiryDate: formData.expiryDate instanceof Date ? formData.expiryDate.toISOString() : formData.expiryDate || undefined,
      issuingAuthority: formData.issuingAuthority || undefined,
      addressProofType: formData.addressProofType || undefined,
      issuingAuthorityPOA: formData.issuingAuthorityPOA || undefined,
      dateOfIssue: formData.dateOfIssue instanceof Date ? formData.dateOfIssue.toISOString() : formData.dateOfIssue || undefined,
      startDate: formData.startDate instanceof Date ? formData.startDate.toISOString() : formData.startDate || undefined,
      endDate: formData.endDate instanceof Date ? formData.endDate.toISOString() : formData.endDate || undefined,
      
      // Convert File objects to strings or undefined (not null)
      profileImage: formData.profileImage instanceof File ? undefined : formData.profileImage || undefined,
      IdFile: formData.IdFile instanceof File ? undefined : formData.IdFile || undefined,
      proofOfAddress: formData.proofOfAddress instanceof File ? undefined : formData.proofOfAddress || undefined,
      employmentDocument: formData.employmentDocument instanceof File ? undefined : formData.employmentDocument || undefined,
      guarantorId: formData.guarantorId instanceof File ? undefined : formData.guarantorId || undefined,
      
      // Employment details
      currentEmployerName: formData.currentEmployerName || undefined,
      employerAddress: formData.employerAddress || undefined,
      jobTitle: formData.jobTitle || undefined,
      
      // Guarantor details
      guarantorFullName: formData.guarantorFullName || undefined,
      guarantorRelationship: formData.guarantorRelationship || undefined,
      guarantorPhone: formData.guarantorPhone || undefined,
      guarantorEmail: formData.guarantorEmail || undefined,
      guarantorAddress: formData.guarantorAddress || undefined,
      
      // Next of kin details
      nextOfKinFullName: formData.nextOfKinFullName || undefined,
      nextOfKinPhone: formData.nextOfKinPhone || undefined,
      nextOfKinEmail: formData.nextOfKinEmail || undefined,
      nextOfKinAddress: formData.nextOfKinAddress || undefined,
      nextOfKinRelationship: formData.nextOfKinRelationship || undefined,
      
      // Alert preferences
      requireSmsAlert: formData.requireSmsAlert ?? false,
      requireEmailAlert: formData.requireEmailAlert ?? false,
    }

    // If in edit mode, add the customer ID and use the edit action
    if (isEditMode && customerId) {
      executeEdit(submissionData)
    } else {
      // Otherwise use the create action
      executeCreate(submissionData as any)
    }
  }

  const handleMissingFieldsClick = () => {
    setShowMissingFieldsDialog(true)
  }

  const renderField = (label: string, value: string | null | undefined) => {
    if (!value) return null
    return (
      <div className="flex flex-col py-2">
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className="font-semibold pt-2">{formatDisplayValue(value)}</span>
      </div>
    )
  }

  const renderDate = (label: string, value: Date | string | null | undefined) => {
    if (!value) return null
    return renderField(label, format(new Date(value), "MMMM d, yyyy"))
  }

  const renderImage = (label: string, src: string | File | null | undefined, alt: string, idType?: string) => {
    if (!src || idType === "BVN") return null
    // If src is a File object, we can't render it directly
    const imgSrc = typeof src === "string" ? src : "/placeholder.svg"
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="font-medium text-muted-foreground">{label}</span>
        <Image
          src={imgSrc || "/placeholder.svg"}
          alt={alt}
          width={200}
          height={200}
          className="rounded-lg object-cover"
        />
      </div>
    )
  }

  return (
    <Card className="w-full border-none max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isEditMode ? "Confirm Your Changes" : "Confirm Your Details"}
        </CardTitle>
        <p className="text-muted-foreground">
          Please review your information carefully before {isEditMode ? "updating" : "submitting"}
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-6 md:grid-cols-1">
            {/* Personal Information Section */}
            {(formData.firstName ||
              formData.lastName ||
              formData.dob ||
              formData.gender ||
              formData.email ||
              formData.phone ||
              formData.maritalStatus ||
              formData.alternatePhone ||
              formData.employmentStatus ||
              formData.tin) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                {renderField("First Name", formData.firstName)}
                {renderField("Last Name", formData.lastName)}
                {renderDate("Date of Birth", formData.dob)}
                {renderField("Gender", formData.gender)}
                {renderField("Email", formData.email)}
                {renderField("Phone", formData.phone)}
                {renderField("Marital Status", formData.maritalStatus)}
                {renderField("Alternate Phone", formData.alternatePhone)}
                {renderField("Employment Status", formData.employmentStatus)}
                {renderField("Tax Identification Number (TIN)", formData.tin)}
              </div>
            )}

            {/* Address Section */}
            {(formData.country || formData.address) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address</h3>
                  {renderField("Country", formData.countryName || formData.country)}
                  {renderField("Address", formData.address)}
                </div>
              </>
            )}

            {/* Identification Section */}
            {(formData.idType ||
              formData.idNumber ||
              formData.IdFile ||
              formData.expiryDate ||
              formData.issuingAuthority) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Means Of Identification</h3>
                  {renderField("ID Type", formData.idType)}
                  {renderField("ID Number", formData.idNumber)}
                  {renderDate("Expiry Date", formData.expiryDate)}
                  {renderField("Issuing Authority", formData.issuingAuthority)}
                  {renderImage(
                    `${formData.idType} ID File`,
                    formData.IdFile,
                    `${formData.idType} ID`,
                    formData.idType,
                  )}
                </div>
              </>
            )}

            {/* Proof of Address Section */}
            {(formData.proofOfAddress ||
              formData.dateOfIssue ||
              formData.addressProofType ||
              formData.issuingAuthorityPOA) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Proof of Address</h3>
                  {renderField("Type of Address Proof", formData.addressProofType)}
                  {renderField("Issuing Authority", formData.issuingAuthorityPOA)}
                  {renderDate("Date of Issue", formData.dateOfIssue)}
                  {renderImage("Proof of Address Document", formData.proofOfAddress, "Proof of Address")}
                </div>
              </>
            )}

            {/* Employment Information Section */}
            {(formData.employerAddress ||
              formData.jobTitle ||
              formData.startDate ||
              formData.endDate ||
              formData.employmentDocument ||
              formData.currentEmployerName) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employment Information</h3>
                  {renderField("Current Employer Name", formData.currentEmployerName)}
                  {renderField("Employer Address", formData.employerAddress)}
                  {renderField("Job Title", formData.jobTitle)}
                  {renderDate("Start Date", formData.startDate)}
                  {renderDate("End Date", formData.endDate)}
                  {renderImage("Employment Document", formData.employmentDocument, "Employment Document")}
                </div>
              </>
            )}

            {/* Guarantor Information Section */}
            {(formData.guarantorFullName ||
              formData.guarantorRelationship ||
              formData.guarantorPhone ||
              formData.guarantorEmail ||
              formData.guarantorAddress ||
              formData.guarantorId ||
              formData.nextOfKinFullName ||
              formData.nextOfKinPhone ||
              formData.nextOfKinEmail ||
              formData.nextOfKinAddress ||
              formData.nextOfKinRelationship) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Guarantor & Next of Kin Information</h3>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Guarantor Details</h4>
                    {renderField("Full Name", formData.guarantorFullName)}
                    {renderField("Relationship", formData.guarantorRelationship)}
                    {renderField("Phone Number", formData.guarantorPhone)}
                    {renderField("Email", formData.guarantorEmail)}
                    {renderField("Address", formData.guarantorAddress)}
                    {renderImage("Guarantor ID", formData.guarantorId, "Guarantor ID Document")}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Next of Kin Details</h4>
                    {renderField("Full Name", formData.nextOfKinFullName)}
                    {renderField("Phone Number", formData.nextOfKinPhone)}
                    {renderField("Email", formData.nextOfKinEmail)}
                    {renderField("Address", formData.nextOfKinAddress)}
                    {renderField("Relationship", formData.nextOfKinRelationship)}
                  </div>
                </div>
              </>
            )}
            {/* Account Information Section */}
            {(formData.branch || formData.accountOfficer || formData.desiredAccount || formData.profileImage) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  {renderField("Branch", formData.branchName || formData.branch)}
                  {renderField("Account Officer", formData.accountOfficerName || formData.accountOfficer)}
                  {renderField("Product Type", formData.productTypeName || formData.desiredAccount)}
                  {renderImage("Profile Image", formData.profileImage, "Profile")}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleMakeChanges} disabled={isSubmitting}>
            Make Changes
          </Button>
        </div>
        <div className="space-x-2">
          {hasMissingFields && (
            <Button 
              variant="outline" 
              className="border-amber-600 text-amber-600 hover:bg-amber-50"
              onClick={handleMissingFieldsClick}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              View Missing Fields
            </Button>
          )}
          <Button onClick={handleConfirmAndSubmit} className="text-white" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : isEditMode ? "Update Information" : "Confirm & Submit"}
          </Button>
        </div>
      </CardFooter>

      {/* Missing Fields Dialog */}
      <Dialog open={showMissingFieldsDialog} onOpenChange={setShowMissingFieldsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Recommended Information</DialogTitle>
            <DialogDescription>
              The following information is typically recommended but not required for submission.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-6">
              {Object.entries(groupedMissingFields).map(([section, fields]) => (
                <div key={section} className="space-y-2">
                  <h4 className="font-medium text-lg">{section}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {fields.map((field, i) => (
                      <div key={i} className="flex items-center p-2 rounded-md bg-amber-50 border border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowMissingFieldsDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowMissingFieldsDialog(false)
                
                // Create submission data
                const submissionData = {
                  ...formData,
                  // Ensure file fields are treated as strings
                  profileImage: formData.profileImage as string | null | undefined,
                  IdFile: formData.IdFile as string | null | undefined,
                  proofOfAddress: formData.proofOfAddress as string | null | undefined,
                  employmentDocument: formData.employmentDocument as string | null | undefined,
                  guarantorId: formData.guarantorId as string | null | undefined,
            
                  // Ensure dates are in ISO format
                  dob: formData.dob instanceof Date ? formData.dob.toISOString() : formData.dob,
                  expiryDate: formData.expiryDate instanceof Date ? formData.expiryDate.toISOString() : formData.expiryDate,
                  dateOfIssue: formData.dateOfIssue instanceof Date ? formData.dateOfIssue.toISOString() : formData.dateOfIssue,
                  startDate: formData.startDate instanceof Date ? formData.startDate.toISOString() : formData.startDate,
                  endDate: formData.endDate instanceof Date ? formData.endDate.toISOString() : formData.endDate,
                }
            
                // If in edit mode, add the customer ID and use the edit action
                if (isEditMode && customerId) {
                  executeEdit({
                    ...submissionData,
                    customerId,
                    branch: submissionData.branch || '',
                    accountOfficer: submissionData.accountOfficer || '',
                    desiredAccount: submissionData.desiredAccount || ''
                  })
                } else {
                  // Otherwise use the create action
                  executeCreate({
                    ...submissionData,
                    branch: submissionData.branch || '',
                    accountOfficer: submissionData.accountOfficer || '',
                    desiredAccount: submissionData.desiredAccount || ''
                  })
                }
              }}
              className="text-amber-600 border-amber-600 hover:bg-amber-50"
            >
              Submit Anyway
            </Button>
            <Button 
              onClick={() => {
                setShowMissingFieldsDialog(false)
                handleMakeChanges()
              }}
              className="text-white"
            >
              Complete Information
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Error Dialog */}
      <Dialog 
        open={showErrorDialog.message !== ""} 
        onOpenChange={(open) => {
          if (!open) setShowErrorDialog({ message: "", details: [], fields: [], rawError: undefined });
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Failed to update customer
            </DialogTitle>
            <DialogDescription>
              Please review your information and try again
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {/* Dynamically render all grouped error fields */}
            {Object.keys(groupedErrorFields).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedErrorFields).map(([section, fields]) => (
                  <div key={section} className="space-y-2">
                    <h4 className="font-medium text-lg">{section}</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {fields.map((field, idx) => (
                        <div key={idx} className="flex items-start p-3 rounded-md border">
                          <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-1" />
                          <div>
                            <span className="text-sm font-medium text-foreground/70">{field.label}</span>
                            <p className="text-xs text-muted-foreground mt-1">{field.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : showErrorDialog.details.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-start p-3 rounded-md border">
                  <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-foreground/70">Validation Errors</span>
                    <div className="mt-2 space-y-1">
                      {showErrorDialog.details.map((detail, i) => (
                        <p key={i} className="text-xs text-red-600">• {detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start p-3 rounded-md border">
                  <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-800">
                    {showErrorDialog.message || "An unknown error occurred. Please try again."}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              onClick={() => {
                setShowErrorDialog({ message: "", details: [], fields: [], rawError: undefined });
                
                // If in edit mode, retry the edit action
                if (isEditMode && customerId && formData) {
                  // Validate required fields
                  if (!formData.branch || !formData.accountOfficer || !formData.desiredAccount) {
                    toast.error("Missing required fields: Branch, Account Officer, or Desired Account")
                    return
                  }

                  // Create submission data with validated required fields
                  const submissionData: {
                    branch: string;
                    accountOfficer: string;
                    desiredAccount: string;
                    customerId: string;
                    [key: string]: any;
                  } = {
                    branch: formData.branch,
                    accountOfficer: formData.accountOfficer,
                    desiredAccount: formData.desiredAccount,
                    customerId: String(customerId),
                    // ... rest of the fields same as above
                  };
                  
                  executeEdit(submissionData);
                }
              }}
              variant={"gooeyRight"}
              className="bg-transparent border text-white"
            >
              Retry
            </Button>
            <Button
              onClick={() => {
                setShowErrorDialog({ message: "", details: [], fields: [], rawError: undefined });
                handleMakeChanges();
              }}
              className="text-white bg-primary hover:bg-primary/80"
            >
              Make Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

