"use server"

import { actionClient } from "@/lib/safe-action"
import { cookies } from "next/headers"
import { z } from "zod"

// Define types for the API responses
export interface LedgerType {
  id: string
  name: string
}

export interface ProductType {
  id: string
  name: string
}

export interface Currency {
  id: string
  name: string
  currencyCode: string
}

export interface GeneralLedger {
  id: string
  branchId: string
  ledgerTypeId: string
  parentAccountId: string
  ledgerName: string
  ledgerCode: string
  currencyCode: string
  balance: number
  controlAccount: boolean
  postingRule: number
  subAccounts: string[]
  customerAccounts: CustomerAccount[]
}

export interface CustomerAccount {
  id: string
  accountName: string
  accountNumber: string
  productTypeId: string
  currencyCode: string
  subLedgerId: string
  branchId: string
  balance: number
  balanceDate: string
  customerId: string
  subAccounts: string[]
}

// Reconciliation interfaces
export interface ReconciliationTransaction {
  transactionRef: string
  transactionDate: string
  amount: number
  transactionType: string
  status: string
  description: string
  firstAccount: string
  secondAccount: string
}

export interface ReconciliationResult {
  isSuccess: boolean
  result: ReconciliationTransaction[]
  message: string
  error: string
  statCode: number
}

interface ApiResponse<T> {
  isSuccess: boolean
  result: T[]
  message: string
  error: string
  statCode: number
}

// Schema for getting ledger types (no input needed)
const getLedgerTypesSchema = z.object({})

// Schema for getting product types (no input needed)
const getProductTypesSchema = z.object({})

// Schema for creating a new ledger type
const createLedgerTypeSchema = z.object({
  name: z.string().min(1, "Account type name is required"),
})

// Schema for getting general ledger (no input needed)
const getGeneralLedgerSchema = z.object({})

// Schema for getting currencies (no input needed)
const getCurrenciesSchema = z.object({})

