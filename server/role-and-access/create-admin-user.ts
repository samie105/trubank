"use server"

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

// Schema for creating admin user based on the API endpoint
const createAdminUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  emailAddress: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().optional(), // Optional password field
  gender: z.string().min(1, "Gender is required"),
  roleId: z.string().uuid("Valid role ID is required"),
  teamId: z.string().uuid("Valid team ID is required"),
  departmentId: z.string().uuid("Valid department ID is required"),
  positionId: z.string().uuid("Valid position ID is required"),
  branchId: z.string().uuid("Valid branch ID is required"),
  viewAllTeamAct: z.boolean(),
  viewAllDepartmentAct: z.boolean(),
  profilePicture: z.instanceof(File).optional(), // Optional profile picture file
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

export type CreateAdminUserResponse = {
  isSuccess: boolean;
  result: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    password: string;
    gender: string;
    roleId: string;
    teamId: string;
    departmentId: string;
    positionId: string;
    branchId: string;
    viewAllTeamAct: boolean;
    viewAllDepartmentAct: boolean;
    profilePicture: string;
  };
  message: string;
  error: string;
  statCode: number;
};

export const createAdminUserAction = actionClient
  .schema(createAdminUserSchema)
  .action(async ({ parsedInput }): Promise<CreateAdminUserResponse> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return {
          isSuccess: false,
          result: {
            firstName: "",
            lastName: "",
            emailAddress: "",
            phoneNumber: "",
            password: "",
            gender: "",
            roleId: "",
            teamId: "",
            departmentId: "",
            positionId: "",
            branchId: "",
            viewAllTeamAct: false,
            viewAllDepartmentAct: false,
            profilePicture: "",
          },
          message: "Authentication required",
          error: "No token",
          statCode: 401,
        };
      }

      const apiUrl = process.env.API_URL || "";
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("firstName", parsedInput.firstName);
      formData.append("lastName", parsedInput.lastName);
      formData.append("emailAddress", parsedInput.emailAddress);
      formData.append("phoneNumber", parsedInput.phoneNumber);
      formData.append("password", parsedInput.password || "");
      formData.append("gender", parsedInput.gender);
      formData.append("roleId", parsedInput.roleId || "");
      formData.append("teamId", parsedInput.teamId || "");
      formData.append("departmentId", parsedInput.departmentId || "");
      formData.append("positionId", parsedInput.positionId || "");
      formData.append("branchId", parsedInput.branchId || "");
      formData.append("viewAllTeamAct", parsedInput.viewAllTeamAct.toString());
      formData.append("viewAllDepartmentAct", parsedInput.viewAllDepartmentAct.toString());
      
      // Add profile picture if provided
      if (parsedInput.profilePicture) {
        formData.append("profilePicture", parsedInput.profilePicture);
      }

      const response = await fetch(`${apiUrl}/usermanagement/auth/register-admin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      console.log("createAdminUserAction formData:", Object.fromEntries(formData.entries()));
      const data = await response.json();
      console.log("createAdminUserAction raw API response:", data);

      return {
        isSuccess: data.isSuccess,
        result: data.result,
        message: data.message,
        error: data.error,
        statCode: data.statCode,
      };
    } catch (error) {
      console.error("createAdminUserAction error:", error);
      return {
        isSuccess: false,
        result: {
          firstName: "",
          lastName: "",
          emailAddress: "",
          phoneNumber: "",
          password: "",
          gender: "",
          roleId: "",
          teamId: "",
          departmentId: "",
          positionId: "",
          branchId: "",
          viewAllTeamAct: false,
          viewAllDepartmentAct: false,
          profilePicture: "",
        },
        message: "Failed to create admin user",
        error: error instanceof Error ? error.message : "Unknown error",
        statCode: 500,
      };
    }
  });
