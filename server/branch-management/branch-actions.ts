"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

// Define the schema for branch data
const branchSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Branch name is required"),
  address: z.string().min(1, "Branch address is required"),
})

export type Branch = z.infer<typeof branchSchema>

// In-memory storage for branches (simulating a database)
let branches: Branch[] = [
  { id: "1", name: "ONIPANU BRANCH", address: "13, Adeniyi Jones Avenue Onipanu, Lagos State Nigeria" },
  { id: "2", name: "IKORODU BRANCH", address: "18, Adeniyi Jones Avenue Ikorodu, Lagos State Nigeria" },
  { id: "3", name: "LEKKI BRANCH", address: "05, Adeniyi Jones Avenue Lekki, Lagos State Nigeria" },
  { id: "4", name: "FADEYI BRANCH", address: "13, Adeniyi Jones Avenue Fadeyi, Lagos State Nigeria" },
  { id: "5", name: "SHOMOLU BRANCH", address: "19, Adeniyi Jones Avenue Shomolu, Lagos State Nigeria" },
  { id: "6", name: "IKEJA BRANCH", address: "23, Adeniyi Jones Avenue Ikeja, Lagos State, Nigeria" },
]

// Create branch action
export const createBranchAction = actionClient.schema(branchSchema).action(async ({ parsedInput }) => {
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
    const response = await fetch(`${apiUrl}/accountmanagement/create-branches`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsedInput)
    })

    if (response.status === 401) {
      return {
        success: false,
        error: "Your session has expired. Please log in again.",
        statusCode: 401,
      }
    }

    const data = await response.json()

    if (data.isSuccess) {
      return {
        success: true,
        message: "Branch created successfully",
        branch: data.result,
      }
    } else {
      return {
        success: false,
        error: data.error || data.message || "Failed to create branch",
        statusCode: data.statCode || response.status,
      }
    }
  } catch (error) {
    console.error("Error creating branch:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

// Update branch action
export const updateBranchAction = actionClient.schema(branchSchema).action(async ({ parsedInput }) => {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!parsedInput.id) {
      return {
        success: false,
        error: "Branch ID is required for updating",
      }
    }

    // Find the branch index
    const branchIndex = branches.findIndex((branch) => branch.id === parsedInput.id)

    if (branchIndex === -1) {
      return {
        success: false,
        error: "Branch not found",
      }
    }

    // Update the branch
    branches[branchIndex] = {
      ...parsedInput,
      id: parsedInput.id,
    }

    return {
      success: true,
      message: "Branch updated successfully",
      branch: branches[branchIndex],
    }
  } catch (error) {
    console.error("Error updating branch:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

// Delete branch action
export const deleteBranchAction = actionClient.schema(z.object({ id: z.string() })).action(async ({ parsedInput }) => {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Find the branch index
    const branchIndex = branches.findIndex((branch) => branch.id === parsedInput.id)

    if (branchIndex === -1) {
      return {
        success: false,
        error: "Branch not found",
      }
    }

    // Remove the branch
    const deletedBranch = branches[branchIndex]
    branches = branches.filter((branch) => branch.id !== parsedInput.id)

    return {
      success: true,
      message: "Branch deleted successfully",
      branch: deletedBranch,
    }
  } catch (error) {
    console.error("Error deleting branch:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

// Get all branches action
export const getBranchesAction = actionClient.action(async () => {
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
    const response = await fetch(`${apiUrl}/accountmanagement/Get-branches`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    })

    if (response.status === 401) {
      return {
        success: false,
        error: "Your session has expired. Please log in again.",
        statusCode: 401,
      }
    }

    const data = await response.json()

    if (data.isSuccess) {
      return {
        success: true,
        branches: data.result,
      }
    } else {
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

