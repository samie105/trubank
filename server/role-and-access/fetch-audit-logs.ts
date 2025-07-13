"use server"

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

// Request payload schema matches other list endpoints
const fetchAuditLogsSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchParams: z.record(z.string()).optional().default({}),
});

export type FetchAuditLogsInput = z.infer<typeof fetchAuditLogsSchema>;

export interface AuditLogApi {
  id: string;
  date: string; // ISO or formatted string from API
  fullName: string;
  emailAddress: string;
  action: string;
}

export type FetchAuditLogsSuccess = {
  success: true;
  data: AuditLogApi[];
  totalCount: number;
  totalPages: number;
};

export type FetchAuditLogsError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const fetchAuditLogsAction = actionClient
  .schema(fetchAuditLogsSchema)
  .action(async ({ parsedInput }): Promise<FetchAuditLogsSuccess | FetchAuditLogsError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/get-all-audit-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });

      console.log("Audit logs raw response", response);

      const { status } = response;
      let data: unknown = {};
      try {
        data = await response.json();
        // user preference: log parsed body
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log("Audit logs response body", (data as any).result?.data ?? data);
      } catch {
        /* ignore parse error */
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = (data as any).result ?? data;

      if (status !== 200) {
        return {
          success: false,
          error: (payload?.responseMessage as string) || response.statusText,
          statusCode: status,
        };
      }

      return {
        success: true,
        data: (payload.data as AuditLogApi[]) ?? [],
        totalCount: (payload.totalCount as number) ?? 0,
        totalPages: (payload.totalPages as number) ?? 0,
      };
    } catch (error) {
      console.error("fetchAuditLogsAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  }); 