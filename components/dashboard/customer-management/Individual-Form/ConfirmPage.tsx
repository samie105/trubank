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

// Parse API error responses into usable format
const parseApiErrors = (error: any) => {
  // Initialize with default message
  let errorMessage = "Failed to update customer";
  const errorDetails: string[] = [];
  const errorFields: {key: string, label: string, section: string, message?: string}[] = [];
  // Initialize rawError variable
  let rawError: any = error.data;
  
  try {
    // First, log the complete error object for debugging
    console.log("Raw API error:", error);
    console.log("Raw API error data:", error.data);
    
    // Map DesiredAccount to ProductType in the error response
    if (error?.data?.errors?.DesiredAccount) {
      console.log("Mapping DesiredAccount error to ProductType");
      error.data.errors.ProductType = error.data.errors.DesiredAccount;
      delete error.data.errors.DesiredAccount;
    }

    // Keep the original error data for dynamic display
    rawError = error.data;
    
    // Check for empty object response - a common error pattern
    if (error.data && typeof error.data === 'object' && Object.keys(error.data).length === 0) {
      console.log("Empty object response detected");
      errorMessage = "Failed to update customer";
      // Add employment fields as these are commonly required
      errorFields.push(
        {key: "CurrentEmployerName", label: "Current Employer Name", section: "Employment Information", message: "Required for employment details"},
        {key: "EmployerAddress", label: "Employer Address", section: "Employment Information", message: "Required for employment details"},
        {key: "JobTitle", label: "Job Title", section: "Employment Information", message: "Required for employment details"}
      );
      
      // Return early with these default fields
      return { errorMessage, errorDetails, errorFields, rawError };
    }
    
    if (error.data) {
      console.log("Raw API error data stringified:", JSON.stringify(error.data, null, 2));
    }
    
    // Extract the main error message from various possible locations
    if (error.data?.title) {
      errorMessage = error.data.title;
    } else if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (error.error?.serverError) {
      errorMessage = error.error.serverError;
    } else if (typeof error.data === 'string') {
      // Sometimes the error might be a direct string
      errorMessage = error.data;
      
      // Try to parse the error string as JSON in case it's a stringified object
      try {
        const parsedError = JSON.parse(error.data);
        if (parsedError.errors || parsedError.validationErrors) {
          error.data = parsedError; // Replace with parsed object for further processing
          errorMessage = parsedError.title || parsedError.error || "Validation error";
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Not valid JSON, keep as is
      }
    }
    
    // If there's a status code, include it
    const errorStatus = error.data?.statusCode || (error.data as any)?.status;
    if (errorStatus) {
      errorMessage = `Error ${errorStatus}: ${errorMessage}`;
    }
    
    // Try multiple approaches to extract validation errors
    
    // 1. Standard errors object with nested format
    if (error.data?.errors) {
      console.log("Processing validation errors:", error.data.errors);
      
      Object.entries(error.data.errors).forEach(([fieldPath, messages]) => {
        // Handle array of error messages
        const messageList = Array.isArray(messages) ? messages : [messages];
        const messageText = messageList.join(', ');
        
        // Create detail string with field and message
        const detail = `${fieldPath}: ${messageText}`;
        errorDetails.push(detail);
        
        // Split nested fields (e.g., "EmploymentDetails.JobTitle" → ["EmploymentDetails", "JobTitle"])
        const pathParts = fieldPath.split('.');
        
        // Extract actual field name (last part of the path)
        const fieldName = pathParts[pathParts.length - 1];
        
        // Get section from first part of path or use default section mapping
        let section = "";
        
        if (pathParts.length > 1) {
          // Map section from the first part of the path
          const sectionName = pathParts[0];
          section = mapSectionName(sectionName);
        }
        
        // Add to error fields list with proper section
        const mappedField = mapErrorFieldToUIField(fieldName, section, messageText);
        if (mappedField) {
          errorFields.push(mappedField);
        }
      });
    } 
    // 2. Alternative validationErrors format
    else if (error.data?.validationErrors) {
      console.log("Processing alternative validation errors:", error.data.validationErrors);
      
      Object.entries(error.data.validationErrors).forEach(([field, msg]) => {
        const msgText = typeof msg === 'string' ? msg : JSON.stringify(msg);
        errorDetails.push(`${field}: ${msgText}`);
        
        const mappedField = mapErrorFieldToUIField(field, undefined, msgText);
        if (mappedField) {
          errorFields.push(mappedField);
        }
      });
    } 
    // 3. Try to parse error message directly
    else if (error.data?.message) {
      errorDetails.push(error.data.message);
      
      // Try to extract field names from the message
      const fieldMatches = error.data.message.match(/field '([^']+)'/g) || [];
      fieldMatches.forEach((match: string) => {
        const fieldName = match.replace(/field '([^']+)'/, '$1');
        const mappedField = mapErrorFieldToUIField(fieldName);
        if (mappedField) {
          errorFields.push(mappedField);
        }
      });
      
      // Try to parse the message as JSON in case it contains stringified error objects
      try {
        const parsedMessage = JSON.parse(error.data.message);
        if (parsedMessage.errors || parsedMessage.validationErrors) {
          // Recursively process the parsed error object
          const nestedResult = parseApiErrors({ data: parsedMessage });
          errorDetails.push(...nestedResult.errorDetails);
          errorFields.push(...nestedResult.errorFields);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Not valid JSON, continue with other strategies
      }
    }
    
    // Check if error message contains a JSON string to parse
    if (errorFields.length === 0 && typeof errorMessage === 'string') {
      // Look for JSON-like patterns in the error message
      // Using separate match calls for compatibility instead of /s flag
      const jsonMatch = errorMessage.match(/\{[\s\S]*\}/) || errorMessage.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const possibleJson = jsonMatch[0];
          const parsedJson = JSON.parse(possibleJson);
          
          // If it's a valid object with errors, process it
          if (parsedJson.errors || parsedJson.validationErrors) {
            const nestedResult = parseApiErrors({ data: parsedJson });
            errorDetails.push(...nestedResult.errorDetails);
            errorFields.push(...nestedResult.errorFields);
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          // Not valid JSON
        }
      }
    }
    
    // For specific error patterns, extract information
    if (errorFields.length === 0) {
      // Extract specific fields mentioned in error message
      const fieldPatterns = [
        { regex: /employment/i, section: "Employment Information", fields: ["Current Employer Name", "Employer Address", "Job Title"] },
        { regex: /name/i, section: "Personal Information", fields: ["First Name", "Last Name"] },
        { regex: /email/i, section: "Personal Information", fields: ["Email"] },
        { regex: /phone/i, section: "Personal Information", fields: ["Phone Number"] },
        { regex: /address/i, section: "Address", fields: ["Address"] },
        { regex: /id/i, section: "Identification", fields: ["ID Type", "ID Number"] }
      ];
      
      // Check each pattern against the error message
      for (const pattern of fieldPatterns) {
        if (pattern.regex.test(errorMessage)) {
          pattern.fields.forEach(field => {
            errorFields.push({
              key: field.replace(/\s/g, ''),
              label: field,
              section: pattern.section,
              message: "This field may need to be updated"
            });
          });
        }
      }
    }
    
    // Default fallback for status 400 errors
    const status = error.data?.statusCode || (error.data as any)?.status;
    if (errorFields.length === 0 && status === 400) {
      // Default to showing the most common required fields
      errorFields.push(
        {key: "CurrentEmployerName", label: "Current Employer Name", section: "Employment Information", message: "Required for employment details"},
        {key: "EmployerAddress", label: "Employer Address", section: "Employment Information", message: "Required for employment details"},
        {key: "JobTitle", label: "Job Title", section: "Employment Information", message: "Required for employment details"}
      );
    }

    // If we still have no fields, add a general error field
    if (errorFields.length === 0) {
      errorFields.push({
        key: "general",
        label: "Form Data",
        section: "General Information",
        message: errorMessage
      });
    }

    // Log the processed error for debugging
    console.log("Processed error:", {
      message: errorMessage,
      details: errorDetails,
      fields: errorFields
    });
  } catch (e) {
    console.error("Error parsing API error response:", e);
    // Add a fallback error field
    errorFields.push({
      key: "general",
      label: "Form Data",
      section: "General Information",
      message: "An unexpected error occurred"
    });
  }
  
  return { errorMessage, errorDetails, errorFields, rawError };
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