export const getLedgerTypesAction = actionClient
  .schema(getLedgerTypesSchema)
  .action(async () => {
    try {
      console.log("Fetching ledger types...")
      
      // Get the access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("Access token not found. Please login again.")
      }

      // Call the API endpoint
      const response = await fetch(`${process.env.API_URL}/accountmanagement/Get-ledger-types`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
      })

      console.log("API response status:", response.status)
      const data: ApiResponse<LedgerType> = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("Ledger types fetched successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "Ledger types fetched successfully",
        }
      } else {
        console.error("Failed to fetch ledger types:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to fetch ledger types")
      }
    } catch (error) {
      console.error("Error fetching ledger types:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

export const getProductTypesAction = actionClient
  .schema(getProductTypesSchema)
  .action(async () => {
    try {
      console.log("Fetching product types...")
      
      // Get the access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("Access token not found. Please login again.")
      }

      // Call the API endpoint
      const response = await fetch(`${process.env.API_URL}/accountmanagement/Get-product-types`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
      })

      console.log("API response status:", response.status)
      const data: ApiResponse<ProductType> = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("Product types fetched successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "Product types fetched successfully",
        }
      } else {
        console.error("Failed to fetch product types:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to fetch product types")
      }
    } catch (error) {
      console.error("Error fetching product types:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

export const createLedgerTypeAction = actionClient
  .schema(createLedgerTypeSchema)
  .action(async ({ parsedInput: { name } }) => {
    try {
      console.log("Creating ledger type:", name)
      
      // Get the access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("Access token not found. Please login again.")
      }

      // Call the API endpoint (assuming the endpoint exists based on RESTful patterns)
      const response = await fetch(`${process.env.API_URL}/accountmanagement/Create-ledger-type`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
        body: JSON.stringify({ name }),
      })

      console.log("API response status:", response.status)
      const data: ApiResponse<LedgerType> = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("Ledger type created successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "Ledger type created successfully",
        }
      } else {
        console.error("Failed to create ledger type:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to create ledger type")
      }
    } catch (error) {
      console.error("Error creating ledger type:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

export const getGeneralLedgerAction = actionClient
  .schema(getGeneralLedgerSchema)
  .action(async () => {
    try {
      console.log("Fetching general ledger...")
      
      // Get the access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("Access token not found. Please login again.")
      }

      // Call the API endpoint
      const response = await fetch(`${process.env.API_URL}/accountmanagement/Get-general-ledger`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
      })

      console.log("API response status:", response.status)
      const data: ApiResponse<GeneralLedger> = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("General ledger fetched successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "General ledger fetched successfully",
        }
      } else {
        console.error("Failed to fetch general ledger:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to fetch general ledger")
      }
    } catch (error) {
      console.error("Error fetching general ledger:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

export const getCurrenciesAction = actionClient
  .schema(getCurrenciesSchema)
  .action(async () => {
    try {
      console.log("Fetching currencies...")
      
      // Get the access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("Access token not found. Please login again.")
      }

      // Call the API endpoint
      const response = await fetch(`${process.env.API_URL}/accountmanagement/Get-currencies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
      })

      console.log("API response status:", response.status)
      const data: ApiResponse<Currency> = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("Currencies fetched successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "Currencies fetched successfully",
        }
      } else {
        console.error("Failed to fetch currencies:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to fetch currencies")
      }
    } catch (error) {
      console.error("Error fetching currencies:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

// Create General Ledger Schema
const createGeneralLedgerSchema = z.object({
  branchId: z.string().uuid("Branch ID must be a valid UUID"),
  ledgerCode: z.string().min(1, "Ledger code is required"),
  ledgerTypeId: z.string().uuid("Ledger type ID must be a valid UUID"),
  parentAccountId: z.string().uuid("Parent account ID must be a valid UUID").optional(),
  ledgerName: z.string().min(1, "Ledger name is required"),
  currencyId: z.string().uuid("Currency ID must be a valid UUID"),
  opening_balance: z.number().default(0),
  postingRule: z.number().min(1).max(2, "Posting rule must be 1 (Debit) or 2 (Credit)"),
})

// Update General Ledger Schema
const updateGeneralLedgerSchema = z.object({
  id: z.string().uuid("Ledger ID must be a valid UUID"),
  branchId: z.string().uuid("Branch ID must be a valid UUID"),
  ledgerTypeId: z.string().uuid("Ledger type ID must be a valid UUID"),
  parentAccountId: z.string().uuid("Parent account ID must be a valid UUID").optional(),
  ledgerName: z.string().min(1, "Ledger name is required"),
  currencyId: z.string().uuid("Currency ID must be a valid UUID"),
  postingRule: z.number().min(1).max(2, "Posting rule must be 1 (Debit) or 2 (Credit)"),
})

// Delete General Ledger Schema
const deleteGeneralLedgerSchema = z.object({
  id: z.string().uuid("Ledger ID must be a valid UUID"),
})

// Create General Ledger Action
export const createGeneralLedgerAction = actionClient
  .schema(createGeneralLedgerSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("Creating general ledger with data:", parsedInput)

      // Get access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.")
      }

      // Call the API endpoint
      const response = await fetch(`${process.env.API_URL}/accountmanagement/create-general-ledger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
        body: JSON.stringify(parsedInput),
      })

      console.log("API response status:", response.status)
      const data = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("General ledger created successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "General ledger created successfully",
        }
      } else {
        console.error("Failed to create general ledger:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to create general ledger")
      }
    } catch (error) {
      console.error("Error creating general ledger:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

// Update General Ledger Action
export const updateGeneralLedgerAction = actionClient
  .schema(updateGeneralLedgerSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("Updating general ledger with data:", parsedInput)

      // Get access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.")
      }

      // Call the API endpoint
      const response = await fetch(`${process.env.API_URL}/accountmanagement/update-ledger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
        body: JSON.stringify(parsedInput),
      })

      console.log("API response status:", response.status)
      const data = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("General ledger updated successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "General ledger updated successfully",
        }
      } else {
        console.error("Failed to update general ledger:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to update general ledger")
      }
    } catch (error) {
      console.error("Error updating general ledger:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

// Delete General Ledger Action
export const deleteGeneralLedgerAction = actionClient
  .schema(deleteGeneralLedgerSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("Deleting general ledger with ID:", parsedInput.id)

      // Get access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.")
      }

      // Call the API endpoint - the API expects the ID as a string in the request body
      const response = await fetch(`${process.env.API_URL}/accountmanagement/delete-ledger`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
        body: JSON.stringify(parsedInput.id), // Send the ID as a string directly
      })

      console.log("API response status:", response.status)
      const data = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("General ledger deleted successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "General ledger deleted successfully",
        }
      } else {
        console.error("Failed to delete general ledger:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to delete general ledger")
      }
    } catch (error) {
      console.error("Error deleting general ledger:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

// Get General Ledgers by Customer ID Schema
const getGeneralLedgersByCustomerIdSchema = z.object({
  customerId: z.string().uuid("Customer ID must be a valid UUID"),
})

// Get General Ledgers by Customer ID Action
export const getGeneralLedgersByCustomerIdAction = actionClient
  .schema(getGeneralLedgersByCustomerIdSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("Fetching general ledgers for customer ID:", parsedInput.customerId)

      // Get access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("No access token found. Please log in again.")
      }

      // Call the API endpoint
      const response = await fetch(`${process.env.API_URL}/accountmanagement/Get-all-general-ledgers-by-customer-Id?customerId=${parsedInput.customerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
      })

      console.log("API response status:", response.status)
      const data = await response.json()
      console.log("API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (data.statCode === 200 && data.isSuccess) {
        console.log("General ledgers by customer ID fetched successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "General ledgers fetched successfully",
        }
      } else {
        console.error("Failed to fetch general ledgers by customer ID:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to fetch general ledgers by customer ID")
      }
    } catch (error) {
      console.error("Error fetching general ledgers by customer ID:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred")
    }
  })

// Schema for reconciliation input
const reconciliationSchema = z.object({
  firstAccount: z.string().min(1, "First account code is required"),
  secondAccount: z.string().min(1, "Second account code is required"),
})

// Reconciliation Result Interface
export interface ReconciliationTransaction {
  transactionRef: string
  transactionDate: string
  amount: number
  transactionType: string
  status: string
  description: string
  firstAccount: string
  secondAccount: string
}

export interface ReconciliationResult {
  isSuccess: boolean
  result: ReconciliationTransaction[]
  message: string
  error: string
  statCode: number
}

// Reconcile ledgers action
export const reconcileLedgersAction = actionClient
  .schema(reconciliationSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("Reconciling ledgers:", parsedInput)
      
      // Get the access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        throw new Error("Access token not found. Please login again.")
      }

      // Call the reconciliation API endpoint
      const response = await fetch(`${process.env.API_URL}/accountmanagement/Reconciliation/reconcile-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          accept: "application/json",
        },
        body: JSON.stringify({
          firstAccount: parsedInput.firstAccount,
          secondAccount: parsedInput.secondAccount
        })
      })

      console.log("Reconciliation API response status:", response.status)
      const data: ReconciliationResult = await response.json()
      console.log("Reconciliation API response data:", JSON.stringify(data, null, 2))

      // Check if the request was successful
      if (response.ok && data.isSuccess) {
        console.log("Ledgers reconciled successfully")
        return {
          success: true,
          data: data.result,
          message: data.message || "Ledgers reconciled successfully",
          totalTransactions: data.result?.length || 0
        }
      } else {
        console.error("Failed to reconcile ledgers:", data.error || data.message)
        throw new Error(data.error || data.message || "Failed to reconcile ledgers")
      }
    } catch (error) {
      console.error("Error reconciling ledgers:", error)
      throw new Error(error instanceof Error ? error.message : "An unexpected error occurred during reconciliation")
    }
  })
