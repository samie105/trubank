"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for form validation
const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.string().or(z.date()),
  gender: z.string(), // Remove enum restriction to allow any string
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  alternatePhone: z.string().optional(),
  employmentStatus: z.string().optional(),
  occupation: z.string().optional(),
  tin: z.string().min(1, "TIN is required"),
  address: z.string().min(1, "Address is required"),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  idDocument: z.string().nullable().optional(),
  expiryDate: z.string().or(z.date()),
  issuingAuthority: z.string().min(1, "Issuing authority is required"),
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
  employerAddress: z.string().min(1, "Employer address is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  employmentDocument: z.string().nullable().optional(),
  currentEmployerName: z.string().min(1, "Current Employers name is required"),
  guarantorFullName: z.string().min(1, "Guarantor full name is required"),
  guarantorRelationship: z.string().min(1, "Guarantor relationship is required"),
  guarantorPhone: z.string().min(1, "Guarantor phone is required"),
  guarantorEmail: z.string().email("Invalid guarantor email"),
  guarantorAddress: z.string().min(1, "Guarantor address is required"),
  guarantorId: z.string().nullable().optional(),
  nextOfKinFullName: z.string().min(1, "Next of kin full name is required"),
  nextOfKinPhone: z.string().min(1, "Next of kin phone is required"),
  nextOfKinEmail: z.string().email("Invalid next of kin email"),
  nextOfKinAddress: z.string().min(1, "Next of kin address is required"),
  nextOfKinRelationship: z.string().min(1, "Next of kin relationship is required"),
  requireSmsAlert: z.boolean().default(false),
  requireEmailAlert: z.boolean().default(false),
  productType: z.string().optional(),
})

export type CustomerFormData = z.infer<typeof customerSchema>

// Helper function to extract customer ID from success message
function extractCustomerId(message: string): string {
  const match = message.match(/customer Id (\w+)/i)
  return match ? match[1] : ""
}

// Helper function to map ID types to numeric values
function mapIdTypeToNumber(idType: string | undefined): number {
  if (!idType) return 1; // Default to the first type if undefined
  
  const idTypeMap: Record<string, number> = {
    "DriverLicense": 1,
    "InternationalPassport": 2,
    "VotersCard": 3,
    "NationalIdentityCard": 4,
    "BVN": 5,
    "National ID": 4,
    "Passport": 2,
    "Driver's License": 1,
    "Voter's Card": 3,
    "Cac": 6,
    "BusinessIncorporationCertificate": 7,
    "MemorandumArticlesAssociation": 8,
    "BusinessLicense": 9,
    "ProfilePicture": 10,
    "UtilityBill": 11,
    "WaterBill": 12,
    "GuarantorIdentity": 13,
    "EmploymentProof": 14,
    "BankStatement": 15,
    "LeaseAgreement": 16
  }
  return idTypeMap[idType] || 1
}

// Helper function to map proof of address types to numeric values
function mapProofTypeToNumber(proofType: string | undefined): number {
  if (!proofType) return 11; // Default to UtilityBill if undefined
  
  const proofTypeMap: Record<string, number> = {
    "UtilityBill": 11,
    "WaterBill": 12,
    "BankStatement": 15,
    "LeaseAgreement": 16,
    "Utility Bill": 11,
    "Water Bill": 12,
    "Bank Statement": 15,
    "Lease Agreement": 16
  }
  return proofTypeMap[proofType] || 11
}

// Update the createCustomerAction function to use multipart/form-data