// Map common section names to proper UI sections
const mapSectionName = (sectionName: string): string => {
  const sectionMap: Record<string, string> = {
    "EmploymentDetails": "Employment Information",
    "PersonalDetails": "Personal Information",
    "IdentificationDetails": "Identification",
    "AddressDetails": "Address",
    "GuarantorDetails": "Guarantor & Next of Kin Information",
    "NextOfKinDetails": "Guarantor & Next of Kin Information",
    "AccountDetails": "Account Information",
    "ProofOfAddress": "Proof of Address"
  };

  // Get the mapped section or create a proper section name from the input
  return sectionMap[sectionName] || formatFieldName(sectionName);
};

// Map API error field names to UI field names with sections
const mapErrorFieldToUIField = (fieldName: string, sectionOverride?: string, errorMessage?: string) => {
  const fieldMap: Record<string, {label: string, section: string}> = {
    // Personal Information fields
    "FirstName": { label: "First Name", section: "Personal Information" },
    "LastName": { label: "Last Name", section: "Personal Information" },
    "MiddleName": { label: "Middle Name", section: "Personal Information" },
    "DateOfBirth": { label: "Date of Birth", section: "Personal Information" },
    "Dob": { label: "Date of Birth", section: "Personal Information" },
    "Gender": { label: "Gender", section: "Personal Information" },
    "Email": { label: "Email", section: "Personal Information" },
    "EmailAddress": { label: "Email", section: "Personal Information" },
    "Phone": { label: "Phone Number", section: "Personal Information" },
    "PhoneNumber": { label: "Phone Number", section: "Personal Information" },
    "MaritalStatus": { label: "Marital Status", section: "Personal Information" },
    "AlternatePhone": { label: "Alternate Phone", section: "Personal Information" },
    "AlternatePhoneNumber": { label: "Alternate Phone", section: "Personal Information" },
    "EmploymentStatus": { label: "Employment Status", section: "Personal Information" },
    "Tin": { label: "Tax Identification Number", section: "Personal Information" },
    "TaxIdenttfictionNumber": { label: "Tax Identification Number", section: "Personal Information" },
    
    // Address fields
    "Country": { label: "Country", section: "Address" },
    "Nationality": { label: "Country", section: "Address" },
    "Address": { label: "Address", section: "Address" },
    "ResidentialAddress": { label: "Address", section: "Address" },
    
    // Identification fields
    "IdType": { label: "ID Type", section: "Identification" },
    "IdNumber": { label: "ID Number", section: "Identification" },
    "ExpiryDate": { label: "Expiry Date", section: "Identification" },
    "IdExpiryDate": { label: "Expiry Date", section: "Identification" },
    "IssuingAuthority": { label: "Issuing Authority", section: "Identification" },
    "IdIssuingAuthority": { label: "Issuing Authority", section: "Identification" },
    "IdDocument": { label: "ID Document", section: "Identification" },
    "MeansOfIdentification": { label: "ID Document", section: "Identification" },
    
    // Proof of Address fields
    "AddressProofType": { label: "Type of Address Proof", section: "Proof of Address" },
    "ProofOfAddressType": { label: "Type of Address Proof", section: "Proof of Address" },
    "IssuingAuthorityPOA": { label: "Issuing Authority", section: "Proof of Address" },
    "ProofOfAddressIssuingAuthority": { label: "Issuing Authority", section: "Proof of Address" },
    "DateOfIssue": { label: "Date of Issue", section: "Proof of Address" },
    "ProofOfAddressDateIssue": { label: "Date of Issue", section: "Proof of Address" },
    "ProofOfAddress": { label: "Proof of Address Document", section: "Proof of Address" },
    
    // Employment fields
    "CurrentEmployerName": { label: "Current Employer Name", section: "Employment Information" },
    "EmployerName": { label: "Current Employer Name", section: "Employment Information" },
    "EmployerAddress": { label: "Employer Address", section: "Employment Information" },
    "JobTitle": { label: "Job Title", section: "Employment Information" },
    "StartDate": { label: "Start Date", section: "Employment Information" },
    "EmployementStateDate": { label: "Start Date", section: "Employment Information" },
    "EndDate": { label: "End Date", section: "Employment Information" },
    "EmployementEndDate": { label: "End Date", section: "Employment Information" },
    "EmploymentDocument": { label: "Employment Document", section: "Employment Information" },
    "EmploymentVerificationDocument": { label: "Employment Document", section: "Employment Information" },
    
    // Account Info fields
    "Branch": { label: "Branch", section: "Account Information" },
    "BranchId": { label: "Branch", section: "Account Information" },
    "AccountOfficer": { label: "Account Officer", section: "Account Information" },
    "AccountOfficerId": { label: "Account Officer", section: "Account Information" },
    // "ProductType": { label: "Product Type", section: "Account Information" },
    "ProfileImage": { label: "Profile Image", section: "Account Information" },
    "ProfilePicture": { label: "Profile Image", section: "Account Information" },
    "DesiredAccount": { label: "Product Type", section: "Account Information" }
  };
  
  // Normalize the field name by removing prefixes and converting to proper case
  // Examples: "customer.firstName" → "FirstName", "employment_details.job_title" → "JobTitle"
  const normalizedFieldName = fieldName
    .replace(/^(customer\.|user\.|data\.|employment_details\.|employment\.|identity\.)/, '')
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) // Convert snake_case to camelCase
    .replace(/^[a-z]/, char => char.toUpperCase()); // Capitalize first letter
  
  if (fieldMap[normalizedFieldName]) {
    // If a section was provided, use that instead of the mapped section
    const section = sectionOverride || fieldMap[normalizedFieldName].section;
    
    return {
      key: normalizedFieldName,
      label: fieldMap[normalizedFieldName].label,
      section: section,
      message: errorMessage || "This field requires attention"
    };
  }
  
  // If we can't find a mapping, create one based on field name format
  return {
    key: normalizedFieldName,
    label: formatFieldName(normalizedFieldName), 
    section: sectionOverride || "General Information",
    message: errorMessage || "This field requires attention"
  };
};

