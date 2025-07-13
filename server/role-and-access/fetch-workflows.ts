"use server"

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

const fetchWorkflowsSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchParams: z.record(z.string()).optional().default({}),
});

export type FetchWorkflowsInput = z.infer<typeof fetchWorkflowsSchema>;

export type WorkflowApi = {
  id: string;
  name: string;
  type: string;
  approvalCount: number;
  createdAt: string;
};

export type FetchWorkflowsSuccess = {
  success: true;
  data: WorkflowApi[];
  totalCount: number;
  totalPages: number;
};

export type FetchWorkflowsError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const fetchWorkflowsAction = actionClient
  .schema(fetchWorkflowsSchema)
  .action(async ({ parsedInput }): Promise<FetchWorkflowsSuccess | FetchWorkflowsError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/general/get-workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });

      const status = response.status;
      let json: unknown = {};
      try {
        json = await response.json();
      } catch {/* ignore */}
      const resData = json as Record<string, unknown>;
console.log(resData)
      const result = resData.result as {
        data?: WorkflowApi[];
        isSuccessful?: boolean;
        totalCount?: number;
        totalPages?: number;
        responseMessage?: string;
      };
      if (status !== 200 || !result?.isSuccessful) {
        return {
          success: false,
          error: (result?.responseMessage as string) || (resData?.responseMessage as string) || response.statusText,
          statusCode: status,
        };
      }

      return {
        success: true,
        data: result.data ?? [],
        totalCount: result.totalCount ?? 0,
        totalPages: result.totalPages ?? 0,
      };
    } catch (error) {
      console.error("fetchWorkflowsAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  });

// Export Workflows CSV/PDF
const exportWorkflowsSchema = z.object({
  pageSize: z.number(),
  pageNumber: z.number(),
  searchParams: z.record(z.string()),
  selectedFields: z.array(z.string()).optional(),
});

export type ExportWorkflowsInput = z.infer<typeof exportWorkflowsSchema>;

export const exportWorkflowsCsvAction = actionClient
  .schema(exportWorkflowsSchema)
  .action(async ({ parsedInput }): Promise<string> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        throw new Error("Authentication required");
      }
      const apiUrl = process.env.API_URL || "";
      const url = `${apiUrl}/usermanagement/Workflow/export-all-workflows-csv`;
      const params = new URLSearchParams();
      if (parsedInput.selectedFields) {
        parsedInput.selectedFields.forEach(f => params.append('selectedFields', f));
      }
      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          pageSize: parsedInput.pageSize,
          pageNumber: parsedInput.pageNumber,
          searchParams: parsedInput.searchParams,
        }),
      });
      const text = await response.text();
      console.log('exportWorkflowsCsvAction response:', text); // Log raw response
      return text;
    } catch (error) {
      console.error("exportWorkflowsCsvAction error", error);
      throw error;
    }
  });

export const exportWorkflowsPdfAction = actionClient
  .schema(exportWorkflowsSchema)
  .action(async ({ parsedInput }): Promise<string> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        throw new Error("Authentication required");
      }
      const apiUrl = process.env.API_URL || "";
      const url = `${apiUrl}/usermanagement/Workflow/export-all-workflows-pdf`;
      const params = new URLSearchParams();
      if (parsedInput.selectedFields) {
        parsedInput.selectedFields.forEach(f => params.append('selectedFields', f));
      }
      const response = await fetch(`${url}?${params.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          pageSize: parsedInput.pageSize,
          pageNumber: parsedInput.pageNumber,
          searchParams: parsedInput.searchParams,
        }),
      });
      const text = await response.text();
      console.log('exportWorkflowsPdfAction response:', text); // Log raw response
      return text;
    } catch (error) {
      console.error("exportWorkflowsPdfAction error", error);
      throw error;
    }
  }); 