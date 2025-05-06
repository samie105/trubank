"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for business editing
const editBusinessSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  businessName: z.string().optional(),
  registrationNumber: z.string().optional(),
  tin: z.string().optional(),
  natureOfBusiness: z.string().optional(),
  businessType: z.string().optional(),
  businessAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),

  // Business Registration Documents
  businessIncorporationCertificate: z.string().nullable().optional(),
  memorandumArticles: z.string().nullable().optional(),
  businessLicense: z.string().nullable().optional(),

  // Proof of Address
  utilityBillType: z.string().optional(),
  utilityBillIssuer: z.string().optional(),
  issueDateOfBill: z.string().optional(),
  utilityBill: z.string().nullable().optional(),

  // Account Information
  branch: z.string().optional(),
  desiredAccount: z.string().optional(),
  accountOfficer: z.string().optional(),
  
  // Alert preferences
  requireSmsAlert: z.boolean().default(false),
  requireEmailAlert: z.boolean().default(false),
})

export type EditBusinessFormData = z.infer<typeof editBusinessSchema>

// Helper function to map utility bill types to numeric values
function mapUtilityTypeToNumber(utilityType: string | undefined): number {
  if (!utilityType) return 1; // Default to the first type if undefined
  
  const utilityTypeMap: Record<string, number> = {
    "Electricity Bill": 1,
    "Water Bill": 2,
    "Gas Bill": 3,
    "Internet Bill": 4,
    "Phone Bill": 5,
    "UtilityBill": 1,
    "WaterBill": 2,
    "ElectricityBill": 1,
    "GasBill": 3,
    "InternetBill": 4,
    "PhoneBill": 5,
    Other: 6,
  }
  return utilityTypeMap[utilityType] || 1
}

// Helper function to map business types to numeric values
function mapBusinessTypeToNumber(businessType: string | undefined): number {
  if (!businessType) return 3; // Default to LLC if undefined
  
  const businessTypeMap: Record<string, number> = {
    "Sole Proprietorship": 1,
    Partnership: 2,
    "Limited Liability Company": 3,
    Corporation: 4,
    "Non-Profit": 5,
    "SoleProprietorship": 1,
    "LimitedLiabilityCompany": 3,
    "NonProfit": 5,
    LLC: 3,
    Other: 6,
  }
  return businessTypeMap[businessType] || 3 // Default to LLC
}

export const editBusinessAction = actionClient.schema(editBusinessSchema).action(async ({ parsedInput }) => {
  console.log("Editing business with data:", parsedInput)

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

    // First, fetch the current business data to preserve important fields
    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    const getResponse = await fetch(
      `${apiUrl}/customermanagement/get-business-user?UserId=${parsedInput.businessId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!getResponse.ok) {
      return {
        success: false,
        error: `Failed to fetch current business data: ${getResponse.statusText}`,
        statusCode: getResponse.status,
      }
    }

    const currentData = await getResponse.json()

    if (!currentData.isSuccess || !currentData.result) {
      return {
        success: false,
        error: "Failed to fetch current business data",
        statusCode: 404,
      }
    }

    // Create FormData for the PUT request
    const formData = new FormData()

    // Add basic fields - using exact field names from the API, including typos
    formData.append("BusienssName", parsedInput.businessName || currentData.result.businessName || "")
    formData.append("RegistrationNumber", parsedInput.registrationNumber || currentData.result.registrationNumber || "")
    formData.append("TaxIdentificationNumber", parsedInput.tin || currentData.result.tin || "")
    formData.append("NatureOfBusiness", parsedInput.natureOfBusiness || currentData.result.natureOfBusiness || "")
    formData.append("BusienssType", String(mapBusinessTypeToNumber(parsedInput.businessType || currentData.result.businessType || "")))
    formData.append("BusinessAddress", parsedInput.businessAddress || currentData.result.businessAddress || "")
    formData.append("PhoneNumber", parsedInput.phoneNumber || currentData.result.phoneNumber || "")
    formData.append("EmailAddress", parsedInput.email || currentData.result.email || "")
    formData.append("Website", parsedInput.website || currentData.result.website || "")

    // Add preserved or updated account information
    formData.append("BranchId", parsedInput.branch || currentData.result.branchId || "")
    formData.append("AccountOfficerId", parsedInput.accountOfficer || currentData.result.accountOfficerId || "")
    formData.append("DesiredAccount", parsedInput.desiredAccount || currentData.result.desiredAccount || "")
    formData.append("Type", "2") // Business type
    
    // Add alert preferences - either from input or preserve existing values
    // formData.append("RequireSmsAlert", String(parsedInput.requireSmsAlert !== undefined 
    //   ? parsedInput.requireSmsAlert 
    //   : currentData.result.requireSmsAlert || false))
    // formData.append("RequireEmailAlert", String(parsedInput.requireEmailAlert !== undefined 
    //   ? parsedInput.requireEmailAlert 
    //   : currentData.result.requireEmailAlert || false))

    // Add Business Registration Documents
    formData.append("BusinessIncorporationDocument.FileType", "1")
    formData.append("BusinessIncorporationDocument.TheFile", parsedInput.businessIncorporationCertificate || currentData.result.businessIncorporationCertificate || "")

    formData.append("MemorandumOfAssociationDocument.FileType", "1")
    formData.append("MemorandumOfAssociationDocument.TheFile", parsedInput.memorandumArticles || currentData.result.memorandumArticles || "")

    formData.append("BusinessLicenseDocument.FileType", "1")
    formData.append("BusinessLicenseDocument.TheFile", parsedInput.businessLicense || currentData.result.businessLicense || "")

    // Add Proof of Address
    formData.append("ProofOfAddress.UtilityType", String(mapUtilityTypeToNumber(parsedInput.utilityBillType || currentData.result.utilityBillType || "")))
    formData.append("ProofOfAddress.UtilityIssuer", parsedInput.utilityBillIssuer || currentData.result.utilityBillIssuer || "")
    formData.append("ProofOfAddress.UtilityDateIssuer", parsedInput.issueDateOfBill || currentData.result.issueDateOfBill || "")
    formData.append("ProofOfAddress.UtilityFile", parsedInput.utilityBill || currentData.result.utilityBill || "")

    // Log the form data keys for debugging
    console.log(
      "FormData entries:",
      [...formData.entries()].map((entry) => `${entry[0]}: ${entry[1]}`),
    )

    // Call the API endpoint with FormData
    const response = await fetch(`${apiUrl}/customermanagement/edit-business?UserId=${parsedInput.businessId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
    if (data.isSuccess && (data.statCode === 200 || data.statCode === 204)) {
      return {
        success: true,
        message: data.message || "Business updated successfully",
        businessData: data.result,
      }
    } else {
      // Handle error cases with more detailed error information
      return {
        success: false,
        error: data.error || data.message || `Failed to update business (Status: ${response.status})`,
        statusCode: data.statCode || response.status,
        details: data.errors || data.validationErrors || null, // Include any validation errors from the API
      }
    }
  } catch (error) {
    console.error("Error updating business:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