// Group error fields by section, similar to missing fields grouping
const groupErrorFieldsBySection = (errorFields: {key: string, label: string, section: string, message?: string}[]) => {
  const grouped: Record<string, {label: string, message?: string}[]> = {};
  
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
    fields: {key: string, label: string, section: string, message?: string}[],
    rawError?: any
  }>({ message: "", details: [], fields: [] });

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

    // Create a copy of formData with the correct types for submission
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
      // IMPORTANT NOTE FOR CUSTOMER EDIT:
      // This approach sends the formData from the form context which contains only
      // the fields the user has edited. For better reliability:
      // 1. When the edit page loads, fetch the complete customer data
      // 2. Store this full data in localStorage with all fields
      // 3. As user edits fields, update only those fields in the localStorage data
      // 4. On submit, use the complete data from localStorage instead of just edited fields
      // 
      // This ensures all required fields are present, especially:
      // - Branch
      // - AccountOfficer
      // - DesiredAccount
      executeEdit({
        ...submissionData,
        customerId: customerId,
      })
    } else {
      // Otherwise use the create action
      executeCreate(submissionData as any)
    }
  }

  const handleMissingFieldsClick = () => {
    setShowMissingFieldsDialog(true)
  }

  const renderField = (label: string, value: string | undefined) => {
    if (!value) return null
    return (
      <div className="flex flex-col py-2">
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className="font-semibold pt-2">{value}</span>
      </div>
    )
  }

  const renderDate = (label: string, value: Date | string | undefined) => {
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
                  {renderField("Country", formData.country)}
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
                  {renderField("Branch", formData.branch)}
                  {renderField("Account Officer", formData.accountOfficer)}
                  {renderField("Product Type", formData.desiredAccount)}
                  {renderImage("Profile Image", formData.profileImage, "Profile")}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleMakeChanges} disabled={isSubmitting}>
          Make Changes
        </Button>
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
            
                // Submit anyway
                if (isEditMode && customerId) {
                  executeEdit({
                    ...submissionData,
                    customerId: customerId,
                  })
                } else {
                  executeCreate(submissionData as any)
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
            {/* Product Type Error Section - Show this when ProductType error exists */}
            {showErrorDialog.rawError?.errors?.ProductType && (
              <div className="space-y-6 mb-4">
                <h4 className="font-medium text-lg">Account Information</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-start p-3 rounded-md bg-red-50 border border-red-200">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-sm font-medium text-red-800">Product Type</span>
                      <p className="text-xs text-red-600 mt-1">This field is required</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Raw Error Display Section - Shows direct API response */}
            {showErrorDialog.details.length > 0 && showErrorDialog.details.some(detail => detail.includes("EmploymentDetails")) && (
              <div className="space-y-6">
                <h4 className="font-medium text-lg">Employment Information</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-start p-3 rounded-md  border">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-sm font-medium text-foreground/70">Current Employer Name</span>
                      <p className="text-xs text-muted-foreground mt-1">This field is required</p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 rounded-md  border">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-sm font-medium text-foreground/70">Employer Address</span>
                      <p className="text-xs text-muted-foreground mt-1">This field is required</p>
                    </div>
                  </div>
                  <div className="flex items-start p-3 rounded-md  border">
                    <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-1" />
                    <div>
                      <span className="text-sm font-medium text-foreground/70">Job Title</span>
                      <p className="text-xs text-muted-foreground mt-1">This field is required</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Processed Fields Display */}
            {showErrorDialog.fields && showErrorDialog.fields.length > 0 && !showErrorDialog.details.some(detail => detail.includes("EmploymentDetails")) && (
              <div className="space-y-6">
                {Object.entries(groupErrorFieldsBySection(showErrorDialog.fields)).map(([section, fields]) => (
                  <div key={section} className="space-y-2">
                    <h4 className="font-medium text-lg">{section}</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {fields.map((field: {label: string, message?: string}, i: number) => (
                        <div key={i} className="flex items-start p-3 rounded-md  border">
                          <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-1" />
                          <div>
                            <span className="text-sm font-medium text-foreground/70">{field.label}</span>
                            {showErrorDialog.details.filter(detail => 
                              detail.toLowerCase().includes(field.label.toLowerCase()) || 
                              detail.toLowerCase().includes(field.label.replace(' ', '').toLowerCase())
                            ).map((detail, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground mt-1">
                                {/* Extract just the message part after the colon */}
                                {detail.includes(':') ? detail.split(':')[1].trim() : detail}
                              </p>
                            ))}
                            {field.message && (
                              <p className="text-xs text-muted-foreground mt-1">{field.message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Fallback for no fields but has details */}
            {showErrorDialog.fields.length === 0 && showErrorDialog.details.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-start p-3 rounded-md  border">
                  <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium text-foreground/70">Please review the information</span>
                    <div className="mt-2 space-y-1">
                      {showErrorDialog.details.map((detail, i) => (
                        <p key={i} className="text-xs text-red-600">• {detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Fallback for no details */}
            {showErrorDialog.fields.length === 0 && showErrorDialog.details.length === 0 && (
              <div className="space-y-4">
                <div className="flex items-start p-3 rounded-md  border">
                  <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-800">
                    Failed to update customer. Please check the form information and try again.
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
                  // Create a copy of formData with the correct types for submission
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
                  };
                  
                  executeEdit({
                    ...submissionData,
                    customerId: customerId,
                  });
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

