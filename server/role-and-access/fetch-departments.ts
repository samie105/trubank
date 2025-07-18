"use server"
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

// Request payload schema
const fetchDepartmentsSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchParams: z.record(z.string()).optional().default({}),
});

export type FetchDepartmentsInput = z.infer<typeof fetchDepartmentsSchema>;

type DepartmentApi = {
  id: string;
  name: string;
  description?: string;
  numberOfTeams: number;
  createdAt: string;
};

type FetchDepartmentsSuccess = {
  success: true;
  data: DepartmentApi[];
  totalCount: number;
  totalPages: number;
};

type FetchDepartmentsError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const fetchDepartmentsAction = actionClient
  .schema(fetchDepartmentsSchema)
  .action(async ({ parsedInput }): Promise<FetchDepartmentsSuccess | FetchDepartmentsError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/general/get-departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });
      const rawResponse = await response.clone().json().catch(() => ({}));
      console.log("fetchDepartmentsAction raw API response:", rawResponse);
     // console.log("response", response)

      const status = response.status;
      let data: unknown = {};
      try {
        data = await response.json();
      } catch {
        /* json parse error */
      }
      const resData = data as Record<string, unknown>;

      const result = resData.result as {
        data?: DepartmentApi[];
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
        data: (result?.data as DepartmentApi[]) ?? [],
        totalCount: (result?.totalCount as number) ?? 0,
        totalPages: (result?.totalPages as number) ?? 0,
      };
    } catch (error) {
      console.error("fetchDepartmentsAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  });

// Create Department API
const createDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const createDepartmentAction = actionClient
  .schema(createDepartmentSchema)
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
      const response = await fetch(`${apiUrl}/usermanagement/Workflow/create-department`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });
      const data = await response.json();
      console.log("createDepartmentAction data", data);
      return data;
    } catch (error) {
      console.error("createDepartmentAction error", error);
      return { isSuccess: false, result: "", message: "Unexpected error", error: String(error), statCode: 500 };
    }
  });

// Update Department API
const updateDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  id: z.string().min(1),
});

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const updateDepartmentAction = actionClient
  .schema(updateDepartmentSchema)
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

      const apiUrl = process.env.API_URL ;
      const response = await fetch(`${apiUrl}/usermanagement/Workflow/update-department`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });
      console.log('updateDepartmentAction input:', parsedInput);
      const data = await response.json();
      console.log('updateDepartmentAction response:', data);
      return data;
    } catch (error) {
      console.error("updateDepartmentAction error", error);
      return { isSuccess: false, result: "", message: "Unexpected error", error: String(error), statCode: 500 };
    }
  });

// Export Departments CSV/PDF
const exportDepartmentsSchema = z.object({
  pageSize: z.number(),
  pageNumber: z.number(),
  searchParams: z.record(z.string()),
  selectedFields: z.array(z.string()).optional(),
  selectedIds: z.array(z.string()).optional(),
});

export type ExportDepartmentsInput = z.infer<typeof exportDepartmentsSchema>;

export const exportDepartmentsCsvAction = actionClient
  .schema(exportDepartmentsSchema)
  .action(async ({ parsedInput }): Promise<string> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        throw new Error("Authentication required");
      }
      const apiUrl = process.env.API_URL || "";
      const url = `${apiUrl}/usermanagement/Workflow/export-all-departments-csv`;
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
      console.log('exportDepartmentsCsvAction response:', text);
      return text;
    } catch (error) {
      console.error("exportDepartmentsCsvAction error", error);
      throw error;
    }
  });

export const exportDepartmentsPdfAction = actionClient
  .schema(exportDepartmentsSchema)
  .action(async ({ parsedInput }): Promise<string> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        throw new Error("Authentication required");
      }
      const apiUrl = process.env.API_URL || "";
      const url = `${apiUrl}/usermanagement/Workflow/export-all-departments-pdf`;
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
      console.log('exportDepartmentsPdfAction response:', text);
      return text;
    } catch (error) {
      console.error("exportDepartmentsPdfAction error", error);
      throw error;
    }
  }); 