"use server"

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { cookies } from "next/headers";

// Schema for editing admin user
const editAdminUserSchema = z.object({
  userId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  emailAddress: z.string().email("Valid email is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  gender: z.string().min(1, "Gender is required"),
  roleId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  headOfDepartment: z.number().int().optional(),
  capacityId: z.string().uuid().optional(),
  positionId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  viewAllTeamAct: z.boolean().optional(),
  viewAllDepartmentAct: z.boolean().optional(),
  profilePicture: z.instanceof(File).optional(), // Optional profile picture file
});

export type EditAdminUserInput = z.infer<typeof editAdminUserSchema>;

export type EditAdminUserResponse = {
  isSuccess: boolean;
  result: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    gender: string;
    roleId: string;
    teamId: string;
    departmentId: string;
    headOfDepartment: number;
    capacityId: string;
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

export const editAdminUserAction = actionClient
  .schema(editAdminUserSchema)
  .action(async ({ parsedInput }): Promise<EditAdminUserResponse> => {
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
            gender: "",
            roleId: "",
            teamId: "",
            departmentId: "",
            headOfDepartment: 0,
            capacityId: "",
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

      const { userId, ...requestData } = parsedInput;
      const apiUrl = process.env.API_URL || "";
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("firstName", requestData.firstName);
      formData.append("lastName", requestData.lastName);
      formData.append("emailAddress", requestData.emailAddress);
      formData.append("phoneNumber", requestData.phoneNumber);
      formData.append("gender", requestData.gender);
      
      // Add optional fields if they exist
      if (requestData.roleId) formData.append("roleId", requestData.roleId);
      if (requestData.teamId) formData.append("teamId", requestData.teamId);
      if (requestData.departmentId) formData.append("departmentId", requestData.departmentId);
      if (requestData.headOfDepartment !== undefined) formData.append("headOfDepartment", requestData.headOfDepartment.toString());
      if (requestData.capacityId) formData.append("capacityId", requestData.capacityId);
      if (requestData.positionId) formData.append("positionId", requestData.positionId);
      if (requestData.branchId) formData.append("branchId", requestData.branchId);
      if (requestData.viewAllTeamAct !== undefined) formData.append("viewAllTeamAct", requestData.viewAllTeamAct.toString());
      if (requestData.viewAllDepartmentAct !== undefined) formData.append("viewAllDepartmentAct", requestData.viewAllDepartmentAct.toString());
      
      // Add profile picture if provided
      if (requestData.profilePicture) {
        formData.append("profilePicture", requestData.profilePicture);
      }
      
      const response = await fetch(`${apiUrl}/usermanagement/edit-admin?UserId=${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
      console.log("editAdminUserAction formData:", Object.fromEntries(formData.entries()));
      const data = await response.json();
      console.log("editAdminUserAction raw API response:", data);

      return {
        isSuccess: data.isSuccess,
        result: data.result,
        message: data.message,
        error: data.error,
        statCode: data.statCode,
      };
    } catch (error) {
      console.error("editAdminUserAction error:", error);
      return {
        isSuccess: false,
        result: {
          firstName: "",
          lastName: "",
          emailAddress: "",
          phoneNumber: "",
          gender: "",
          roleId: "",
          teamId: "",
          departmentId: "",
          headOfDepartment: 0,
          capacityId: "",
          positionId: "",
          branchId: "",
          viewAllTeamAct: false,
          viewAllDepartmentAct: false,
          profilePicture: "",
        },
        message: "Unexpected error",
        error: String(error),
        statCode: 500,
      };
    }
  });

// Schema for activate/deactivate admin user
const activateDeactivateAdminSchema = z.object({
  id: z.string().uuid(),
  isActivate: z.boolean(),
});

export type ActivateDeactivateAdminInput = z.infer<typeof activateDeactivateAdminSchema>;

export type ActivateDeactivateAdminResponse = {
  isSuccess: boolean;
  result: boolean;
  message: string;
  error: string;
  statCode: number;
};

export const activateDeactivateAdminAction = actionClient
  .schema(activateDeactivateAdminSchema)
  .action(async ({ parsedInput }): Promise<ActivateDeactivateAdminResponse> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return {
          isSuccess: false,
          result: false,
          message: "Authentication required",
          error: "No token",
          statCode: 401,
        };
      }

      const apiUrl = process.env.API_URL || "";
      
      const response = await fetch(`${apiUrl}/usermanagement/activate-deactivate-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(parsedInput),
      });

      const data = await response.json();
      console.log("activateDeactivateAdminAction raw API response:", data);

      return {
        isSuccess: data.isSuccess,
        result: data.result,
        message: data.message,
        error: data.error,
        statCode: data.statCode,
      };
    } catch (error) {
      console.error("activateDeactivateAdminAction error:", error);
      return {
        isSuccess: false,
        result: false,
        message: "Unexpected error",
        error: String(error),
        statCode: 500,
      };
    }
  });

// Schema for delete admin user
const deleteAdminUserSchema = z.object({
  userId: z.string().uuid(),
});

export type DeleteAdminUserInput = z.infer<typeof deleteAdminUserSchema>;

export type DeleteAdminUserResponse = {
  isSuccess: boolean;
  result: boolean;
  message: string;
  error: string;
  statCode: number;
};

export const deleteAdminUserAction = actionClient
  .schema(deleteAdminUserSchema)
  .action(async ({ parsedInput }): Promise<DeleteAdminUserResponse> => {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      if (!accessToken) {
        return {
          isSuccess: false,
          result: false,
          message: "Authentication required",
          error: "No token",
          statCode: 401,
        };
      }

      const apiUrl = process.env.API_URL || "";
      
      const response = await fetch(`${apiUrl}/usermanagement/delete-user?UserId=${parsedInput.userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      console.log("deleteAdminUserAction raw API response:", data);

      return {
        isSuccess: data.isSuccess,
        result: data.result,
        message: data.message,
        error: data.error,
        statCode: data.statCode,
      };
    } catch (error) {
      console.error("deleteAdminUserAction error:", error);
      return {
        isSuccess: false,
        result: false,
        message: "Unexpected error",
        error: String(error),
        statCode: 500,
      };
    }
  }); 