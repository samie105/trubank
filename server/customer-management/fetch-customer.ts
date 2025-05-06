"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"
import type { IndividualCustomer, BusinessCustomer } from "./fetch-customers"

// Define the schema for fetching a single customer
const fetchCustomerSchema = z.object({
  userId: z.string(),
  customerType: z.enum(["individual", "business"]),
})

export const fetchCustomerAction = actionClient
  .schema(fetchCustomerSchema)
  .action(async ({ parsedInput: { userId, customerType } }) => {
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

      // Determine the endpoint based on customer type
      const endpoint =
        customerType === "individual"
          ? `/customermanagement/get-individual-user?UserId=${userId}`
          : `/customermanagement/get-business-user?UserId=${userId}`

      // Call the API endpoint
      const apiUrl = process.env.API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
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
          error: "You don't have permission to access this resource.",
          statusCode: 403,
        }
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Customer not found.",
          statusCode: 404,
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

      // Check if the request was successful
      if (data.isSuccess && data.result) {
        return {
          success: true,
          data: data.result as (IndividualCustomer | BusinessCustomer),
        }
      } else {
        // Handle error cases
        return {
          success: false,
          error: data.error || data.message || "Failed to fetch customer details",
          statusCode: data.statCode || response.status,
        }
      }
    } catch (error) {
      console.error("Error fetching customer details:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }
    }
  })
