"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"

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
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate a unique ID for the new branch
    const newBranch = {
      ...parsedInput,
      id: crypto.randomUUID()
    }

    // Add the new branch to our in-memory storage
    branches.push(newBranch)

    return {
      success: true,
      message: "Branch created successfully",
      branch: newBranch,
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
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      success: true,
      branches,
    }
  } catch (error) {
    console.error("Error fetching branches:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
})

