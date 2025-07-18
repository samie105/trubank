"use server"

import { actionClient } from "@/lib/safe-action";
import { cookies } from "next/headers";
import { z } from "zod";

// Schema for export admins with optional selected IDs
const exportAdminsSchema = z.object({
  selectedIds: z.array(z.string()).optional(),
});

export type ExportAdminsInput = z.infer<typeof exportAdminsSchema>;

export type ExportAdminsSuccess = {
  success: true;
  fileData: string; // Could be CSV/Excel base64 or presigned URL depending on backend
};

export type ExportAdminsError = {
  success: false;
  error: string;
  statusCode?: number;
};

export const exportAdminUsersAction = actionClient
  .schema(exportAdminsSchema)
  .action(async ({ parsedInput }): Promise<ExportAdminsSuccess | ExportAdminsError> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return { success: false, error: "Authentication required", statusCode: 401 };
      }

      const apiUrl = process.env.API_URL || "";
      const response = await fetch(`${apiUrl}/usermanagement/export-all-admin-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ selectedIds: parsedInput.selectedIds }),
      });

      console.log("Export admins raw response", response);

      const { status } = response;
      let text = "";
      try {
        text = await response.text();
        console.log("Export admins response body", text);
      } catch {
        /* text parse err */
      }

      if (status !== 200) {
        return {
          success: false,
          error: text || response.statusText,
          statusCode: status,
        };
      }

      return {
        success: true,
        fileData: text,
      };
    } catch (error) {
      console.error("exportAdminUsersAction error", error);
      return { success: false, error: "Unexpected error" };
    }
  }); 