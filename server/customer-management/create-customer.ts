"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for form validation
const customerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dob: z.string().or(z.date()).optional(),
  gender: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  maritalStatus: z.string().optional(),
  alternatePhone: z.string().optional(),
  employmentStatus: z.string().optional(),
  occupation: z.string().optional(),
  tin: z.string().optional(),
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
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  employmentDocument: z.string().nullable().optional(),
  currentEmployerName: z.string().optional(),
  guarantorFullName: z.string().optional(),
  guarantorRelationship: z.string().optional(),
  guarantorPhone: z.string().optional(),
  guarantorEmail: z.string().email("Invalid guarantor email").optional(),
  guarantorAddress: z.string().optional(),
  guarantorId: z.string().nullable().optional(),
  nextOfKinFullName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinEmail: z.string().email("Invalid next of kin email").optional(),
  nextOfKinAddress: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
  requireSmsAlert: z.boolean().default(true).optional(),
  requireEmailAlert: z.boolean().default(true).optional(),
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
  if (!idType) return 1; // Default to Driver's License if undefined
  
  const idTypeMap: Record<string, number> = {
    // IdType enum values
    "Driver_Licence": 1,
    "International_Passport": 2,
    "Voters_Card": 3,
    "NationalIdentityCard": 4,
    "BVN": 5,
    "Nin": 6,
    
    // Alternative naming formats
    "DriverLicense": 1,
    "InternationalPassport": 2,
    "VotersCard": 3,
    "National ID": 4,
    "Passport": 2,
    "Driver's License": 1,
    "Drivers License": 1,
    "Voter's Card": 3,
    "Drivers Licence": 1,
    "International Passport": 2,
    "Voters Card": 3,
    "National Identity Card": 4,
    "Bank Verification Number": 5,
    "Nin Document": 6
  }
  return idTypeMap[idType] || 1
}

