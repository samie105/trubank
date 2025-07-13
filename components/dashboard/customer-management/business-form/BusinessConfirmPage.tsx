/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { parseAsInteger, useQueryState } from "nuqs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useAction } from "next-safe-action/hooks"
import { createBusinessAction } from "@/server/customer-management/create-business"
import { editBusinessAction } from "@/server/customer-management/edit-business"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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

// Parse API error responses into usable format
const parseApiErrors = (error: any) => {
  // Initialize with default message
  let errorMessage = "Failed to update business";
  const errorDetails: string[] = [];
  const errorFields: {key: string, label: string, section: string, message?: string}[] = [];
  // Initialize rawError variable
  let rawError: any = error.data;
  
  try {
    // First, log the complete error object for debugging
    console.log("Raw API error:", error);
    console.log("Raw API error data:", error.data);
    
    // Map DesiredAccount to ProductType in the error response if needed
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
      errorMessage = "Failed to update business information";
      // Add common business fields that are likely required
      errorFields.push(
        {key: "busienssName", label: "Business Name", section: "Business Profile", message: "Required field"},
        {key: "BusinessAddress", label: "Business Address", section: "Business Profile", message: "Required field"},
        {key: "PhoneNumber", label: "Phone Number", section: "Business Profile", message: "Required field"}
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
    if (error.data?.errors) {
      console.log("Processing validation errors:", error.data.errors);
      
      Object.entries(error.data.errors).forEach(([fieldPath, messages]) => {
        // Handle array of error messages
        const messageList = Array.isArray(messages) ? messages : [messages];
        const messageText = messageList.join(', ');
        
        // Create detail string with field and message
        const detail = `${fieldPath}: ${messageText}`;
        errorDetails.push(detail);
        
        // Map field to a UI-friendly name and section
        const fieldName = fieldPath.split('.').pop() || fieldPath;
        const section = mapBusinessFieldToSection(fieldPath);
        
        errorFields.push({
          key: fieldName,
          label: formatFieldName(fieldName),
          section,
          message: messageText
        });
      });
    } else if (error.data?.validationErrors) {
      console.log("Processing alternative validation errors:", error.data.validationErrors);
      
      Object.entries(error.data.validationErrors).forEach(([field, msg]) => {
        const msgText = typeof msg === 'string' ? msg : JSON.stringify(msg);
        errorDetails.push(`${field}: ${msgText}`);
        
        errorFields.push({
          key: field,
          label: formatFieldName(field),
          section: mapBusinessFieldToSection(field),
          message: msgText
        });
      });
    } else if (error.data?.message) {
      errorDetails.push(error.data.message);
      
      // Try to extract field names from the message
      const fieldMatches = error.data.message.match(/field '([^']+)'/g) || [];
      fieldMatches.forEach((match: string) => {
        const fieldName = match.replace(/field '([^']+)'/, '$1');
        errorFields.push({
          key: fieldName,
          label: formatFieldName(fieldName),
          section: mapBusinessFieldToSection(fieldName),
          message: "This field requires attention"
        });
      });
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

// Format display values by replacing underscores with spaces
const formatDisplayValue = (value: string | undefined): string | undefined => {
  if (!value) return value;
  return value.replace(/_/g, " ");
};

// Format field name to be more readable
const formatFieldName = (fieldName: string): string => {
  return fieldName
    // Insert spaces before capital letters
    .replace(/([A-Z])/g, ' $1')
    // Handle special cases
    .replace(/ Id /g, ' ID ')
    .replace(/Busiensss/g, 'Business')
    .replace(/Busieness/g, 'Business')
    .replace(/Busienss/g, 'Business')
    // Trim and ensure first letter is capitalized
    .trim()
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());
};

// Map field name to appropriate section
const mapBusinessFieldToSection = (fieldPath: string): string => {
  const sectionMap: Record<string, string> = {
    "busienssName": "Business Profile",
    "busienssType": "Business Profile",
    "BusinessAddress": "Business Profile",
    "RegistrationNumber": "Business Profile",
    "TaxIdentificationNumber": "Business Profile",
    "PhoneNumber": "Business Profile",
    "EmailAddress": "Business Profile",
    "Website": "Business Profile",
    "NatureOfBusiness": "Business Profile",
    "BusinessIncorporationDocument": "Business Documents",
    "MemorandumOfAssociationDocument": "Business Documents",
    "BusinessLicenseDocument": "Business Documents",
    "ProofOfAddress": "Proof of Address",
    "BranchId": "Account Information",
    "AccountOfficerId": "Account Information",
    "DesiredAccount": "Account Information"
  };
  
  // Check if the field name starts with any of the section keys
  for (const [key, section] of Object.entries(sectionMap)) {
    if (fieldPath.startsWith(key)) {
      return section;
    }
  }
  
  return "General Information";
};

// Group error fields by section for display
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

type BusinessFormData = {
  // Business Profile Details
  businessName: string
  registrationNumber: string
  tin: string
  natureOfBusiness: string
  businessType: string
  businessAddress: string
  phoneNumber: string
  email: string
  website: string

  // Business Registration Documents
  businessIncorporationCertificate: string | null
  memorandumArticles: string | null
  businessLicense: string | null

  // Proof of Address
  utilityBillType: string
  utilityBillIssuer: string
  issueDateOfBill: string // Changed from Date to string for easier rendering
  utilityBill: string | null

  // Account Information (kept from previous version)
  branch: string
  branchId?: string
  desiredAccount: string
  accountOfficer: string
  accountOfficerId?: string
  type?: number
  // Display names for UI purposes
  branchName?: string
  accountOfficerName?: string
  desiredAccountName?: string
}

export default function BusinessConfirmationPage({
  isEditMode = false,
  customerId = "",
}: {
  isEditMode?: boolean
  customerId?: string
}) {
  const [, setStep] = useQueryState("step", parseAsInteger)
  const [data, setData] = useState<BusinessFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [showErrorDialog, setShowErrorDialog] = useState<{ 
    message: string, 
    details: string[], 
    fields: {key: string, label: string, section: string, message?: string}[],
    rawError?: any
  }>({ message: "", details: [], fields: [] });

  // Grouped error fields for easy rendering
  const groupedErrorFields = groupErrorFieldsBySection(showErrorDialog.fields);

  useEffect(() => {
    const savedData = localStorage.getItem("CustomerBusinessForm")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  // Action to handle logout
  const { execute: executeLogout } = useAction(logoutAction, {
    onSuccess() {
      router.push("/auth/login")
    },
  })

  // Handle logout
  const handleLogout = () => {
    executeLogout()
  }

  const { execute } = useAction(createBusinessAction, {
    onExecute() {
      setIsSubmitting(true)
      toast.loading("Submitting business application...", { id: "create-business" })
    },
    onSuccess(data) {
      toast.dismiss("create-business")
      if (data.data?.success) {
        toast.success(data.data.message || "Business registered successfully!")
        console.log("Business created successfully:", data.data)
        // Redirect to success page or dashboard with customer ID
        router.push(`/dashboard/customer-management?updated=true&id=${data.data.businessData?.id || ""}&type=business`)
      } else {
        console.error("Failed to register business:", data.data)

        // Check if it's an authentication error (401) or contains the authentication required message
        if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
          toast.error(
            <div className="flex items-center">
              <p>{data.data.error || "Your session has expired. Please log in again."}</p>
              <div className="flex justify-between mt-2">
                <Button size="sm" onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>
            </div>,
          )
        } else {
          // Show error dialog with validation errors
          const { errorMessage, errorDetails, errorFields, rawError } = parseApiErrors(data);
          setShowErrorDialog({ message: errorMessage, details: errorDetails, fields: errorFields, rawError });
          toast.dismiss("create-business");
        }

        setIsSubmitting(false)
      }
    },
    onError(error) {
      toast.dismiss("create-business")
      // Show error dialog with validation errors
      const { errorMessage, errorDetails, errorFields, rawError } = parseApiErrors(error);
      setShowErrorDialog({ message: errorMessage, details: errorDetails, fields: errorFields, rawError });
      setIsSubmitting(false)
    },
    onSettled() {
      toast.dismiss("create-business")
    },
  })

  // Add the edit business action
  const { execute: executeEdit } = useAction(editBusinessAction, {
    onExecute() {
      setIsSubmitting(true)
      toast.loading("Updating business information...", { id: "edit-business" })
    },
    onSuccess(data) {
      toast.dismiss("edit-business")
      if (data.data?.success) {
        toast.success(data.data.message || "Business information updated successfully!")
        console.log("Business updated successfully:", data.data)
        // Redirect to customer management page
        router.push(`/dashboard/customer-management?updated=true&id=${data.data.businessData?.id || ""}&type=business`)
      } else {
        console.error("Failed to update business:", data.data)

        // Check if it's an authentication error (401) or contains the authentication required message
        if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
          toast.error(
            <div className="flex items-center">
              <p>{data.data.error || "Your session has expired. Please log in again."}</p>
              <div className="flex justify-between mt-2">
                <Button size="sm" onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>
            </div>,
          )
        } else {
          // Show error dialog with validation errors
          const { errorMessage, errorDetails, errorFields, rawError } = parseApiErrors(data);
          setShowErrorDialog({ message: errorMessage, details: errorDetails, fields: errorFields, rawError });
          toast.dismiss("edit-business");
        }

        setIsSubmitting(false)
      }
    },
    onError(error) {
      toast.dismiss("edit-business")
      // Show error dialog with validation errors
      const { errorMessage, errorDetails, errorFields, rawError } = parseApiErrors(error);
      setShowErrorDialog({ message: errorMessage, details: errorDetails, fields: errorFields, rawError });
      setIsSubmitting(false)
    },
    onSettled() {
      toast.dismiss("edit-business")
    },
  })

  if (!data) {
    return <div>Loading...</div>
  }

  const handlePrevious = () => {
    setStep(1)
  }

  const handleCancel = () => {
    // Clear all form data from localStorage
    localStorage.removeItem("businessForm")
    localStorage.removeItem("CustomerBusinessForm")
    localStorage.removeItem("customer-business-form-storage")
    // Redirect to customer management dashboard
    router.push("/dashboard/customer-management")
  }

  const handleConfirmAndSubmit = () => {
    console.log("Form submitted:", data)

    // Validate required fields
    if (!data) {
      toast.error("Form data is missing")
      return
    }

    const requiredFields = [
      "businessName",
      "registrationNumber",
      "tin",
      "natureOfBusiness",
      "businessType",
      "businessAddress",
      "phoneNumber",
      "email",
      "utilityBillType",
      "utilityBillIssuer",
      "issueDateOfBill",
    ]

    const missingFields = requiredFields.filter((field) => {
      // Use type assertion to access data properties
      const value = data[field as keyof BusinessFormData]
      return !value
    })

    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(", ")}`)
      return
    }

    // Call the appropriate action based on isEditMode
    if (isEditMode) {
      // Call edit endpoint with customerId
      executeEdit({
        ...data,
        businessId: customerId,
      })
    } else {
      // Call create endpoint
      execute(data)
    }
  }

  const renderField = (label: string, value: string | undefined) => {
    if (!value) return null
    return (
      <div className="flex flex-col py-2">
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className="font-semibold pt-2">{formatDisplayValue(value)}</span>
      </div>
    )
  }

  const renderImage = (label: string, src: string | null, alt: string) => {
    if (!src) return null
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="font-medium text-muted-foreground">{label}</span>
        <Image src={src || "/placeholder.svg"} alt={alt} width={200} height={200} className="rounded-lg object-cover" />
      </div>
    )
  }

  return (
    <Card className="w-full border-none max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Confirm Business Details</CardTitle>
        <p className="text-muted-foreground">Please review your business information carefully before submitting</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-6 md:grid-cols-1">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Profile Details</h3>
              {renderField("Business Name", data.businessName)}
              {renderField("Registration Number", data.registrationNumber)}
              {renderField("TIN", data.tin)}
              {renderField("Nature of Business", data.natureOfBusiness)}
              {renderField("Business Type", data.businessType)}
              {renderField("Business Address", data.businessAddress)}
              {renderField("Phone Number", data.phoneNumber)}
              {renderField("Email", data.email)}
              {renderField("Website", data.website)}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Registration Documents</h3>
              {renderImage(
                "Business Incorporation Certificate",
                data.businessIncorporationCertificate,
                "Business Incorporation Certificate",
              )}
              {renderImage(
                "Memorandum and Articles of Association",
                data.memorandumArticles,
                "Memorandum and Articles of Association",
              )}
              {renderImage("Business License", data.businessLicense, "Business License")}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Proof of Address</h3>
              {renderField("Utility Bill Type", data.utilityBillType)}
              {renderField("Utility Bill Issuer", data.utilityBillIssuer)}
              {renderField("Issue Date of Bill", data.issueDateOfBill)}
              {renderImage("Utility Bill", data.utilityBill, "Utility Bill")}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              {renderField("Branch", data.branchName || data.branch)}
              {renderField("Desired Account Type", data.desiredAccountName || data.desiredAccount)}
              {renderField("Account Officer", data.accountOfficerName || data.accountOfficer)}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
            Make Changes
          </Button>
        </div>
        <Button onClick={handleConfirmAndSubmit} className="text-white" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : isEditMode ? "Confirm & Save Edit" : "Confirm & Submit"}
        </Button>
      </CardFooter>

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
              Failed to update business information
            </DialogTitle>
            <DialogDescription>
              Please review the information and try again
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
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
              }}
              variant="outline"
              className="text-white bg-transparent border"
            >
              Retry
            </Button>
            <Button
              onClick={() => {
                setShowErrorDialog({ message: "", details: [], fields: [], rawError: undefined });
                handlePrevious();
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

