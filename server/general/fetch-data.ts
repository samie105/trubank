"use server"

import { actionClient } from "@/lib/safe-action"
import { cookies } from "next/headers"
import { z } from "zod"

// Define types for the API responses
export interface Branch {
  id: string
  name: string
  branchCode: string
}

export interface AccountOfficer {
  id: string
  fullName: string
}

// Add this interface after the AccountOfficer interface
export interface AccountType {
  id: string
  name: string
}

// Define interfaces for product details
interface ProductInterest {
  type?: string;
  rate?: number;
}

interface ProductFee {
  type?: string;
  amount?: number;
}

interface OverDraft {
  limit?: number;
}

// Add this interface after the AccountType interface
export interface ProductType {
  id: string
  name: string
  accountTypeId: string
  productInterest: ProductInterest | null
  productFee: ProductFee | null
  overDraft: OverDraft | null
}

// Add interfaces for customer account creation
export interface CreateAccountRequest {
  customerId: string;
  productId: string;
  branchId: string;
  accountOfficerId: string;
  initialDepositAmount?: number;
}

export interface CreateAccountResponse {
  id: string;
  accountNumber: string;
  accountName: string;
  productId: string;
  productName: string;
  customerId: string;
  branchId: string;
  accountOfficerId: string;
  status: string;
  balance: number;
  dateCreated: string;
}

// Define the schema for account creation
const createAccountSchema = z.object({
  customerId: z.string(),
  productId: z.string(),
  branchId: z.string(),
  accountOfficerId: z.string(),
  initialDepositAmount: z.number().optional(),
})

// Server action to fetch all branches
export const fetchBranchesAction = actionClient.action(async () => {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      console.error("Branches fetch error: No access token found in cookies")
      return {
        success: false,
        error: "Authentication required. Please log in again.",
        statusCode: 401,
      }
    }

    // Call the API endpoint
    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    console.log(`Fetching branches from: ${apiUrl}/accountmanagement/Get-branches`)
    
    const response = await fetch(`${apiUrl}/accountmanagement/Get-branches`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    console.log(`Branches API response status: ${response.status}`)

    // Handle different response status codes
    if (response.status === 401) {
      console.error("Branches fetch error: Unauthorized (401)")
      return {
        success: false,
        error: "Your session has expired. Please log in again.",
        statusCode: 401,
      }
    }

    if (response.status === 403) {
      console.error("Branches fetch error: Forbidden (403)")
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
      console.log("Raw branches response:", text.substring(0, 200) + (text.length > 200 ? "..." : ""))
      data = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error("Error parsing branches API response:", parseError)
      return {
        success: false,
        error: `Server returned status ${response.status} with invalid response format`,
        statusCode: response.status,
      }
    }

    // Check if the request was successful
    if (data.isSuccess && data.result) {
      console.log(`Successfully fetched ${data.result.length} branches`)
      return {
        success: true,
        data: data.result as Branch[],
      }
    } else {
      // Handle error cases
      console.error("Branches fetch error in response:", data.error || data.message || "Unknown error")
      return {
        success: false,
        error: data.error || data.message || "Failed to fetch branches",
        statusCode: data.statCode || response.status,
      }
    }
  } catch (error) {
    console.error("Error fetching branches:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

// Server action to fetch all account officers
export const fetchAccountOfficersAction = actionClient.action(async () => {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      console.error("Account officers fetch error: No access token found in cookies")
      return {
        success: false,
        error: "Authentication required. Please log in again.",
        statusCode: 401,
      }
    }

    // Call the API endpoint
    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    console.log(`Fetching account officers from: ${apiUrl}/usermanagement/general/get-all-accountofficers`)
    
    const response = await fetch(`${apiUrl}/usermanagement/general/get-all-accountofficers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    console.log(`Account officers API response status: ${response.status}`)

    // Handle different response status codes
    if (response.status === 401) {
      console.error("Account officers fetch error: Unauthorized (401)")
      return {
        success: false,
        error: "Your session has expired. Please log in again.",
        statusCode: 401,
      }
    }

    if (response.status === 403) {
      console.error("Account officers fetch error: Forbidden (403)")
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
      console.log("Raw account officers response:", text)
      data = text ? JSON.parse(text) : {}
      console.log("Parsed account officers data:", JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error("Error parsing API response:", parseError)
      return {
        success: false,
        error: `Server returned status ${response.status} with invalid response format`,
        statusCode: response.status,
      }
    }

    // Check if the request was successful
    if (data.isSuccess && data.result) {
      return {
        success: true,
        data: data.result as AccountOfficer[],
      }
    } else {
      // Handle error cases
      return {
        success: false,
        error: data.error || data.message || "Failed to fetch account officers",
        statusCode: data.statCode || response.status,
      }
    }
  } catch (error) {
    console.error("Error fetching account officers:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

// Add this server action after the fetchAccountOfficersAction
// Server action to fetch all account types


// Server action to fetch all product types
export const fetchProductTypesAction = actionClient.action(async () => {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      console.error("Product types fetch error: No access token found in cookies")
      return {
        success: false,
        error: "Authentication required. Please log in again.",
        statusCode: 401,
      }
    }

    // Call the API endpoint
    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    console.log(`Fetching product types from: ${apiUrl}/accountmanagement/Get-product-types`)
    
    // Use the correct endpoint for product types from the accountmanagement API
    const response = await fetch(`${apiUrl}/accountmanagement/Get-product-types`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
    })

    console.log(`Product types API response status: ${response.status}`)

    // Handle different response status codes
    if (response.status === 401) {
      console.error("Product types fetch error: Unauthorized (401)")
      return {
        success: false,
        error: "Your session has expired. Please log in again.",
        statusCode: 401,
      }
    }

    if (response.status === 403) {
      console.error("Product types fetch error: Forbidden (403)")
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
      console.log("Raw product types response:", text)
      data = text ? JSON.parse(text) : {}
      console.log("Parsed product types data:", JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error("Error parsing API response:", parseError)
      return {
        success: false,
        error: `Server returned status ${response.status} with invalid response format`,
        statusCode: response.status,
      }
    }

    // Check if the request was successful
    if (data.isSuccess && data.result) {
      return {
        success: true,
        data: data.result as ProductType[],
      }
    } else {
      // Handle error cases
      return {
        success: false,
        error: data.error || data.message || "Failed to fetch product types",
        statusCode: data.statCode || response.status,
      }
    }
  } catch (error) {
    console.error("Error fetching product types:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

// Server action to create a customer account
export const createCustomerAccountAction = actionClient
  .schema(createAccountSchema)
  .action(async ({ parsedInput }) => {
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

      // Call the API endpoint
      const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
      
      // Use the account creation endpoint from the accountmanagement API
      const response = await fetch(`${apiUrl}/accountmanagement/accounts/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedInput)
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
        console.log("Raw account creation response:", text)
        data = text ? JSON.parse(text) : {}
        console.log("Parsed account creation data:", JSON.stringify(data, null, 2))
      } catch (parseError) {
        console.error("Error parsing API response:", parseError)
        return {
          success: false,
          error: `Server returned status ${response.status} with invalid response format`,
          statusCode: response.status,
        }
      }

      // Check if the request was successful
      if (data.isSuccess && data.result) {
        return {
          success: true,
          data: data.result as CreateAccountResponse,
        }
      } else {
        // Handle error cases
        return {
          success: false,
          error: data.error || data.message || "Failed to create customer account",
          statusCode: data.statCode || response.status,
        }
      }
    } catch (error) {
      console.error("Error creating customer account:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }
    }
  }
)

