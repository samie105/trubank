"use server";

import { actionClient } from "@/lib/safe-action";
import { cookies } from "next/headers";
import { z } from "zod";

// ... (previous loginAction code)

const email = z.object({
  email: z.string().email(),
});

export const forgotPasswordAction = actionClient
  .schema(email)
  .action(async ({ parsedInput: { email } }) => {
    // Simulate sending reset instructions
    const success = await new Promise((resolve) =>
      setTimeout(() => resolve(email === "samsonrichfield@gmail.com"), 2000)
    );
    if (!success) {
      return { error: true, message: "Account not found" };
    }

    (await cookies()).set("email", email);
    return { success: true };
  });

const otpSchema = z.object({
  otp: z.string().length(4),
});

export const verifyOtpAction = actionClient
  .schema(otpSchema)
  .action(async ({ parsedInput: { otp } }) => {
    const defaultOtp = "1234";
    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (otp !== defaultOtp) {
      return {
        error: true,
        message: "OTP code is invalid, check and try again",
      };
    }
    return { success: true, message: "OTP verified successfully" };
  });

export const resendOtpAction = actionClient
  .schema(email)
  .action(async ({ parsedInput: { email } }) => {
    // Simulate resending OTP
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true, message: "OTP resent successfully" };
  });

const resetPasswordSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { password } }) => {
    try {
      // Simulate password reset
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true, message: "Password reset successfully" };
    } catch (error) {
      return { error: true, message: "Failed to reset password" };
    }
  });
