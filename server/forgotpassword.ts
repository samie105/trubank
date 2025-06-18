"use server"

import { actionClient } from "@/lib/safe-action"
import { cookies } from "next/headers"
import { z } from "zod"

const email = z.object({
  email: z.string().email(),
})

export const forgotPasswordAction = actionClient.schema(email).action(async ({ parsedInput: { email } }) => {
  try {
    console.log("Sending forgot password request for:", email)

    // Call the actual API endpoint
    const response = await fetch(`${process.env.API_URL}/usermanagement/otp/generate-otp?reqType=1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailAddress: email,
        customerType: 3, // Using the customerType from the example
      }),
    })

    console.log("API response status:", response.status)
    const data = await response.json()
    console.log("API response data:", JSON.stringify(data, null, 2))

    // Check if the request was successful
    if (response.ok && data.isSuccess && data.statCode === 200) {
      // Store email in cookies for subsequent requests with a longer expiration
      const cookieStore = await cookies()
      cookieStore.set("email", email, {
        maxAge: 30 * 60, // 30 minutes expiry
        path: "/",
      })

      // If the API returns an OTP in the response (for development/testing)
      if (data.result?.otp) {
        // Store the OTP in a cookie with a longer expiration
        cookieStore.set("otp", data.result.otp, {
          httpOnly: true, // Make it HTTP-only for security
          maxAge: 30 * 60, // 30 minutes expiry
          path: "/",
        })

        // Also store in localStorage through a client-side script
        // This will be handled in the client component
      }

      return {
        success: true,
        message: data.message || "Reset instructions sent to your email",
        otp: data.result?.otp, // Pass the OTP to the client for storage if available
      }
    } else {
      // Handle error cases
      return {
        error: true,
        message: data.error || data.message || "Failed to send reset instructions",
      }
    }
  } catch (error) {
    console.error("Forgot password error:", error)
    return {
      error: true,
      message: "An error occurred. Please try again.",
    }
  }
})

const otpSchema = z.object({
  otp: z.string().length(4),
  email: z.string().email().optional(), // Allow email to be passed from client
})

export const verifyOtpAction = actionClient
  .schema(otpSchema)
  .action(async ({ parsedInput: { otp, email: clientEmail } }) => {
    try {
      // Get the stored email or use the one passed from client
      const cookieStore = await cookies()
      const email = clientEmail || cookieStore.get("email")?.value

      if (!email) {
        return {
          error: true,
          message: "Session expired. Please restart the password reset process.",
        }
      }

      // In a real implementation, you would call the API to verify the OTP
      // For now, we'll check against the stored OTP (if available) or use the default
      const storedOtp = cookieStore.get("otp")?.value

      if (storedOtp && otp !== storedOtp) {
        return {
          error: true,
          message: "OTP code is invalid, check and try again",
        }
      }

      // If we don't have a stored OTP (it was sent via email), we'll simulate verification
      // In production, you would call the API to verify the OTP
      if (!storedOtp) {
        // Call the API to verify OTP (this is a placeholder - replace with actual endpoint)
        const response = await fetch(`${process.env.API_URL}/usermanagement/otp/verify-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailAddress: email,
            otp: otp,
            customerType: 3,
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.isSuccess) {
          return {
            error: true,
            message: data.error || data.message || "OTP verification failed",
          }
        }
      }

      // Store the verified OTP with a longer expiration
      cookieStore.set("verifiedOtp", otp, {
        maxAge: 30 * 60, // 30 minutes
        path: "/",
      })

      // Set a flag indicating OTP is verified
      cookieStore.set("otpVerified", "true", {
        maxAge: 30 * 60, // 30 minutes
        path: "/",
      })

      return {
        success: true,
        message: "OTP verified successfully",
        // Return these values so they can be stored in localStorage as backup
        email: email,
        otp: otp,
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      return {
        error: true,
        message: "An error occurred during verification. Please try again.",
      }
    }
  })

export const resendOtpAction = actionClient.schema(email).action(async ({ parsedInput: { email } }) => {
  try {
    // Call the same API endpoint to regenerate OTP
    const response = await fetch(`${process.env.API_URL}/usermanagement/otp/generate-otp?reqType=1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailAddress: email,
        customerType: 3,
      }),
    })

    const data = await response.json()

    if (response.ok && data.isSuccess) {
      // If the API returns an OTP in the response (for development/testing)
      if (data.result?.otp) {
        const cookieStore = await cookies()
        cookieStore.set("otp", data.result.otp, {
          httpOnly: true,
          maxAge: 30 * 60, // 30 minutes
          path: "/",
        })
      }

      return {
        success: true,
        message: "OTP resent successfully",
        otp: data.result?.otp, // Pass the OTP to the client for storage if available
      }
    } else {
      return {
        error: true,
        message: data.error || data.message || "Failed to resend OTP",
      }
    }
  } catch (error) {
    console.error("Resend OTP error:", error)
    return {
      error: true,
      message: "An error occurred. Please try again.",
    }
  }
})

// Updated schema to match the API requirements
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    // Allow these to be passed from client storage as fallback
    email: z.string().email().optional(),
    otp: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { password, email: clientEmail, otp: clientOtp } }) => {
    try {
      // Get the stored email and OTP from cookies
      const cookieStore = await cookies()
      const email = cookieStore.get("email")?.value || clientEmail
      const otp = cookieStore.get("verifiedOtp")?.value || cookieStore.get("otp")?.value || clientOtp

      if (!email) {
        return {
          error: true,
          message: "Email not found. Please restart the password reset process.",
        }
      }

      if (!otp) {
        return {
          error: true,
          message: "OTP not found. Please restart the password reset process.",
        }
      }

      console.log("Resetting password for:", email, "with OTP:", otp)

      // Create FormData for the request
      const formData = new FormData();
      formData.append("Username", email);
      formData.append("ResetCode", otp);
      formData.append("NewPassword", password);
      formData.append("customerType", "3"); // Using the customerType from the example

      // Call the API to reset password with FormData
      const response = await fetch(`${process.env.API_URL}/usermanagement/auth/reset-password`, {
        method: "POST",
        // No Content-Type header needed - browser will set it automatically with boundary
        body: formData,
      })

      console.log("Reset password API response status:", response.status)
      const data = await response.json()
      console.log("Reset password API response:", JSON.stringify(data, null, 2))

      if (response.ok && data.isSuccess && data.statCode === 200) {
        // Clear all reset-related cookies
        cookieStore.set("email", "", { maxAge: 0, path: "/" })
        cookieStore.set("otp", "", { maxAge: 0, path: "/" })
        cookieStore.set("verifiedOtp", "", { maxAge: 0, path: "/" })
        cookieStore.set("otpVerified", "", { maxAge: 0, path: "/" })

        return {
          success: true,
          message: data.message || "Password reset successfully",
        }
      } else {
        return {
          error: true,
          message: data.error || data.message || "Failed to reset password",
        }
      }
    } catch (error) {
      console.error("Reset password error:", error)
      return {
        error: true,
        message: "An error occurred. Please try again.",
      }
    }
  })

