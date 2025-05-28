/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { actionClient } from "@/lib/safe-action"
import { cookies } from "next/headers"
import {
  fetchCustomersSchema,
  type FetchCustomersInput,
  type CustomerTableData,
  type IndividualCustomerAPI,
  type BusinessCustomerAPI,
  type ApiResponse,
  type ApiResponseStructure,
  type StatusType,
  type KycStatusType
} from "./types"

// Helper function to map API status codes to readable strings
function mapKycStatus(statusCode: number): KycStatusType {
  const kycStatusMap: Record<number, KycStatusType> = {
    0: "Pending",
    1: "Under Review",
    2: "Approved",
    3: "Rejected",
  }
  return kycStatusMap[statusCode] || "Unknown"
}

// Helper function to map active status from boolean
function mapStatus(isActive: boolean): StatusType {
  return isActive ? "active" : "inactive"
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  } catch {
    return "N/A";
  }
}

// Safe getter for potentially undefined values
function safeGetString(value: string | null | undefined): string {
  return value ? value.trim() : "N/A";
}

export const fetchCustomersAction = actionClient
  .schema(fetchCustomersSchema)
  .action(async ({ parsedInput }: { parsedInput: FetchCustomersInput }): Promise<ApiResponse<CustomerTableData[]>> => {
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

      const { pageSize, pageNumber, searchParams, customerType } = parsedInput

      // Create the request body
      const requestBody = {
        pageSize,
        pageNumber,
        searchParams: searchParams || {},
      }

      // Determine the endpoint based on customer type
      const endpoint =
        customerType === "Individual"
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
      let data: ApiResponseStructure<IndividualCustomerAPI | BusinessCustomerAPI>
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
        // Transform the data based on customer type
        let transformedData: CustomerTableData[] = []
        
        if (customerType === "Individual") {
          // Cast the data to the correct type
          const individualData = data.result.data as IndividualCustomerAPI[]
          console.log(individualData[0])
          
          // Filter out deleted users and transform the data
          transformedData = individualData
            .filter(customer => !customer.isDeleted)
            .map((customer) => ({
              id: customer.customerId || customer.id.substring(0, 8),
              fullId: customer.id,
              customerId: customer.customerId,
              firstName: safeGetString(customer.firstName),
              lastName: safeGetString(customer.lastName),
              email: safeGetString(customer.emailAddress),
              phone: safeGetString(customer.phoneNumber),
              status: mapStatus(customer.isActive),
              date: formatDate(customer.createdAt),
              avatar: customer.profilePicture?.profilePicture || "",
              type: "Individual" as const,
              tierLevel: customer.accountTier?.name || "Tier 1",
              kycStatus: mapKycStatus(customer.kycStatus),
              originalData: customer,
            }))
        } else {
          // Cast the data to the correct type
          const businessData = data.result.data as BusinessCustomerAPI[]
          
          // Filter out deleted users and transform the data
          transformedData = businessData
            .filter(customer => !customer.isDeleted)
            .map((customer) => ({
              id: customer.customerId || customer.id.substring(0, 8),
              fullId: customer.id,
              customerId: customer.customerId,
              businessName: safeGetString(customer.busienssName || customer.businessName),
              email: safeGetString(customer.emailAddress),
              phone: safeGetString(customer.phoneNumber),
              status: mapStatus(customer.isActive),
              date: formatDate(customer.createdAt),
              avatar: "", // Business customers don't have avatars
              type: "Business" as const,
              tierLevel: customer.accountTier?.name || "Tier 1",
              kycStatus: mapKycStatus(customer.kycStatus),
              originalData: customer,
            }))
        }

        // Log a sample of the transformed data for debugging
        if (transformedData.length > 0) {
          console.log("Sample transformed customer data:", {
            id: transformedData[0].id,
            fullId: transformedData[0].fullId,
            email: transformedData[0].email,
            phone: transformedData[0].phone,
            date: transformedData[0].date,
            status: transformedData[0].status,
            kycStatus: transformedData[0].kycStatus
          })
        }

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

