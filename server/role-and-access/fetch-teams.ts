"use server"

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

const fetchTeamsSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchParams: z.record(z.string()).optional().default({}),
});

export type FetchTeamsInput = z.infer<typeof fetchTeamsSchema>;

export type TeamApi = {
  id: string;
  name: string;
  description: string;
  department: string;
  departmentId: string;
  createdAt: string;
};

export type FetchTeamsSuccess = {
  success: true;
  data: TeamApi[];
  totalCount: number;
  totalPages: number;
};

export type FetchTeamsError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const fetchTeamsAction = actionClient
  .schema(fetchTeamsSchema)
  .action(async ({ parsedInput }): Promise<FetchTeamsSuccess | FetchTeamsError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/general/get-teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });

      console.log("Teams response", response);
      const status = response.status;
      let data: unknown = {};
      try {
        data = await response.json();
      } catch {
        /* ignore */
      }
      const resData = data as Record<string, unknown>;
console.log(resData.result)
      const result = resData.result as {
        data?: TeamApi[];
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
        data: (result?.data as TeamApi[]) ?? [],
        totalCount: (result?.totalCount as number) ?? 0,
        totalPages: (result?.totalPages as number) ?? 0,
      };
    } catch (error) {
      console.error("fetchTeamsAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  });

// Create Team API
const createTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.string().min(1),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const createTeamAction = actionClient
  .schema(createTeamSchema)
  .action(async ({ parsedInput }): Promise<{
    isSuccess: boolean;
    result: string;
    message: string;
    error: string;
    statCode: number;
  }> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { isSuccess: false, result: "", message: "Authentication required", error: "No token", statCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/Workflow/create-teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });
      console.log(parsedInput)
      const data = await response.json();
      console.log('createTeamAction data:', data);
      return data;
    } catch (error) {
      console.error("createTeamAction error", error);
      return { isSuccess: false, result: "", message: "Unexpected error", error: String(error), statCode: 500 };
    }
  });

// Update Team API
const updateTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.string().min(1),
  id: z.string().min(1),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

export const updateTeamAction = actionClient
  .schema(updateTeamSchema)
  .action(async ({ parsedInput }): Promise<{
    isSuccess: boolean;
    result: string;
    message: string;
    error: string;
    statCode: number;
  }> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { isSuccess: false, result: "", message: "Authentication required", error: "No token", statCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/Workflow/update-team`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });
      console.log('updateTeamAction input:', parsedInput);
      const data = await response.json();
      console.log('updateTeamAction response:', data);
      return data;
    } catch (error) {
      console.error("updateTeamAction error", error);
      return { isSuccess: false, result: "", message: "Unexpected error", error: String(error), statCode: 500 };
    }
  });

// Export Teams CSV
const exportTeamsSchema = z.object({
  pageSize: z.number(),
  pageNumber: z.number(),
  searchParams: z.record(z.string()),
  selectedFields: z.array(z.string()).optional(),
  selectedIds: z.array(z.string()).optional(),
});

export type ExportTeamsInput = z.infer<typeof exportTeamsSchema>;

export const exportTeamsCsvAction = actionClient
  .schema(exportTeamsSchema)
  .action(async ({ parsedInput }): Promise<string> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        throw new Error("Authentication required");
      }
      const apiUrl = process.env.API_URL || "";
      const url = `${apiUrl}/usermanagement/Workflow/export-all-teams-csv`;
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
          selectedIds: parsedInput.selectedIds,
        }),

      });
      const text = await response.text();
      console.log('exportTeamsCsvAction response:', text);
      return text;
    } catch (error) {
      console.error("exportTeamsCsvAction error", error);
      throw error;
    }
  });

// Export Teams PDF
export const exportTeamsPdfAction = actionClient
  .schema(exportTeamsSchema)
  .action(async ({ parsedInput }): Promise<string> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        throw new Error("Authentication required");
      }
      const apiUrl = process.env.API_URL || "";
      const url = `${apiUrl}/usermanagement/Workflow/export-all-teams-pdf`;
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
          selectedIds: parsedInput.selectedIds,
        }),
      });
      const text = await response.text();
      console.log('exportTeamsPdfAction response:', text);
      return text;
    } catch (error) {
      console.error("exportTeamsPdfAction error", error);
      throw error;
    }
  }); 