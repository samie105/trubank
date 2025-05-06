"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for export parameters
const exportCustomersSchema = z.object({
  customerType: z.enum(["individual", "business"]),
})

export const exportCustomersAction = actionClient
  .schema(exportCustomersSchema)
  .action(async ({ parsedInput: { customerType } }) => {
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
          ? "/customermanagement/export-all-individual-users"
          : "/customermanagement/export-all-business-users"

      // Call the API endpoint
      const apiUrl = process.env.API_URL
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
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
          error: "You don't have permission to export customers.",
          statusCode: 403,
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to export customers: ${response.statusText}`,
          statusCode: response.status,
        }
      }

      // Get the CSV data
      const csvData = await response.text()

      // Return the CSV data
      return {
        success: true,
        data: csvData,
        filename: `${customerType}-customers-${new Date().toISOString().split("T")[0]}.csv`,
      }
    } catch (error) {
      console.error("Error exporting customers:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }
    }
  })

