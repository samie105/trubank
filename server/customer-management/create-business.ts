"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for business form validation
const businessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  tin: z.string().min(1, "TIN is required"),
  natureOfBusiness: z.string().min(1, "Nature of business is required"),
  businessType: z.string().optional(),
  businessAddress: z.string().min(1, "Business address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  website: z.string().optional(),

  // Business Registration Documents
  businessIncorporationCertificate: z.string().nullable().optional(),
  memorandumArticles: z.string().nullable().optional(),
  businessLicense: z.string().nullable().optional(),

  // Proof of Address
  utilityBillType: z.string().min(1, "Utility bill type is required"),
  utilityBillIssuer: z.string().min(1, "Utility bill issuer is required"),
  issueDateOfBill: z.string().min(1, "Issue date is required"),
  utilityBill: z.string().nullable().optional(),

  // Account Information
  branch: z.string().optional(),
  desiredAccount: z.string().optional(),
  accountOfficer: z.string().optional(),
  
  // Alert preferences
  requireSmsAlert: z.boolean().default(false),
  requireEmailAlert: z.boolean().default(false),
})

export type BusinessFormData = z.infer<typeof businessSchema>

// Helper function to extract business ID from success message
function extractBusinessId(message: string): string {
  const match = message.match(/business Id (\w+)/i)
  return match ? match[1] : ""
}

// Helper function to map utility bill types to numeric values
function mapUtilityTypeToNumber(utilityType: string): number {
  const utilityTypeMap: Record<string, number> = {
    "Electricity Bill": 1,
    "Water Bill": 2,
    "Gas Bill": 3,
    "Internet Bill": 4,
    "Phone Bill": 5,
    Other: 6,
  }
  return utilityTypeMap[utilityType] || 1
}

// (Business type fixed to "3" for create mode; mapping function no longer needed)

export const createBusinessAction = actionClient.schema(businessSchema).action(async ({ parsedInput }) => {
  console.log("Creating business with data:", parsedInput)

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

    // Create FormData instead of JSON
    const formData = new FormData()

    // Add basic fields - using exact field names from the API, including typos
    formData.append("Type", "2") // Business customer type
    formData.append("BusienssName", parsedInput.businessName) // Note: Match API typo
    formData.append("RegistrationNumber", parsedInput.registrationNumber)
    formData.append("TaxIdentificationNumber", parsedInput.tin)
    formData.append("NatureOfBusiness", parsedInput.natureOfBusiness)
    // Business type is fixed to 3 (Limited Liability Company) in create mode
    formData.append("BusienssType", "3")
    formData.append("BusinessAddress", parsedInput.businessAddress)
    formData.append("PhoneNumber", parsedInput.phoneNumber)
    formData.append("EmailAddress", parsedInput.email)
    formData.append("Website", parsedInput.website || "")
    formData.append("BranchId", parsedInput.branch || "")
    formData.append("AccountOfficerId", parsedInput.accountOfficer || "")
    formData.append("DesiredAccount", parsedInput.desiredAccount || "")
    
    // Add alert preferences
    formData.append("RequireSmsAlert", String(parsedInput.requireSmsAlert))
    formData.append("RequireEmailAlert", String(parsedInput.requireEmailAlert))

    // Add Business Registration Documents
    formData.append("BusinessIncorporationDocument.FileType", "1")
    formData.append("BusinessIncorporationDocument.TheFile", parsedInput.businessIncorporationCertificate || "")

    formData.append("MemorandumOfAssociationDocument.FileType", "1")
    formData.append("MemorandumOfAssociationDocument.TheFile", parsedInput.memorandumArticles || "")

    formData.append("BusinessLicenseDocument.FileType", "1")
    formData.append("BusinessLicenseDocument.TheFile", parsedInput.businessLicense || "")

    // Add Proof of Address
    formData.append("ProofOfAddress.UtilityType", String(mapUtilityTypeToNumber(parsedInput.utilityBillType)))
    formData.append("ProofOfAddress.UtilityIssuer", parsedInput.utilityBillIssuer)
    formData.append("ProofOfAddress.UtilityDateIssuer", parsedInput.issueDateOfBill)
    formData.append("ProofOfAddress.UtilityFile", parsedInput.utilityBill || "")

    // Log the form data keys and values for debugging
    console.log("FormData entries:", [...formData.entries()]
      .map(([key, value]) => {
        if (value instanceof File) {
          return `${key}=File:${value.name.substring(0, 10)}...`;
        }
        if (typeof value === 'string' && value.length > 50) {
          return `${key}=${value.substring(0, 50)}...`;
        }
        return `${key}=${value}`;
      })
      .join('&')
    )

    // Call the API endpoint with FormData
    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    const response = await fetch(`${apiUrl}/customermanagement/auth/register-business`, {
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
      // Extract business ID from the message if available
      const businessId = extractBusinessId(data.message || "")

      return {
        success: true,
        message: data.message || "Business registered successfully",
        businessId: businessId,
        businessData: data.result,
      }
    } else {
      // Handle error cases with more detailed error information
      return {
        success: false,
        error: data.error || data.message || `Failed to register business (Status: ${response.status})`,
        statusCode: data.statCode || response.status,
        errors: data.errors || data.validationErrors || null,
      }
    }
  } catch (error) {
    console.error("Error registering business:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

