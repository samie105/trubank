/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for pagination and search parameters
const fetchCustomersSchema = z.object({
  pageSize: z.number().default(10),
  pageNumber: z.number().default(0),
  searchParams: z.record(z.string()).optional(),
  customerType: z.enum(["individual", "business"]),
})

// Define types for the API responses
export interface IndividualCustomer {
  id: string
  firstName: string
  middleName: string
  lastName: string
  fullName: string
  gender: string
  customerId: string
  dateOfBirth: string
  maritalStatus: string
  nationality: string
  residentialAddress: string
  emailAddress: string
  passwordHash: string
  phoneNumber: string
  alternatePhoneNumber: string
  employmentStatus: string
  taxIdentificationNumber: string
  branchId: string
  accountOfficerId: string
  idType: string
  idNumber: string
  idIssuingAuthority: string
  proofOfAddressType: string
  meansOfIdentification: {
    meansOfIdentificationFile: string
    meansOfIdentificationFileType: string
    meansOfIdentificationFileName: string
  }
  idExpiryDate: string
  proofOfAddress: {
    proofOfAddressFile: string
    proofOfAddressType: string
    proofOfAddressFileName: string
  }
  proofOfAddressIssuingAuthority: string
  proofOfAddressDateIssue: string
  profilePicture: {
    profilePicture: string
    profilePictureType: string
    profilePictureName: string
  }
  employmentDetailsId: string
  guarantorDetailsId: string
  nextOfKinDetailsId: string
  desiredAccount: string
  type: number
  kycStatus: number
  status: number
  lastLogin: string
  lastModified: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  employmentDetails: {
    id: string
    appUserId: string
    currentEmployerName: string
    employerAddress: string
    jobTitle: string
    employementStateDate: string
    employementEndDate: string
    employmentVerificationDocument: string
    employmentVerificationDocumentName: string
    employmentVerificationDocumentType: string
  }
  guarantorDetails: {
    id: string
    appUserId: string
    guarantorFullName: string
    guarantorRelationshipToCustomer: string
    guarantorPhoneNumber: string
    guarantorEmailAddress: string
    guarantorAddress: string
    guarantorFileDocument: string
    guarantorDocumentName: string
    guarantorDocumentType: string
  }
  nextOfKinDetails: {
    id: string
    appUserId: string
    nextOfKinFullName: string
    nextOfKinRelationshipToCustomer: string
    nextOfKinPhoneNumber: string
    nextOfKinEmailAddress: string
    nextOfKinAddress: string
  }
  accountTier: {
    id: string
    name: string
    description: string
    minAmount: number
    maxAmount: number
  }
  accountOfficer: {
    id: string
    fullName: string
  }
  branch: {
    id: string
    name: string
  }
}

// Update the BusinessCustomer interface to match the actual API response
export interface BusinessCustomer {
  id: string
  busienssName: string // Spelling as in API response
  registrationNumber: string
  taxIdentificationNumber: string
  natureOfBusiness: string
  busienssType: string // Spelling as in API response
  businessAddress: string
  phoneNumber: string
  emailAddress: string
  website: string
  customerId: string
  passwordHash: string
  accountTierId: string
  accountOfficerId: string
  branchId: string
  incorporationCertificate: {
    incorporationCertificateFile: string
    incorporationCertificateType: string
    incorporationCertificateFileName: string
  }
  memorandumAssociation: {
    memorandumAssociationFile: string
    memorandumAssociationType: string
    memorandumAssociationFileName: string
  }
  businessLicence: {
    businessLicenceFile: string
    businessLicenceType: string
    businessLicenceFileName: string
  }
  utilityType: string
  utilityIssuer: string
  utilityDateIssuer: string
  utility: {
    utilityFile: string
    utilityFileType: string
    utilityFileName: string
  }
  productType: string
  retries: number
  type: number
  kycStatus: number
  lastLogin: string
  lastModified: string
  dateDeleted: string
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  status: number
  operationBy: string
  accountTier: {
    id: string
    name: string
    description: string
    minAmount: number
    maxAmount: number
  }
  accountOfficer: {
    id: string
    fullName: string
  }
  branch: {
    id: string
    name: string
  }
}

