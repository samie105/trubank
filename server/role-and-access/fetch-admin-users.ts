"use server"

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

// Schema for the request payload. Keeping it consistent with other list endpoints
const fetchAdminUsersSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchParams: z.record(z.string()).optional().default({}),
});

export type FetchAdminUsersInput = z.infer<typeof fetchAdminUsersSchema>;

export interface AdminUserApi {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  emailAddress: string;
  phoneNumber: string;
  isActive: boolean;
  role?: { id: string; name: string };
  team?: { id: string; name: string };
  department?: { id: string; name: string };
  position?: { id: string; name: string };
  branch?: { id: string; name: string; branchCode: string };
  profile_picture?: { file: string; fileName: string; fileType: string };
}

export type FetchAdminUsersSuccess = {
  success: true;
  data: AdminUserApi[];
  totalCount: number;
  totalPages: number;
};

export type FetchAdminUsersError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const fetchAdminUsersAction = actionClient
  .schema(fetchAdminUsersSchema)
  .action(async ({ parsedInput }): Promise<FetchAdminUsersSuccess | FetchAdminUsersError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/get-all-admin-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });

      // Log the raw response object for debugging purposes (user preference)
      console.log("Admin users response", response);

      const { status } = response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any = {};
      try {
        data = await response.json();
        // Log the parsed body for debugging (user preference)
        console.log("Admin users response body", data.result.data);
      } catch {
        /* non-JSON response */
      }

      // Some endpoints wrap the payload in a `result` object; handle both cases.
      const res = data as Record<string, unknown>;
      const payload = (res.result as Record<string, unknown>) ?? res;

      if (status !== 200) {
        return {
          success: false,
          error: (payload?.responseMessage as string) || response.statusText,
          statusCode: status,
        };
      }

      return {
        success: true,
        data: (payload.data as AdminUserApi[]) ?? [],
        totalCount: (payload.totalCount as number) ?? 0,
        totalPages: (payload.totalPages as number) ?? 0,
      };
    } catch (error) {
      console.error("fetchAdminUsersAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  }); 