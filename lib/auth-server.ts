// Server-side auth utilities
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Check if user is authenticated on the server
export async function getServerAuthStatus() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value
  return { isAuthenticated: !!accessToken }
}

// Get user info from cookies on the server
export async function getServerUserInfo() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get("userInfo")?.value

  if (!userInfoCookie) return null

  try {
    return JSON.parse(userInfoCookie)
  } catch (error) {
    console.error("Error parsing user info:", error)
    return null
  }
}

// Server action to log out
export async function logoutAction() {
  "use server"

  // Get cookie store with await
  const cookieStore = await cookies()

  // Set cookies with empty values and immediate expiration
  cookieStore.set("accessToken", "", {
    maxAge: 0,
    path: "/",
  })

  cookieStore.set("userInfo", "", {
    maxAge: 0,
    path: "/",
  })

  return { success: true }
}

// Check if user has specific permission
export async function checkServerPermission(permission: string) {
  const userInfo = await getServerUserInfo()
  if (!userInfo) return false

  return userInfo.permissions.some((p: string) => p.toLowerCase() === permission.toLowerCase())
}

// Protect a route - use in server components/pages
export async function requireAuth() {
  const { isAuthenticated } = await getServerAuthStatus()

  if (!isAuthenticated) {
    redirect("/auth/login")
  }
}