// Helper function to map proof of address types to numeric values
function mapProofTypeToNumber(proofType: string | undefined): number {
  if (!proofType) return 1; // Default to Utility Bill if undefined
  
  const proofTypeMap: Record<string, number> = {
    // ProofOfAddressType enum values
    "Utility_Bill": 1,
    "Water_Bill": 2,
    
    // DocumentType enum values (also used for proof of address)
    "UtilityBill": 11,
    "WaterBill": 12,
    "BankStatement": 15,
    "LeaseAgreement": 16,
    
    // Alternative naming formats
    "Utility Bill": 1,
    "Water Bill": 2,
    "Bank Statement": 15,
    "Lease Agreement": 16
  }
  return proofTypeMap[proofType] || 1 // Default to Utility Bill (1) if mapping not found
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

    // Add basic fields - CustomerType.Individual = 1
    formData.append("Type", "1") // 1 = Individual customer type
    formData.append("Branch", parsedInput.branch || "")
    formData.append("AccountOfficer", parsedInput.accountOfficer || "")
    
    // Use AccountType enum values (Savings = 1, Current = 2)
    // Default to Savings (1) if not specified
    const desiredAccountType = parsedInput.desiredAccount || parsedInput.productType || "1"
    formData.append("DesiredAccount", desiredAccountType)
    
    formData.append("RequireSmsAlert", parsedInput.requireSmsAlert === undefined ? "true" : String(parsedInput.requireSmsAlert))
    formData.append("RequireEmailAlert", parsedInput.requireEmailAlert === undefined ? "true" : String(parsedInput.requireEmailAlert))

    // Add MeansOfIdentity fields
    formData.append("MeansOfIdentity.IdType", String(parsedInput.idType ? mapIdTypeToNumber(parsedInput.idType) : 1))
    formData.append("MeansOfIdentity.IdNumber", parsedInput.idNumber || "DEFAULT-ID-NUMBER")
    formData.append("MeansOfIdentity.IdIssuingAuthority", parsedInput.issuingAuthority || "DEFAULT ISSUING AUTHORITY")
    formData.append(
      "MeansOfIdentity.IdExpiryDate",
      parsedInput.expiryDate instanceof Date
        ? parsedInput.expiryDate.toISOString()
        : parsedInput.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
    )
    formData.append("MeansOfIdentity.IdFile", parsedInput.idDocument || "")

    // Add personalInformations fields
    formData.append("PersonalInformations.FirstName", parsedInput.firstName || "")
    formData.append("PersonalInformations.MiddleName", "")
    formData.append("PersonalInformations.LastName", parsedInput.lastName || "")
    formData.append("PersonalInformations.Gender", parsedInput.gender?.toLowerCase() || "male")
    formData.append(
      "PersonalInformations.DateOfBirth",
      parsedInput.dob instanceof Date ? parsedInput.dob.toISOString() : parsedInput.dob || new Date().toISOString(),
    )
    formData.append("PersonalInformations.MaritalStatus", parsedInput.maritalStatus?.toLowerCase() || "single")
    formData.append("PersonalInformations.Nationality", "NGA")
    formData.append("PersonalInformations.ResidentialAddress", parsedInput.address || "Default Address")
    formData.append("PersonalInformations.EmailAddress", parsedInput.email || "default@example.com")
    formData.append("PersonalInformations.Password", "Test@123!")
    formData.append("PersonalInformations.PhoneNumber", parsedInput.phone || "07000000000")
    formData.append("PersonalInformations.AlternatePhoneNumber", parsedInput.alternatePhone || "")
    formData.append("PersonalInformations.EmploymentStatus", parsedInput.employmentStatus?.toLowerCase() || "employed")
    formData.append("PersonalInformations.TaxIdenttfictionNumber", parsedInput.tin || "12345678901")

    // Add proofOfAddress fields
    formData.append(
      "ProofOfAddress.ProofOfAddressType",
      String(parsedInput.addressProofType ? mapProofTypeToNumber(parsedInput.addressProofType) : 1),
    )
    formData.append("ProofOfAddress.ProofOfAddressIssuingAuthority", parsedInput.issuingAuthorityPOA || "DEFAULT AUTHORITY")
    formData.append(
      "ProofOfAddress.ProofOfAddressDateIssue",
      parsedInput.dateOfIssue instanceof Date
        ? parsedInput.dateOfIssue.toISOString()
        : parsedInput.dateOfIssue || new Date().toISOString(),
    )
    formData.append("ProofOfAddress.ProofOfAddressFile", parsedInput.proofOfAddress || "")

    // Add employmentDetails fields
    formData.append("EmploymentDetails.CurrentEmployerName", parsedInput.currentEmployerName || "Default Employer")
    formData.append("EmploymentDetails.EmployerAddress", parsedInput.employerAddress || "Default Employer Address")
    formData.append("EmploymentDetails.JobTitle", parsedInput.jobTitle || "Default Job Title")
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
        : parsedInput.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
    )
    formData.append("EmploymentDetails.EmploymentVerificationDocument", parsedInput.employmentDocument || "")

    // Add guarantorDetails fields
    formData.append("GuarantorDetails.GuarantorFullName", parsedInput.guarantorFullName || "Default Guarantor")
    formData.append("GuarantorDetails.GuarantorRelationshipToCustomer", parsedInput.guarantorRelationship || "Friend")
    formData.append("GuarantorDetails.GuarantorPhoneNumber", parsedInput.guarantorPhone || "07000000001")
    formData.append("GuarantorDetails.GuarantorEmailAddress", parsedInput.guarantorEmail || "guarantor@example.com")
    formData.append("GuarantorDetails.GuarantorAddress", parsedInput.guarantorAddress || "Default Guarantor Address")
    formData.append("GuarantorDetails.GuarantorIdFile", parsedInput.guarantorId || "")

    // Add nxtOfKinDetails fields
    formData.append("NxtOfKinDetails.NextOfKinFullName", parsedInput.nextOfKinFullName || "Default Next of Kin")
    formData.append("NxtOfKinDetails.NextOfKinRelationshipToCustomer", parsedInput.nextOfKinRelationship || "Sibling")
    formData.append("NxtOfKinDetails.NextOfKinPhoneNumber", parsedInput.nextOfKinPhone || "07000000002")
    formData.append("NxtOfKinDetails.NextOfKinEmailAddress", parsedInput.nextOfKinEmail || "nextofkin@example.com")
    formData.append("NxtOfKinDetails.NextOfKinAddress", parsedInput.nextOfKinAddress || "Default Next of Kin Address")

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