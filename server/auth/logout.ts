"use server"

import { actionClient } from "@/lib/safe-action"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const logoutAction = actionClient.action(async () => {
  try {
    // Get cookie store
    const cookieStore = await cookies()

    // Clear all authentication-related cookies
    cookieStore.set("accessToken", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
    })

    cookieStore.set("userInfo", "", {
      maxAge: 0,
      path: "/",
    })

    // Clear any other session-related cookies if they exist
    cookieStore.set("email", "", {
      maxAge: 0,
      path: "/",
    })

    cookieStore.set("otp", "", {
      maxAge: 0,
      path: "/",
    })

    cookieStore.set("verifiedOtp", "", {
      maxAge: 0,
      path: "/",
    })

    cookieStore.set("otpVerified", "", {
      maxAge: 0,
      path: "/",
    })

    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { success: false, error: "An error occurred during logout" }
  }
})

// Simple redirect function for logout
export async function logoutAndRedirect() {
  "use server"
  
  // Clear cookies
  const cookieStore = await cookies()
  
  cookieStore.set("accessToken", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
  })

  cookieStore.set("userInfo", "", {
    maxAge: 0,
    path: "/",
  })

  // Redirect to login page
  redirect("/auth/login")
}