export const createCustomerAction = actionClient.schema(customerSchema).action(async ({ parsedInput }) => {
  console.log("Creating customer with data:", parsedInput)

  try {
    // Get the auth token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      }
    }

    console.log("Using access token:", accessToken.substring(0, 10) + "...")

    // Create FormData instead of JSON
    const formData = new FormData()

    // Add basic fields
    formData.append("Type", "1")
    formData.append("Branch", parsedInput.branch || "")
    formData.append("AccountOfficer", parsedInput.accountOfficer || "")
    formData.append("DesiredAccount", parsedInput.desiredAccount || parsedInput.productType || "")
    formData.append("RequireSmsAlert", String(parsedInput.requireSmsAlert))
    formData.append("RequireEmailAlert", String(parsedInput.requireEmailAlert))

    // Add MeansOfIdentity fields
    formData.append("MeansOfIdentity.IdType", String(parsedInput.idType ? mapIdTypeToNumber(parsedInput.idType) : 1))
    formData.append("MeansOfIdentity.IdNumber", parsedInput.idNumber || "")
    formData.append("MeansOfIdentity.IdIssuingAuthority", parsedInput.issuingAuthority || "")
    formData.append(
      "MeansOfIdentity.IdExpiryDate",
      parsedInput.expiryDate instanceof Date
        ? parsedInput.expiryDate.toISOString()
        : parsedInput.expiryDate || new Date().toISOString(),
    )
    formData.append("MeansOfIdentity.IdFile", parsedInput.idDocument || "")

    // Add personalInformations fields
    formData.append("PersonalInformations.FirstName", parsedInput.firstName)
    formData.append("PersonalInformations.MiddleName", "")
    formData.append("PersonalInformations.LastName", parsedInput.lastName)
    formData.append("PersonalInformations.Gender", parsedInput.gender?.toLowerCase() || "")
    formData.append(
      "PersonalInformations.DateOfBirth",
      parsedInput.dob instanceof Date ? parsedInput.dob.toISOString() : parsedInput.dob || new Date().toISOString(),
    )
    formData.append("PersonalInformations.MaritalStatus", parsedInput.maritalStatus.toLowerCase())
    formData.append("PersonalInformations.Nationality", crypto.randomUUID())
    formData.append("PersonalInformations.ResidentialAddress", parsedInput.address)
    formData.append("PersonalInformations.EmailAddress", parsedInput.email)
    formData.append("PersonalInformations.Password", "Test@123!")
    formData.append("PersonalInformations.PhoneNumber", parsedInput.phone)
    formData.append("PersonalInformations.AlternatePhoneNumber", parsedInput.alternatePhone || "")
    formData.append("PersonalInformations.EmploymentStatus", parsedInput.employmentStatus?.toLowerCase() || "")
    formData.append("PersonalInformations.TaxIdenttfictionNumber", parsedInput.tin)

    // Add proofOfAddress fields
    formData.append(
      "ProofOfAddress.ProofOfAddressType",
      String(parsedInput.addressProofType ? mapProofTypeToNumber(parsedInput.addressProofType) : 1),
    )
    formData.append("ProofOfAddress.ProofOfAddressIssuingAuthority", parsedInput.issuingAuthorityPOA || "")
    formData.append(
      "ProofOfAddress.ProofOfAddressDateIssue",
      parsedInput.dateOfIssue instanceof Date
        ? parsedInput.dateOfIssue.toISOString()
        : parsedInput.dateOfIssue || new Date().toISOString(),
    )
    formData.append("ProofOfAddress.ProofOfAddressFile", parsedInput.proofOfAddress || "")

    // Add employmentDetails fields
    formData.append("EmploymentDetails.CurrentEmployerName", parsedInput.currentEmployerName || "")
    formData.append("EmploymentDetails.EmployerAddress", parsedInput.employerAddress)
    formData.append("EmploymentDetails.JobTitle", parsedInput.jobTitle)
    formData.append(
      "EmploymentDetails.EmployementStateDate",
      parsedInput.startDate instanceof Date
        ? parsedInput.startDate.toISOString()
        : parsedInput.startDate || new Date().toISOString(),
    )
    formData.append(
      "EmploymentDetails.EmployementEndDate",
      parsedInput.endDate instanceof Date
        ? parsedInput.endDate.toISOString()
        : parsedInput.endDate || new Date().toISOString(),
    )
    formData.append("EmploymentDetails.EmploymentVerificationDocument", parsedInput.employmentDocument || "")

    // Add guarantorDetails fields
    formData.append("GuarantorDetails.GuarantorFullName", parsedInput.guarantorFullName)
    formData.append("GuarantorDetails.GuarantorRelationshipToCustomer", parsedInput.guarantorRelationship)
    formData.append("GuarantorDetails.GuarantorPhoneNumber", parsedInput.guarantorPhone)
    formData.append("GuarantorDetails.GuarantorEmailAddress", parsedInput.guarantorEmail)
    formData.append("GuarantorDetails.GuarantorAddress", parsedInput.guarantorAddress)
    formData.append("GuarantorDetails.GuarantorIdFile", parsedInput.guarantorId || "")

    // Add nxtOfKinDetails fields
    formData.append("NxtOfKinDetails.NextOfKinFullName", parsedInput.nextOfKinFullName)
    formData.append("NxtOfKinDetails.NextOfKinRelationshipToCustomer", parsedInput.nextOfKinRelationship)
    formData.append("NxtOfKinDetails.NextOfKinPhoneNumber", parsedInput.nextOfKinPhone)
    formData.append("NxtOfKinDetails.NextOfKinEmailAddress", parsedInput.nextOfKinEmail)
    formData.append("NxtOfKinDetails.NextOfKinAddress", parsedInput.nextOfKinAddress)

    // Add profilePicture
    formData.append("ProfilePicture", parsedInput.profileImage || "")

    // Log the form data keys for debugging
    console.log(
      "FormData keys:",
      [...formData.entries()].map((entry) => entry[0]),
    )

    // Call the API endpoint with FormData
    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    const response = await fetch(`${apiUrl}/customermanagement/auth/register-individual`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Don't set Content-Type header - fetch will automatically set it with the boundary when using FormData
      },
      body: formData,
    })

    console.log("API response status:", response.status)

    // Handle different response status codes
    if (response.status === 401) {
      console.error("Authentication failed: Token is invalid or expired")
      return {
        success: false,
        error: "Your session has expired. Please log in again.",
        statusCode: 401,
      }
    }

    if (response.status === 403) {
      console.error("Authorization failed: Insufficient permissions")
      return {
        success: false,
        error: "You don't have permission to perform this action.",
        statusCode: 403,
      }
    }

    // Safely parse the JSON response
    let data
    try {
      // Check if there's content to parse
      const text = await response.text()
      console.log("Raw API response:", text) // Log the raw response for debugging
      data = text ? JSON.parse(text) : {}
      console.log("API response data:", JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error("Error parsing API response:", parseError)
      return {
        success: false,
        error: `Server returned status ${response.status} with invalid response format`,
        statusCode: response.status,
      }
    }

    // Check if the request was successful
    if (data.isSuccess && (data.statCode === 200 || data.statCode === 201)) {
      // Extract customer ID from the message
      const customerId = extractCustomerId(data.message)

      return {
        success: true,
        message: data.message || "Customer created successfully",
        customerId: customerId,
        customerData: data.result,
      }
    } else {
      // Handle error cases with more detailed error information
      return {
        success: false,
        error: data.error || data.message || `Server returned status ${response.status} with invalid response format`,
        statusCode: response.status,
      }
    }
  } catch (error) {
    console.error("Error creating customer:", error)
    return {
      success: false,
      error: "An error occurred while creating the customer. Please try again later.",
      statusCode: 500,
    }
  }
})