// Update the CustomerTableData interface to include fullId and customerId
export interface CustomerTableData {
  id: string
  fullId?: string // Store the full ID for API requests
  customerId?: string // Store the customerId if available
  firstName?: string
  lastName?: string
  businessName?: string
  email: string
  phone: string
  status: "active" | "inactive"
  date: string
  avatar: string
  type: "individual" | "business"
  tierLevel: string
  kycStatus: string
  fullData?: any // Store the complete customer data
}

// Helper function to map API status codes to readable strings
function mapKycStatus(statusCode: number): string {
  const kycStatusMap: Record<number, string> = {
    0: "Pending",
    1: "Under Review",
    2: "Approved",
    3: "Rejected",
  }
  return kycStatusMap[statusCode] || "Unknown"
}

// Helper function to map API status codes to readable strings
function mapStatus(statusCode: number): "active" | "inactive" {
  return statusCode === 1 ? "active" : "inactive"
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
  return date.toLocaleDateString("en-US", options)
}

export const fetchCustomersAction = actionClient
  .schema(fetchCustomersSchema)
  .action(async ({ parsedInput: { pageSize, pageNumber, searchParams, customerType } }) => {
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

      // Create the request body with field selection to optimize the response
      const requestBody = {
        pageSize,
        pageNumber,
        searchParams: searchParams || {},
        // Add field selection if the API supports it
        // This is a comment for now, as we don't know if the API supports field selection
        // fields: ["id", "customerId", "firstName", "lastName", "emailAddress", "phoneNumber", "status", "createdAt", "profilePicture", "accountTier", "kycStatus"]
      }

      // Determine the endpoint based on customer type
      const endpoint =
        customerType === "individual"
          ? "/customermanagement/get-all-individual-users"
          : "/customermanagement/get-all-business-users"

      // Call the API endpoint
      const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      // Handle different response status codes
      if (response.status === 401) {
        return {
          success: false,
          error: "Your session has expired. Please log in again.",
          statusCode: 401,
        }
      }

      if (response.status === 403) {
        return {
          success: false,
          error: "You don't have permission to access this resource.",
          statusCode: 403,
        }
      }

      // Safely parse the JSON response
      let data
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error("Error parsing API response:", parseError)
        return {
          success: false,
          error: `Server returned status ${response.status} with invalid response format`,
          statusCode: response.status,
        }
      }

      // Check if the request was successful
      if (data.isSuccess && data.result?.data) {
        // Transform the data for the table component
        const transformedData =
          customerType === "individual"
            ? (data.result.data as IndividualCustomer[]).map((customer) => ({
                id: customer.id,
                fullId: customer.id, // Store the full ID for API requests
                customerId: customer.customerId, // Store the customerId if available
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.emailAddress,
                phone: customer.phoneNumber,
                status: mapStatus(customer.status),
                date: formatDate(customer.createdAt),
                avatar: customer.profilePicture?.profilePicture || "",
                type: "individual",
                tierLevel: customer.accountTier?.name || "Tier 1",
                kycStatus: mapKycStatus(customer.kycStatus),
                fullData: customer, // Include the complete customer data
              }))
            : (data.result.data as BusinessCustomer[]).map((customer) => ({
                id: customer.id,
                fullId: customer.id, // Store the full ID for API requests
                customerId: customer.customerId, // Store the customerId if available
                businessName: customer.busienssName, // Note the typo in the API response
                email: customer.emailAddress,
                phone: customer.phoneNumber,
                status: mapStatus(customer.status),
                date: formatDate(customer.createdAt),
                avatar: "",
                type: "business",
                tierLevel: customer.accountTier?.name || "Tier 1",
                kycStatus: mapKycStatus(customer.kycStatus),
                fullData: customer, // Include the complete customer data
              }))

        return {
          success: true,
          data: transformedData,
          pagination: {
            totalCount: data.result.totalCount,
            totalPages: data.result.totalPages,
          },
        }
      } else {
        // Handle error cases
        return {
          success: false,
          error: data.error || data.message || "Failed to fetch customers",
          statusCode: data.statCode || response.status,
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }
    }
  })

