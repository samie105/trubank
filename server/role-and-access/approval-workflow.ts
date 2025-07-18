"use server"
import { cookies } from "next/headers";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

export interface WorkflowType {
  id: string;
  name: string;
}

export interface GetWorkflowTypesResult {
  data: WorkflowType[];
  isSuccessful: boolean;
  totalCount: number;
  totalPages: number;
  responseMessage: string;
  responseCode: string;
}

export interface GetWorkflowTypesResponse {
  isSuccess: boolean;
  result: GetWorkflowTypesResult;
  message: string | null;
  error: string | null;
  statCode: number;
}

export interface Position {
  id: string;
  name: string;
  createdAt: string;
}

export interface GetAllPositionsResult {
  data: Position[];
  isSuccessful: boolean;
  totalCount: number;
  totalPages: number;
  responseMessage: string;
  responseCode: string;
}

export interface GetAllPositionsResponse {
  isSuccess: boolean;
  result: GetAllPositionsResult;
  message: string | null;
  error: string | null;
  statCode: number;
}

export interface ApprovalLevel {
  order: number;
  departmentId: string;
  teamId: string;
  positionId: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  workflowTypeId: string;
  approvalLevels: ApprovalLevel[];
}

export interface CreateWorkflowResponse {
  isSuccess: boolean;
  result: string;
  message: string | null;
  error: string | null;
  statCode: number;
}

export const getWorkflowTypesAction = actionClient
  .schema(z.object({}))
  .action(async (): Promise<GetWorkflowTypesResponse> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { isSuccess: false, result: { data: [], isSuccessful: false, totalCount: 0, totalPages: 0, responseMessage: "Authentication required", responseCode: "401" }, message: "Authentication required", error: "No token", statCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/general/get-workflow-types`, {
        method: "GET",
        headers: {
          "Accept": "text/plain",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log('getWorkflowTypesAction response:', data);

      return { 
        isSuccess: data.isSuccess, 
        result: data.result as GetWorkflowTypesResult, 
        message: data.message, 
        error: data.error, 
        statCode: data.statCode 
      };
    } catch (error) {
      console.error("getWorkflowTypesAction error:", error);
      return { 
        isSuccess: false, 
        result: { data: [], isSuccessful: false, totalCount: 0, totalPages: 0, responseMessage: "Unexpected error", responseCode: "500" }, 
        message: "Unexpected error", 
        error: String(error), 
        statCode: 500 
      };
    }
  });

export const getAllPositionsAction = actionClient
  .schema(z.object({
    pageSize: z.number().optional().default(0),
    pageNumber: z.number().optional().default(0),
    searchParams: z.record(z.string()).optional().default({})
  }))
  .action(async ({ parsedInput }): Promise<GetAllPositionsResponse> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { isSuccess: false, result: { data: [], isSuccessful: false, totalCount: 0, totalPages: 0, responseMessage: "Authentication required", responseCode: "401" }, message: "Authentication required", error: "No token", statCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/general/get-all-positions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          pageSize: parsedInput.pageSize,
          pageNumber: parsedInput.pageNumber,
          searchParams: parsedInput.searchParams
        }),
      });

      const data = await response.json();
      console.log('getAllPositionsAction response:', data);

      return { 
        isSuccess: data.isSuccess, 
        result: data.result as GetAllPositionsResult, 
        message: data.message, 
        error: data.error, 
        statCode: data.statCode 
      };
    } catch (error) {
      console.error("getAllPositionsAction error:", error);
      return { 
        isSuccess: false, 
        result: { data: [], isSuccessful: false, totalCount: 0, totalPages: 0, responseMessage: "Unexpected error", responseCode: "500" }, 
        message: "Unexpected error", 
        error: String(error), 
        statCode: 500 
      };
    }
  });

export const createWorkflowAction = actionClient
  .schema(z.object({
    name: z.string(),
    description: z.string(),
    workflowTypeId: z.string(),
    approvalLevels: z.array(z.object({
      order: z.number(),
      departmentId: z.string(),
      teamId: z.string(),
      positionId: z.string()
    }))
  }))
  .action(async ({ parsedInput }): Promise<CreateWorkflowResponse> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { isSuccess: false, result: "", message: "Authentication required", error: "No token", statCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/Workflow/create-workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: parsedInput.name,
          description: parsedInput.description,
          workflowTypeId: parsedInput.workflowTypeId,
          approvalLevels: parsedInput.approvalLevels
        }),
      });

      const data = await response.json();
      console.log('createWorkflowAction response:', data);

      return { 
        isSuccess: data.isSuccess, 
        result: data.result, 
        message: data.message, 
        error: data.error, 
        statCode: data.statCode 
      };
    } catch (error) {
      console.error("createWorkflowAction error:", error);
      return { 
        isSuccess: false, 
        result: "", 
        message: "Unexpected error", 
        error: String(error), 
        statCode: 500 
      };
    }
  });