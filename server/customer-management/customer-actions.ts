"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for activating/deactivating a user
const activateUserSchema = z.object({
  userId: z.string(),
  activate: z.boolean(),
})

// Define the schema for deleting a user
const deleteUserSchema = z.object({
  userId: z.string(),
})

// Define schema for getting users
const getUserSchema = z.object({
  userId: z.string(),
  userType: z.enum(["Individual", "Business", "Admin"]),
})

// Define schema for getting all users
const getAllUsersSchema = z.object({
  pageSize: z.number().default(10),
  pageNumber: z.number().default(0),
  userType: z.enum(["Individual", "Business", "Admin"]),
})

// Define schema for exporting users
const exportUsersSchema = z.object({
  userType: z.enum(["Individual", "Business", "Admin"]),
  format: z.enum(["csv", "pdf"]),
})

// Server action to activate/deactivate a user
export const activateUserAction = actionClient
  .schema(activateUserSchema)
  .action(async ({ parsedInput: { userId, activate } }) => {
    try {
      console.log(`${activate ? "Activating" : "Deactivating"} user with ID: ${userId}`)

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

      const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
      const response = await fetch(`${apiUrl}/usermanagement/activate-deactivate-user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          isActivate: activate,
        }),
      })
      console.log(JSON.stringify({
        id: userId,
        isActivate: activate,
      }))
      console.log(response)
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
          error: "You don't have permission to perform this action.",
          statusCode: 403,
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to ${activate ? "activate" : "deactivate"} user: ${response.statusText}`,
          statusCode: response.status,
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

      if (data.isSuccess) {
        return {
          success: true,
          message: `User ${activate ? "activated" : "deactivated"} successfully`,
        }
      } else {
        return {
          success: false,
          error: data.error || data.message || `Failed to ${activate ? "activate" : "deactivate"} user`,
          statusCode: data.statCode || response.status,
        }
      }
    } catch (error) {
      console.error(`Error ${activate ? "activating" : "deactivating"} user:`, error)
      return {
        success: false,
        error: `An unexpected error occurred while ${activate ? "activating" : "deactivating"} the user`,
      }
    }
  })

// Server action to delete a user
export const deleteUserAction = actionClient.schema(deleteUserSchema).action(async ({ parsedInput: { userId } }) => {
  try {
    console.log(`Deleting user with ID: ${userId}`)

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

    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    const response = await fetch(`${apiUrl}/usermanagement/delete-user?UserId=${userId}`, {
      // This is now the full ID
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
        error: "You don't have permission to perform this action.",
        statusCode: 403,
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to delete user: ${response.statusText}`,
        statusCode: response.status,
      }
    }

    // Safely parse the JSON response
    let data
    try {
      const text = await response.text()
      data = text ? JSON.parse(text) : {}
      console.log(data)
    } catch (parseError) {
      console.error("Error parsing API response:", parseError)
      return {
        success: false,
        error: `Server returned status ${response.status} with invalid response format`,
        statusCode: response.status,
      }
    }

    if (data.isSuccess) {
      return {
        success: true,
        message: "User deleted successfully",
      }
    } else {
      return {
        success: false,
        error: data.error || data.message || "Failed to delete user",
        statusCode: data.statCode || response.status,
      }
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      success: false,
      error: "An unexpected error occurred while deleting the user",
    }
  }
})

// Server action to get a single user
export const getUserAction = actionClient.schema(getUserSchema).action(async ({ parsedInput: { userId, userType } }) => {
  try {
    console.log(`Getting ${userType} user with ID: ${userId}`)

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

    const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
    const endpoint = userType === "Individual"
      ? `/customermanagement/get-user/${userId}`
      : `/customermanagement/get-business-user/${userId}`
    
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
        error: "You don't have permission to access this user.",
        statusCode: 403,
      }
    }

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to get user details: ${response.statusText}`,
        statusCode: response.status,
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

    if (data.isSuccess) {
      return {
        success: true,
        user: data.result,
      }
    } else {
      return {
        success: false,
        error: data.error || data.message || "Failed to get user details",
        statusCode: data.statCode || response.status,
      }
    }
  } catch (error) {
    console.error("Error getting user details:", error)
    return {
      success: false,
      error: "An unexpected error occurred while getting user details",
    }
  }
})

// Server action to get all users
export const getAllUsersAction = actionClient
  .schema(getAllUsersSchema)
  .action(async ({ parsedInput: { pageSize, pageNumber, userType } }) => {
    try {
      console.log(`Getting all ${userType} users, page ${pageNumber}, size ${pageSize}`)

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

      const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
      const endpoint = userType === "Individual"
        ? "/customermanagement/get-all-individual-users"
        : "/customermanagement/get-all-business-users"
      
      // Create the request body as expected by the API
      const requestBody = {
        pageSize: pageSize,
        pageNumber: pageNumber,
        searchParams: {}  // Optional search parameters
      }
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
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
          error: "You don't have permission to view users.",
          statusCode: 403,
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to get users: ${response.statusText}`,
          statusCode: response.status,
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

      if (data.isSuccess) {
        // The result structure matches the Swagger documentation
        return {
          success: true,
          users: data.result.data || [],
          totalCount: data.result.totalCount || 0,
          totalPages: data.result.totalPages || 0,
          currentPage: pageNumber,
          pageSize: pageSize,
          isSuccessful: data.result.isSuccessful,
          responseMessage: data.result.responseMessage,
          responseCode: data.result.responseCode
        }
      } else {
        return {
          success: false,
          error: data.error || data.message || "Failed to get users",
          statusCode: data.statCode || response.status,
        }
      }
    } catch (error) {
      console.error("Error getting users:", error)
      return {
        success: false,
        error: "An unexpected error occurred while getting users",
      }
    }
  })

// Server action to export users
export const exportUsersAction = actionClient
  .schema(exportUsersSchema)
  .action(async ({ parsedInput: { userType, format } }) => {
    try {
      console.log(`Exporting ${userType} users in ${format} format`)

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

      const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
      let endpoint = ""
      
      if (userType === "Individual" && format === "csv") {
        endpoint = "/customermanagement/export-individual-users-csv"
      } else if (userType === "Individual" && format === "pdf") {
        endpoint = "/customermanagement/export-individual-users-pdf"
      } else if (userType === "Business" && format === "csv") {
        endpoint = "/customermanagement/export-business-users-csv"
      } else if (userType === "Business" && format === "pdf") {
        endpoint = "/customermanagement/export-business-users-pdf"
      }
      
      // Create the request body as expected by the API
      const requestBody = {
        pageSize: 100, // Export a large number of records
        pageNumber: 0,  // Start from the first page
        searchParams: {}  // Optional search parameters
      }
      
      // Selected fields can be passed as query params if needed
      // const queryParams = new URLSearchParams();
      // queryParams.append('selectedFields', 'field1,field2,field3');
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
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
          error: "You don't have permission to export users.",
          statusCode: 403,
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to export users: ${response.statusText}`,
          statusCode: response.status,
        }
      }

      // Get the file data
      const fileData = format === "csv" ? await response.text() : await response.arrayBuffer()
      const fileExtension = format === "csv" ? "csv" : "pdf"
      const fileType = format === "csv" ? "text/csv" : "application/pdf"
      const fileName = `${userType}-users-${new Date().toISOString().split("T")[0]}.${fileExtension}`

      return {
        success: true,
        data: fileData,
        fileName,
        fileType,
      }
    } catch (error) {
      console.error("Error exporting users:", error)
      return {
        success: false,
        error: "An unexpected error occurred while exporting users",
      }
    }
  })

