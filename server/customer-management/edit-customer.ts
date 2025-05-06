"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for form validation - more flexible for edit mode
const customerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dob: z.string().or(z.date()).optional(),
  gender: z.string().optional(), // Allow any string instead of enum
  email: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  maritalStatus: z.string().optional(),
  alternatePhone: z.string().optional(),
  employmentStatus: z.string().optional(),
  occupation: z.string().optional(),
  tin: z.string().optional(),
  // Removed state field
  address: z.string().optional(),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  idDocument: z.string().nullable().optional(),
  expiryDate: z.string().or(z.date()).optional(),
  issuingAuthority: z.string().optional(),
  idType2: z.string().optional(),
  idNumber2: z.string().optional(),
  idDocument2: z.string().nullable().optional(),
  proofOfAddress: z.string().nullable().optional(),
  dateOfIssue: z.string().or(z.date()).optional(),
  addressProofType: z.string().optional(),
  issuingAuthorityPOA: z.string().optional(),
  profileImage: z.string().nullable().optional(),
  branch: z.string().optional(),
  accountOfficer: z.string().optional(),
  desiredAccount: z.string().optional(),
  employerAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  currentEmployerName: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  employmentDocument: z.string().nullable().optional(),
  guarantorFullName: z.string().optional(),
  guarantorRelationship: z.string().optional(),
  guarantorPhone: z.string().optional(),
  guarantorEmail: z.string().optional(),
  guarantorAddress: z.string().optional(),
  guarantorId: z.string().nullable().optional(),
  nextOfKinFullName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinEmail: z.string().optional(),
  nextOfKinAddress: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  // Only customerId is required
  customerId: z.string().min(1, "Customer ID is required"),
  // Add alert preferences
  requireSmsAlert: z.boolean().default(false),
  requireEmailAlert: z.boolean().default(false),
})

export type EditCustomerFormData = z.infer<typeof customerSchema>

// Helper functions with more flexible handling
function mapIdTypeToNumber(idType: string | undefined): number {
  if (!idType) return 1; // Default to the first type if undefined

  const idTypeMap: Record<string, number> = {
    // Add mappings from types.d.ts format
    "Driver_Licence": 3,
    "International_Passport": 2,
    "Voters_Card": 4,
    "NationalIdentityCard": 4,
    "BVN": 5,
    "Nin": 1,
    // Original mappings
    "National ID": 1,
    Passport: 2,
    "Driver's License": 3,
    "Voter's Card": 4,
    "DriverLicense": 3,
    "InternationalPassport": 2,
    "VotersCard": 4,
    Other: 6,
  }
  return idTypeMap[idType] || 1
}

function mapProofTypeToNumber(proofType: string | undefined): number {
  if (!proofType) return 1; // Default to the first type if undefined
  
  const proofTypeMap: Record<string, number> = {
    // Add mappings from types.d.ts format
    "Utility_Bill": 1,
    "Water_Bill": 2,
    // Original mappings
    "Utility Bill": 1,
    "Bank Statement": 2,
    "Tax Receipt": 3,
    "UtilityBill": 1,
    "WaterBill": 2,
    "BankStatement": 2,
    "LeaseAgreement": 3,
    Other: 4,
  }
  return proofTypeMap[proofType] || 1
}

// Function to debug FormData contents
function debugFormData(formData: FormData) {
  console.log("===== DEBUG FORM DATA CONTENTS =====");
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }
  console.log("===== END FORM DATA CONTENTS =====");
}

/**
 * Edit Individual Customer Action
 * 
 * IMPORTANT: For the best edit experience, the component should:
 * 1. Load the full customer data on edit page load
 * 2. Store this data in localStorage
 * 3. As user makes edits, update only the edited fields in localStorage
 * 4. When submitting, send the complete data object from localStorage
 * 
 * This approach ensures we always have complete data with original values for 
 * fields the user didn't edit, especially for required fields.
 */
