/**
 * Formats activity type strings by converting camelCase/PascalCase to readable text
 * Example: "CreateRolesAndPermissions" -> "Create Roles And Permissions"
 * @param activityType - The activity type string to format
 * @returns Formatted activity type string
 */
export function formatActivityType(activityType: string): string {
  if (!activityType) return ""
  
  // Add space before uppercase letters, except for the first character
  const formatted = activityType.replace(/([a-z])([A-Z])/g, '$1 $2')
  
  // Capitalize first letter if not already capitalized
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * Formats status text for better readability
 * @param status - The status string to format
 * @returns Formatted status string
 */
export function formatStatus(status: string): string {
  if (!status) return ""
  
  // Convert to title case and replace underscores/hyphens with spaces
  return status
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}
