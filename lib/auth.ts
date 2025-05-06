import { cookies } from "next/headers"

export async function getServerSession() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  return accessToken ? { accessToken } : null
}

// Client-side auth check
export function isAuthenticated() {
  if (typeof window === "undefined") return false

  const userStatus = sessionStorage.getItem("userStatus")
  return !!userStatus
}

// Check if user has specific role
export function hasRole(role: string) {
  if (typeof window === "undefined") return false

  const rolesStr = sessionStorage.getItem("userRoles")
  if (!rolesStr) return false

  try {
    const roles = JSON.parse(rolesStr)
    return Array.isArray(roles) && roles.includes(role)
  } catch (e) {
    return e
  }
}

// Check if user has specific permission
export function hasPermission(permission: string) {
  if (typeof window === "undefined") return false

  const permissionsStr = sessionStorage.getItem("userPermissions")
  if (!permissionsStr) return false

  try {
    const permissions = JSON.parse(permissionsStr)
    return Array.isArray(permissions) && permissions.includes(permission)
  } catch (e) {
    return e
  }
}

