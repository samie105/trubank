"use server";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

const fetchRequestLogSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchParams: z.record(z.string()).optional().default({}),
});

const exportRequestLogSchema = z.object({
  pageSize: z.number().optional().default(0),
  pageNumber: z.number().optional().default(0),
  searchParams: z.record(z.string()).optional().default({}),
  selectedFields: z.array(z.string()).optional(),
  selectedIds: z.array(z.string()).optional(),
});

export type FetchRequestLogInput = z.infer<typeof fetchRequestLogSchema>;
export type ExportRequestLogInput = z.infer<typeof exportRequestLogSchema>;

export interface ApprovalLog {
  order: number;
  approver: string;
  approverDepartment: string;
  approverTeam: string;
  positionId: string;
  comment: string;
  status: number;
  date: string;
}

export interface RequestLogApi {
  requestId: string;
  activityName: string;
  initiator: string;
  createdAt: string;
  workflowName: string;
  workflowId: string;
  activityType: string;
  status: string;
  approvals: ApprovalLog[];
}

export interface FetchRequestLogSuccess {
  success: true;
  data: RequestLogApi[];
  totalCount: number;
  totalPages: number;
}

export interface FetchRequestLogError {
  success: false;
  error: string;
  statusCode?: number;
}

export interface ExportRequestLogSuccess {
  success: true;
  data: string;
}

export interface ExportRequestLogError {
  success: false;
  error: string;
  statusCode?: number;
}

export const fetchRequestLogAction = actionClient
  .schema(fetchRequestLogSchema)
  .action(async ({ parsedInput }): Promise<FetchRequestLogSuccess | FetchRequestLogError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/general/get-workflow-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });
      // const rawResponse = await response.clone().json().catch(() => ({}));
      // console.log("fetchRequestLogAction raw API response:", rawResponse);

      const status = response.status;
      let data: unknown = {};
      try {
        data = await response.json();
      } catch {
        /* json parse error */
      }
      const resData = data as Record<string, unknown>;
      const result = resData.result as {
        data?: RequestLogApi[];
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
      console.log("fetchRequestLogAction result:", result.data);

      return {
        success: true,
        data: (result?.data as RequestLogApi[]) ?? [],
        totalCount: (result?.totalCount as number) ?? 0,
        totalPages: (result?.totalPages as number) ?? 0,
      };
    } catch (error) {
      console.error("fetchRequestLogAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  });

export const exportRequestLogCsvAction = actionClient
  .schema(exportRequestLogSchema)
  .action(async ({ parsedInput }): Promise<ExportRequestLogSuccess | ExportRequestLogError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const url = new URL(`${apiUrl}/usermanagement/Workflow/export-all-requestlogs-csv`);
      
      if (parsedInput.selectedFields && parsedInput.selectedFields.length > 0) {
        parsedInput.selectedFields.forEach(field => {
          url.searchParams.append("selectedFields", field);
        });
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          pageSize: parsedInput.pageSize,
          pageNumber: parsedInput.pageNumber,
          searchParams: parsedInput.searchParams,
          selectedIds: parsedInput.selectedIds,
        }),
      });
      
      const rawResponse = await response.clone().text().catch(() => "");
      console.log("exportRequestLogCsvAction raw API response:", rawResponse);

      const status = response.status;
      
      if (status !== 200) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.text();
          errorMessage = errorData || errorMessage;
        } catch {
          /* text parse error */
        }
        return {
          success: false,
          error: errorMessage,
          statusCode: status,
        };
      }

      const csvData = await response.text();
      return {
        success: true,
        data: csvData,
      };
    } catch (error) {
      console.error("exportRequestLogCsvAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  });

export const exportRequestLogPdfAction = actionClient
  .schema(exportRequestLogSchema)
  .action(async ({ parsedInput }): Promise<ExportRequestLogSuccess | ExportRequestLogError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const url = new URL(`${apiUrl}/usermanagement/Workflow/export-all-requestlogs-pdf`);
      
      if (parsedInput.selectedFields && parsedInput.selectedFields.length > 0) {
        parsedInput.selectedFields.forEach(field => {
          url.searchParams.append("selectedFields", field);
        });
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          pageSize: parsedInput.pageSize,
          pageNumber: parsedInput.pageNumber,
          searchParams: parsedInput.searchParams,
          selectedIds: parsedInput.selectedIds,
        }),
      });
      
      const rawResponse = await response.clone().text().catch(() => "");
      console.log("exportRequestLogPdfAction raw API response:", rawResponse);

      const status = response.status;
      
      if (status !== 200) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.text();
          errorMessage = errorData || errorMessage;
        } catch {
          /* text parse error */
        }
        return {
          success: false,
          error: errorMessage,
          statusCode: status,
        };
      }

      const pdfData = await response.text();
      return {
        success: true,
        data: pdfData,
      };
    } catch (error) {
      console.error("exportRequestLogPdfAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  });