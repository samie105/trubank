import type { Metadata } from "next"
import { requireAuth } from "@/server/auth/auth-server"
import BranchManagement from "@/components/dashboard/branch-management/branchmanagement"

export const metadata: Metadata = {
  title: "Branch Management | TruBank",
  description: "Manage bank branches",
}

export default async function BranchManagementPage() {
  // Ensure the user is authenticated
  await requireAuth()

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Branch Management</h1>
      <BranchManagement />
    </div>
  )
}