export const editCustomerAction = actionClient.schema(customerSchema).action(async ({ parsedInput }) => {
  console.log("Editing individual customer with data:", parsedInput)

  try {
    // Get the auth token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
        statusCode: 401,
      }
    }

    console.log("Using access token:", accessToken.substring(0, 10) + "...")

    // Set API endpoint for individual customer
    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    const apiEndpointBase = `${apiUrl}/customermanagement/edit-individual`
    
    // Create FormData
    const formData = new FormData()

    // Add the customer ID for the update
    formData.append("id", parsedInput.customerId);
    
    // Use values directly from parsedInput
    formData.append("Type", "1"); // Individual customer type
    formData.append("Branch", parsedInput.branch || "");
    formData.append("AccountOfficer", parsedInput.accountOfficer || "");
    formData.append("DesiredAccount", parsedInput.desiredAccount || "");
    
    // Add alert preferences
    formData.append("RequireSmsAlert", String(parsedInput.requireSmsAlert || false));
    formData.append("RequireEmailAlert", String(parsedInput.requireEmailAlert || false));
    
    // Continue with the rest of the form data
    formData.append("MeansOfIdentity.IdType", String(parsedInput.idType ? mapIdTypeToNumber(parsedInput.idType) : 1));
    formData.append("MeansOfIdentity.IdNumber", parsedInput.idNumber || "");
    formData.append("MeansOfIdentity.IdIssuingAuthority", parsedInput.issuingAuthority || "");
    formData.append(
      "MeansOfIdentity.IdExpiryDate",
      parsedInput.expiryDate instanceof Date
        ? parsedInput.expiryDate.toISOString()
        : parsedInput.expiryDate || new Date().toISOString(),
    );
    formData.append("MeansOfIdentity.IdFile", parsedInput.idDocument || "");
    
    // Add personalInformations fields
    formData.append("PersonalInformations.FirstName", parsedInput.firstName || "");
    formData.append("PersonalInformations.MiddleName", "");
    formData.append("PersonalInformations.LastName", parsedInput.lastName || "");
    formData.append("PersonalInformations.Gender", parsedInput.gender || "");
    formData.append(
      "PersonalInformations.DateOfBirth",
      parsedInput.dob instanceof Date ? parsedInput.dob.toISOString() : parsedInput.dob || new Date().toISOString(),
    );
    formData.append("PersonalInformations.MaritalStatus", parsedInput.maritalStatus || "");
    formData.append("PersonalInformations.Nationality", parsedInput.country || "");
    formData.append("PersonalInformations.ResidentialAddress", parsedInput.address || "");
    formData.append("PersonalInformations.EmailAddress", parsedInput.email || "");
    formData.append("PersonalInformations.PhoneNumber", parsedInput.phone || "");
    formData.append("PersonalInformations.AlternatePhoneNumber", parsedInput.alternatePhone || "");
    formData.append("PersonalInformations.EmploymentStatus", parsedInput.employmentStatus || "");
    formData.append("PersonalInformations.TaxIdenttfictionNumber", parsedInput.tin || "");
    
    // Add proofOfAddress fields
    formData.append(
      "ProofOfAddress.ProofOfAddressType",
      String(parsedInput.addressProofType ? mapProofTypeToNumber(parsedInput.addressProofType) : 1),
    );
    formData.append("ProofOfAddress.ProofOfAddressIssuingAuthority", parsedInput.issuingAuthorityPOA || "");
    formData.append(
      "ProofOfAddress.ProofOfAddressDateIssue",
      parsedInput.dateOfIssue instanceof Date
        ? parsedInput.dateOfIssue.toISOString()
        : parsedInput.dateOfIssue || new Date().toISOString(),
    );
    formData.append("ProofOfAddress.ProofOfAddressFile", parsedInput.proofOfAddress || "");
    
    // Add employmentDetails fields
    formData.append("EmploymentDetails.CurrentEmployerName", parsedInput.currentEmployerName || "");
    formData.append("EmploymentDetails.EmployerAddress", parsedInput.employerAddress || "");
    formData.append("EmploymentDetails.JobTitle", parsedInput.jobTitle || "");
    formData.append(
      "EmploymentDetails.EmployementStateDate",
      parsedInput.startDate instanceof Date
        ? parsedInput.startDate.toISOString()
        : parsedInput.startDate || new Date().toISOString(),
    );
    formData.append(
      "EmploymentDetails.EmployementEndDate",
      parsedInput.endDate instanceof Date
        ? parsedInput.endDate.toISOString()
        : parsedInput.endDate || new Date().toISOString(),
    );
    formData.append("EmploymentDetails.EmploymentVerificationDocument", parsedInput.employmentDocument || "");
    
    // Add guarantorDetails fields
    formData.append("GuarantorDetails.GuarantorFullName", parsedInput.guarantorFullName || "");
    formData.append("GuarantorDetails.GuarantorRelationshipToCustomer", parsedInput.guarantorRelationship || "");
    formData.append("GuarantorDetails.GuarantorPhoneNumber", parsedInput.guarantorPhone || "");
    formData.append("GuarantorDetails.GuarantorEmailAddress", parsedInput.guarantorEmail || "");
    formData.append("GuarantorDetails.GuarantorAddress", parsedInput.guarantorAddress || "");
    formData.append("GuarantorDetails.GuarantorIdFile", parsedInput.guarantorId || "");
    
    // Add nxtOfKinDetails fields
    formData.append("NxtOfKinDetails.NextOfKinFullName", parsedInput.nextOfKinFullName || "");
    formData.append("NxtOfKinDetails.NextOfKinRelationshipToCustomer", parsedInput.nextOfKinRelationship || "");
    formData.append("NxtOfKinDetails.NextOfKinPhoneNumber", parsedInput.nextOfKinPhone || "");
    formData.append("NxtOfKinDetails.NextOfKinEmailAddress", parsedInput.nextOfKinEmail || "");
    formData.append("NxtOfKinDetails.NextOfKinAddress", parsedInput.nextOfKinAddress || "");
    
    // Add profilePicture
    formData.append("ProfilePicture", parsedInput.profileImage || "");
    
    // Debug the FormData contents before sending
    debugFormData(formData);
    
    // Make the API call for individual update using formData
    const updateResponse = await fetch(apiEndpointBase, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
    
    // Process the response
    return processApiResponse(updateResponse);
  } catch (error) {
    console.error("Error updating customer:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
});

// Helper function to process API responses consistently
async function processApiResponse(response: Response) {
  // Log detailed response info for debugging
  console.log(`API response status: ${response.status}`);
  console.log(`API response headers:`, Object.fromEntries([...response.headers.entries()]));
  
  // Handle specific status codes
  if (response.status === 401) {
    console.error("Authentication failed: Token is invalid or expired");
    return {
      success: false,
      error: "Your session has expired. Please log in again.",
      statusCode: 401,
    };
  }
  
  if (response.status === 403) {
    console.error("Authorization failed: Insufficient permissions");
    return {
      success: false,
      error: "You don't have permission to perform this action.",
      statusCode: 403,
    };
  }
  
  try {
    const text = await response.text();
    console.log(`API response body (first 200 chars): ${text.substring(0, 200)}${text.length > 200 ? "..." : ""}`);
    
    try {
      const data = text ? JSON.parse(text) : {};
      console.log(`API parsed JSON response:`, JSON.stringify(data, null, 2));
      
      // Check if the request was successful
      if (data.isSuccess && (data.statCode === 200 || data.statCode === 201 || data.statCode === 204)) {
        return {
          success: true,
          message: data.message || "Customer updated successfully",
          customerId: data.customerId || data.userId || data.id,
          customerData: data.result,
        };
      } else {
        // Handle error cases with more detailed information
        return {
          success: false,
          error: data.error || data.message || `Failed to update customer (Status: ${response.status})`,
          statusCode: data.statCode || response.status,
          details: data.errors || data.validationErrors || null,
        };
      }
    } catch (parseError) {
      console.error(`Error parsing response as JSON:`, parseError);
      console.error(`Raw response was:`, text);
      return {
        success: false,
        error: `Failed to parse server response. Raw response: ${text.substring(0, 200)}${text.length > 200 ? "..." : ""}`,
        statusCode: response.status,
      };
    }
  } catch (error) {
    console.error(`Error reading response:`, error);
    // Handle the unknown error type properly
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Failed to read server response: ${errorMessage}`,
      statusCode: response.status,
    };
  }
}

