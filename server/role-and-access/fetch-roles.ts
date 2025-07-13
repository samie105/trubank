/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

const fetchRolesSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchParams: z.record(z.string()).optional().default({}),
});

export type FetchRolesInput = z.infer<typeof fetchRolesSchema>;

export type RoleApi = {
  id: string;
  roleName: string;
  roleDescription: string;
  permissions: string[];
};

export type FetchRolesSuccess = {
  success: true;
  data: RoleApi[];
  totalCount: number;
  totalPages: number;
};

export type FetchRolesError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const fetchRolesAction = actionClient
  .schema(fetchRolesSchema)
  .action(async ({ parsedInput }): Promise<FetchRolesSuccess | FetchRolesError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/general/get-roles-permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });

      const rawResponse = await response.clone().json().catch(() => ({}));
      console.log("fetchRolesAction raw API response:", rawResponse);

      const status = response.status;
      let data: unknown = {};
      try {
        data = await response.json();
      } catch {
        /* json parse error */
      }
      const resData = data as Record<string, unknown>;

      // The API wraps the response in isSuccess/result structure
      if (resData.isSuccess && resData.result) {
        const result = resData.result as {
          data?: RoleApi[];
          isSuccessful?: boolean;
          totalCount?: number;
          totalPages?: number;
          responseMessage?: string;
        };
        
        if (result.isSuccessful) {
          return {
            success: true,
            data: (result.data as RoleApi[]) ?? [],
            totalCount: (result.totalCount as number) ?? 0,
            totalPages: (result.totalPages as number) ?? 0,
          };
        }
      }

      // Handle error cases
      const result = resData.result as Record<string, unknown>;
      return {
        success: false,
        error: (result?.responseMessage as string) || (resData?.message as string) || response.statusText,
        statusCode: status,
      };
    } catch (error) {
      console.error("fetchRolesAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  }); 

// Create Role API
const createRoleSchema = z.object({
  role: z.string().min(1),
  roleDescription: z.string().min(1),
  permissions: z.array(z.string()).min(1),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

export const createRoleAction = actionClient
  .schema(createRoleSchema)
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
      const response = await fetch(`${apiUrl}/usermanagement/Workflow/create-roles-permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });
      console.log('createRoleAction input:', parsedInput);
      const data = await response.json();
      console.log('createRoleAction response:', data);
      return data;
    } catch (error) {
      console.error("createRoleAction error", error);
      return { isSuccess: false, result: "", message: "Unexpected error", error: String(error), statCode: 500 };
    }
  });

// Fetch Permissions API
const fetchPermissionsSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(0),
  searchParams: z.record(z.string()).optional().default({}),
});

export type FetchPermissionsInput = z.infer<typeof fetchPermissionsSchema>;

export type PermissionApi = {
  id: string;
  name: string;
  createdAt: string;
};

export type FetchPermissionsSuccess = {
  success: true;
  data: PermissionApi[];
  totalCount: number;
  totalPages: number;
};

export type FetchPermissionsError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const fetchPermissionsAction = actionClient
  .schema(fetchPermissionsSchema)
  .action(async ({ parsedInput }): Promise<FetchPermissionsSuccess | FetchPermissionsError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }
      const apiUrl = process.env.API_URL || "";
      
      const response = await fetch(`${apiUrl}/usermanagement/general/get-all-permissionss`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });
      const rawResponse = await response.clone().json().catch(() => ({}));
      console.log("fetchPermissionsAction raw API response:", rawResponse.result.data);
      const status = response.status;
      let data: unknown = {};
      try {
        data = await response.json();
      } catch {
        /* json parse error */
      }
      const resData = data as Record<string, unknown>;
      if (resData.isSuccess && resData.result) {
        const result = resData.result as PermissionApi[] | { data?: PermissionApi[]; isSuccessful?: boolean; totalCount?: number; totalPages?: number; responseMessage?: string; };
        if (Array.isArray(result)) {
          return {
            success: true,
            data: result,
            totalCount: result.length,
            totalPages: 1,
          };
        } else if ((result as any).isSuccessful) {
          return {
            success: true,
            data: ((result as any).data as PermissionApi[]) ?? [],
            totalCount: (result as any).totalCount ?? 0,
            totalPages: (result as any).totalPages ?? 0,
          };
        }
      }
      return {
        success: false,
        error: (resData?.message as string) || response.statusText,
        statusCode: status,
      };
    } catch (error) {
      console.error("fetchPermissionsAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  }); 