"use server"

import { actionClient } from "@/lib/safe-action"
import { cookies } from "next/headers"
import { z } from "zod"

// Schema for workflow approval/rejection
const workflowApprovalSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  approved: z.boolean(),
  comment: z.string().optional(),
})

export type WorkflowApprovalInput = z.infer<typeof workflowApprovalSchema>

export type WorkflowApprovalResponse = {
  success: boolean
  message: string
  error?: string
  statusCode?: number
}

// Workflow Approval/Rejection Action
export const approveWorkflowAction = actionClient
  .schema(workflowApprovalSchema)
  .action(async ({ parsedInput }): Promise<WorkflowApprovalResponse> => {
    try {
      // Get access token from cookies
      const cookieStore = await cookies()
      const accessToken = cookieStore.get("accessToken")?.value

      if (!accessToken) {
        return {
          success: false,
          error: "Authentication required. Please log in again.",
          statusCode: 401,
          message: "Authentication required"
        }
      }

      const apiUrl = process.env.API_URL || ""
      
      const response = await fetch(`${apiUrl}/usermanagement/Workflow/approve-workflow`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: parsedInput.requestId,
          approved: parsedInput.approved,
          comment: parsedInput.comment || "",
        }),
      })

      console.log("Workflow approval response status:", response.status)
      const data = await response.json()
      console.log("Workflow approval response data:", data)

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to ${parsedInput.approved ? "approve" : "reject"} workflow: ${response.statusText}`,
          statusCode: response.status,
          message: `Failed to ${parsedInput.approved ? "approve" : "reject"} workflow`
        }
      }

      if (data.isSuccess) {
        return {
          success: true,
          message: data.message || `Workflow ${parsedInput.approved ? "approved" : "rejected"} successfully`,
          statusCode: 200
        }
      } else {
        return {
          success: false,
          error: data.error || data.message || `Failed to ${parsedInput.approved ? "approve" : "reject"} workflow`,
          statusCode: data.statCode || response.status,
          message: `Failed to ${parsedInput.approved ? "approve" : "reject"} workflow`
        }
      }
    } catch (error) {
      console.error("Workflow approval error:", error)
      return {
        success: false,
        error: `An unexpected error occurred while ${parsedInput.approved ? "approving" : "rejecting"} workflow`,
        message: "An unexpected error occurred"
      }
    }
  })
