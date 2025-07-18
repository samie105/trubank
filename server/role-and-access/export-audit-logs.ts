"use server"

import { actionClient } from "@/lib/safe-action";
import { cookies } from "next/headers";
import { z } from "zod";

const exportAuditLogsSchema = z.object({
  pageSize: z.number().optional().default(100),
  pageNumber: z.number().optional().default(1),
  searchParams: z.record(z.string()).optional().default({}),
  selectedFields: z.array(z.string()).optional(),
  selectedIds: z.array(z.string()).optional(),
});

export type ExportAuditLogsInput = z.infer<typeof exportAuditLogsSchema>;

export type ExportAuditLogsSuccess = {
  success: true;
  fileData: string;
};

export type ExportAuditLogsError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const exportAuditLogsCsvAction = actionClient
  .schema(exportAuditLogsSchema)
  .action(async ({ parsedInput }): Promise<ExportAuditLogsSuccess | ExportAuditLogsError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }
      const apiUrl = process.env.API_URL || "";
      const url = `${apiUrl}/usermanagement/general/export-all-auditlog-csv`;
      const params = parsedInput.selectedFields ? `?selectedFields=${parsedInput.selectedFields.join(",")}` : "";
      const response = await fetch(url + params, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...parsedInput,
          selectedIds: parsedInput.selectedIds,
        }),
      });
      console.log("Export audit logs CSV raw response", response);
      let text = "";
      try {
        text = await response.text();
        console.log("Export audit logs CSV response body", text);
      } catch {}
      if (response.status !== 200) {
        return { success: false, error: text || response.statusText, statusCode: response.status };
      }
      return { success: true, fileData: text };
    } catch (error) {
      console.error("exportAuditLogsCsvAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  });

export const exportAuditLogsPdfAction = actionClient
  .schema(exportAuditLogsSchema)
  .action(async ({ parsedInput }): Promise<ExportAuditLogsSuccess | ExportAuditLogsError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }
      const apiUrl = process.env.API_URL || "";
      const url = `${apiUrl}/usermanagement/general/export-all-auditlogs-pdf`;
      const params = parsedInput.selectedFields ? `?selectedFields=${parsedInput.selectedFields.join(",")}` : "";
      const response = await fetch(url + params, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...parsedInput,
          selectedIds: parsedInput.selectedIds,
        }),
      });
      console.log("Export audit logs PDF raw response", response);
      let text = "";
      try {
        text = await response.text();
        console.log("Export audit logs PDF response body", text);
      } catch {}
      if (response.status !== 200) {
        return { success: false, error: text || response.statusText, statusCode: response.status };
      }
      return { success: true, fileData: text };
    } catch (error) {
      console.error("exportAuditLogsPdfAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  }); 