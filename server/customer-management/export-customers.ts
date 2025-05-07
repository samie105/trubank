"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

const exportSchema = z.object({
  customerType: z.enum(["individual", "business"]),
  format: z.enum(["csv", "pdf"]),
  pageSize: z.number().optional(),
  pageNumber: z.number().optional(),
  searchParams: z.record(z.string()).optional(),
})

export const exportCustomersAction = actionClient.schema(exportSchema).action(async ({ parsedInput }) => {
  try {
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
    
    // Determine the correct endpoint based on customer type and format
    const endpoint = parsedInput.customerType === "individual" 
      ? `/customermanagement/export-all-individual-users-${parsedInput.format}`
      : `/customermanagement/export-all-business-users-${parsedInput.format}`

    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pageSize: parsedInput.pageSize,
        pageNumber: parsedInput.pageNumber,
        searchParams: parsedInput.searchParams
      })
    })

    if (response.status === 401) {
      return {
        success: false,
        error: "Your session has expired. Please log in again.",
        statusCode: 401,
      }
    }

    const data = await response.text()

    if (response.ok) {
      return {
        success: true,
        data,
        filename: `${parsedInput.customerType}-customers-${new Date().toISOString().split("T")[0]}.${parsedInput.format}`
      }
    } else {
      return {
        success: false,
        error: "Failed to export customers",
        statusCode: response.status,
      }
    }
  } catch (error) {
    console.error("Error exporting customers:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

