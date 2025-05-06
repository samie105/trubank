// Client-side auth utilities
"use client"

import Cookies from "js-cookie"

// Type for user information
export type UserInfo = {
  email?: string
  userId?: string
  phoneNumber?: string
  customerType?: string
  userStatus: string
  roles: string[]
  permissions: string[]
}

// Get user info from the cookie
export function getUserInfo(): UserInfo | null {
  try {
    const userInfoCookie = Cookies.get("userInfo")
    if (!userInfoCookie) return null

    return JSON.parse(userInfoCookie) as UserInfo
  } catch (error) {
    console.error("Error parsing user info:", error)
    return null
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getUserInfo() !== null
}

// Check if user has specific role
export function hasRole(role: string): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  return userInfo.roles.some((r) => r.toLowerCase() === role.toLowerCase())
}

// Check if user has specific permission
export function hasPermission(permission: string): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  return userInfo.permissions.some((p) => p.toLowerCase() === permission.toLowerCase())
}

// Check if user has any of the given permissions
export function hasAnyPermission(permissions: string[]): boolean {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  return permissions.some((permission) =>
    userInfo.permissions.some((p) => p.toLowerCase() === permission.toLowerCase()),
  )
}

// Log out - clear cookies (needs to be used with a server action to clear HTTP-only cookies)
export function clientLogout() {
  Cookies.remove("userInfo")
}

