"use server"

import { actionClient } from "@/lib/safe-action"
import { z } from "zod"
import { cookies } from "next/headers"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const loginAction = actionClient.schema(loginSchema).action(async ({ parsedInput: { email, password } }) => {
  console.log("Login attempt for:", email)

  try {
    console.log("Sending request to API...")
    // Call the API endpoint
    const response = await fetch(`${process.env.API_URL}/usermanagement/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
      },
      body: JSON.stringify({
        password: password,
        username: email,
      }),
    })

    console.log("API response status:", response.status)
    const data = await response.json()
    console.log("API response data:", JSON.stringify(data, null, 2))

    // Check if the request was successful based on statCode (200 is success)
    // Some APIs return isSuccess: true even with error statCodes
    if (data.statCode === 200 && data.isSuccess && data.result) {
      console.log("Login successful, setting cookies...")

      try {
        // Get cookie store with await since cookies() is async in Next.js 15
        console.log("Getting cookie store...")
        const cookieStore = await cookies()

        console.log("Setting accessToken cookie...")
        // Set access token in HTTP-only cookie
        cookieStore.set("accessToken", data.result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: new Date(data.result.expiresIn),
          path: "/",
        })

        console.log("Setting userInfo cookie...")
        // Store user info in a regular (non-HTTP-only) cookie
        const userInfo = {
          userStatus: data.result.userStatus,
          roles: data.result.roles,
          permissions: data.result.permissions,
        }

        cookieStore.set("userInfo", JSON.stringify(userInfo), {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: new Date(data.result.expiresIn),
          path: "/",
        })

        console.log("Cookies set successfully")
        return {
          success: true,
          userStatus: data.result.userStatus,
          roles: data.result.roles,
          permissions: data.result.permissions,
        }
      } catch (cookieError) {
        console.error("Error setting cookies:", cookieError)
        return {
          success: false,
          error: "Error setting authentication cookies",
        }
      }
    } else {
      // Handle case where statCode indicates an error or data.result is null
      console.error("Login failed:", data)

      // Determine the error message based on statCode
      let errorMessage = data.error || data.message || "Invalid credentials"

      // Handle specific error codes
      if (data.statCode === 400) {
        errorMessage = "Invalid username or password"
      } else if (data.statCode === 401) {
        errorMessage = "Unauthorized access"
      } else if (data.statCode === 403) {
        errorMessage = "Account locked or disabled"
      } else if (data.statCode === 404) {
        errorMessage = "User not found"
      } else if (data.statCode >= 500) {
        errorMessage = "Server error. Please try again later."
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "An error occurred during login. Please try again.",
    }
  }
})

