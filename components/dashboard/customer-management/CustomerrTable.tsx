/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Download,
  Settings,
  Upload,
  FileUp,
  User,
  Copy,
  Loader2,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ResponsiveModal, ResponsiveModalTrigger, ResponsiveModalContent, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalDescription } from "@/components/ui/dialog-2"
import { Label } from "@/components/ui/label"
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multiselector"
import { DateTimePicker } from "@/components/ui/date-picker"
import { PopoverClose } from "@radix-ui/react-popover"
import CustomerModalFormCreation from "./CustomerModalFormCreation"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { 
  type CustomerTableData, 
  type CustomerType, 
  type FetchCustomersInput
} from "@/server/customer-management/types"
import { fetchCustomersAction } from "@/server/customer-management/fetch-customers"
import { exportCustomersAction } from "@/server/customer-management/export-customers"
import { useRouter } from "next/navigation"
import { logoutAction } from "@/server/auth/auth-server"
import React from "react"
import { TableSkeleton } from "./table-skeleton"
import { Switch } from "@/components/ui/switch"
// Update imports to include the new server actions
import { activateUserAction, deleteUserAction } from "@/server/customer-management/customer-actions"
import { approveKycAction, rejectKycAction } from "@/server/customer-management/kyc-actions"
import { Textarea } from "@/components/ui/textarea"

// ActionCell component with Popover
function ActionCell({
  customer,
  onActivate,
  onDelete,
  onApproveKyc,
  onRejectKyc,
  isActivating,
  isDeleting,
  isApprovingKyc,
  isRejectingKyc,
}: {
  customer: CustomerTableData
  onActivate: (id: string, activate: boolean) => void
  onDelete: (id: string) => void
  onApproveKyc: (customerId: string, customerType: CustomerType) => void
  onRejectKyc: (customerId: string, customerType: CustomerType, rejectionComment: string) => void
  isActivating: string | null
  isDeleting: string | null
  isApprovingKyc: string | null
  isRejectingKyc: string | null
}) {
  const [open, setOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showKycApproveConfirm, setShowKycApproveConfirm] = useState(false)
  const [showKycRejectModal, setShowKycRejectModal] = useState(false)
  const [rejectionComment, setRejectionComment] = useState("")
  const router = useRouter()
  const isActive = customer.status === "active"

  // Create separate handler functions to avoid closure issues
  const handleActivate = () => {
    onActivate(customer.fullId, !isActive)
    setOpen(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
    setOpen(false)
  }

  const handleConfirmDelete = () => {
    onDelete(customer.fullId)
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleViewProfile = () => {
    router.push(`/dashboard/customer-management/view/${customer.type}/${customer.fullId}`)
    setOpen(false)
  }

  const handleEditUser = () => {
    router.push(`/dashboard/customer-management/edit/${customer.type.toLowerCase()}/${customer.fullId}`)
    setOpen(false)
  }

  const handleApproveKycClick = () => {
    setShowKycApproveConfirm(true)
    setOpen(false)
  }

  const handleRejectKycClick = () => {
    setShowKycRejectModal(true)
    setOpen(false)
  }

  const handleConfirmApproveKyc = () => {
    onApproveKyc(customer.fullId, customer.type as CustomerType)
    setShowKycApproveConfirm(false)
  }

  const handleConfirmRejectKyc = () => {
    if (rejectionComment.trim()) {
      onRejectKyc(customer.fullId, customer.type as CustomerType, rejectionComment)
      setShowKycRejectModal(false)
      setRejectionComment("")
    }
  }

  const handleCancelKycReject = () => {
    setShowKycRejectModal(false)
    setRejectionComment("")
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" type="button">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="end">
          <div className="py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted-foreground/10"
              onClick={handleViewProfile}
              type="button"
            >
              View Profile
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted-foreground/10"
              onClick={handleEditUser}
              type="button"
            >
              Edit User
            </button>
            {(customer.type === "Individual" || customer.type === "Business") && customer.kycStatus !== "Approved" && (
              <button
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-500/10"
                onClick={handleApproveKycClick}
                disabled={isApprovingKyc === customer.fullId}
                type="button"
              >
                {isApprovingKyc === customer.fullId ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving KYC...
                  </span>
                ) : (
                  "Approve KYC"
                )}
              </button>
            )}
            {(customer.type === "Individual" || customer.type === "Business") && customer.kycStatus !== "Rejected" && customer.kycStatus !== "Approved" && (
              <button
                className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-500/10"
                onClick={handleRejectKycClick}
                disabled={isRejectingKyc === customer.fullId}
                type="button"
              >
                {isRejectingKyc === customer.fullId ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting KYC...
                  </span>
                ) : (
                  "Reject KYC"
                )}
              </button>
            )}
            <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted-foreground/10">
              <span>{isActive ? "Deactivate" : "Activate"} User</span>
              <Switch checked={isActive} disabled={isActivating === customer.fullId} onCheckedChange={handleActivate} />
            </div>
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
              onClick={handleDeleteClick}
              disabled={isDeleting === customer.fullId}
              type="button"
            >
              {isDeleting === customer.fullId ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete User"
              )}
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Delete Confirmation Dialog */}
      <ResponsiveModal open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Confirm Deletion</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isDeleting === customer.fullId}
            >
              {isDeleting === customer.fullId ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete User"
              )}
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* KYC Approval Confirmation Dialog */}
      <ResponsiveModal open={showKycApproveConfirm} onOpenChange={setShowKycApproveConfirm}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Confirm KYC Approval</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Are you sure you want to approve the KYC for this {customer.type.toLowerCase()} customer?
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowKycApproveConfirm(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmApproveKyc}
              disabled={isApprovingKyc === customer.fullId}
            >
              {isApprovingKyc === customer.fullId ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </span>
              ) : (
                "Approve KYC"
              )}
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* KYC Rejection Modal */}
      <ResponsiveModal open={showKycRejectModal} onOpenChange={setShowKycRejectModal}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Reject KYC</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Please provide a reason for rejecting the KYC for this {customer.type.toLowerCase()} customer.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-comment">Reason for rejection</Label>
              <Textarea
                id="rejection-comment"
                placeholder="Enter the reason for KYC rejection..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancelKycReject}>
                Cancel
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleConfirmRejectKyc}
                disabled={!rejectionComment.trim() || isRejectingKyc === customer.fullId}
              >
                {isRejectingKyc === customer.fullId ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </span>
                ) : (
                  "Reject KYC"
                )}
              </Button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  )
}

// Memoize the ActionCell component to prevent unnecessary re-renders
const MemoizedActionCell = React.memo(ActionCell)

export default function CustomerTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [activeTab, setActiveTab] = useState<CustomerType>("Individual")
  const [filterSettings, setFilterSettings] = useState({
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    tierLevels: [] as string[],
    kycStatuses: [] as string[],
  })
  const params = useSearchParams()
  const isCreating = params.get("creating")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [individualCustomers, setIndividualCustomers] = useState<CustomerTableData[]>([])
  const [businessCustomers, setBusinessCustomers] = useState<CustomerTableData[]>([])
  const [isLoadingIndividual, setIsLoadingIndividual] = useState(false)
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isActivating, setIsActivating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isApprovingKyc, setIsApprovingKyc] = useState<string | null>(null)
  const [isRejectingKyc, setIsRejectingKyc] = useState<string | null>(null)
  const router = useRouter()
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  })

  // Action to handle logout
  const { execute: executeLogout } = useAction(logoutAction, {
    onSuccess() {
      router.push("/auth/login")
    },
  })

  // Handle logout
  const handleLogout = () => {
    executeLogout()
  }

  // Fetch individual customers action
  const { execute: fetchIndividualCustomers } = useAction(fetchCustomersAction, {
    onExecute() {
      setIsLoadingIndividual(true)
    },
    onSuccess(data) {
      if (data.data?.success && data.data.data) {
        setIndividualCustomers(data.data.data)
        
        if (data.data?.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalCount: data.data?.pagination?.totalCount || 0,
            totalPages: data.data?.pagination?.totalPages || 0,
          }))
        }
      } else if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex items-center justify-between gap-2">
            <p>{data.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(data.data?.error || "Failed to fetch individual customers")
      }
      setIsLoadingIndividual(false)
      setIsInitialLoad(false)
      setIsRefreshing(false)
    },
    onError(error: any) {
      toast.error(error.error?.serverError || "An error occurred while fetching individual customers")
      setIsLoadingIndividual(false)
      setIsInitialLoad(false)
      setIsRefreshing(false)
    },
  })

  // Fetch business customers action
  const { execute: fetchBusinessCustomers } = useAction(fetchCustomersAction, {
    onExecute() {
      setIsLoadingBusiness(true)
    },
    onSuccess(data) {
      if (data.data?.success && data.data.data) {
        setBusinessCustomers(data.data.data)
        
        if (data.data?.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalCount: data.data?.pagination?.totalCount || 0,
            totalPages: data.data?.pagination?.totalPages || 0,
          }))
        }
      } else if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex items-center justify-between gap-2">
            <p>{data.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(data.data?.error || "Failed to fetch business customers")
      }
      setIsLoadingBusiness(false)
      setIsInitialLoad(false)
      setIsRefreshing(false)
    },
    onError(error: any) {
      toast.error(error.error?.serverError || "An error occurred while fetching business customers")
      setIsLoadingBusiness(false)
      setIsInitialLoad(false)
      setIsRefreshing(false)
    },
  })

  // Action to handle user activation/deactivation
  const { execute: executeActivateUser } = useAction(activateUserAction, {
    onExecute(data) {
      setIsActivating(data.input.userId)
      const action = data.input.activate ? "Activating" : "Deactivating"
      toast.loading(`${action} user...`, { id: `user-status-${data.input.userId}` })
    },
    onSuccess(response) {
      toast.dismiss(`user-status-${response.input.userId}`)

      if (response.data?.success) {
        toast.success(
          response.data.message || `User ${response.input.activate ? "activated" : "deactivated"} successfully`,
        )

        // Refresh the customer data after successful activation/deactivation
        handleRefresh()
      } else if (response.data?.statusCode === 401 || response.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex items-center justify-between gap-2">
            <p>{response.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(response.data?.error || `Failed to ${response.input.activate ? "activate" : "deactivate"} user`)
      }
      setIsActivating(null)
    },
    onError(error) {
      if (error.input) {
        toast.dismiss(`user-status-${error.input.userId}`)
      }
      toast.error(error.error.serverError || "An error occurred while updating user status")
      setIsActivating(null)
    },
  })

  // Update the executeDeleteUser action
  const { execute: executeDeleteUser } = useAction(deleteUserAction, {
    onExecute(data) {
      setIsDeleting(data.input.userId)
      toast.loading("Deleting user...", { id: `delete-user-${data.input.userId}` })
    },
    onSuccess(response) {
      toast.dismiss(`delete-user-${response.input.userId}`)

      if (response.data?.success) {
        toast.success(response.data.message || "User deleted successfully")
        
        // Refresh the customer data after successful deletion
        handleRefresh()
      } else if (response.data?.statusCode === 401 || response.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex items-center justify-between gap-2">
            <p>{response.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(response.data?.error || "Failed to delete user")
      }
      setIsDeleting(null)
    },
    onError(error) {
      if (error.input) {
        toast.dismiss(`delete-user-${error.input.userId}`)
      }
      toast.error(error.error.serverError || "An error occurred while deleting the user")
      setIsDeleting(null)
    },
  })

  // Update the handler functions
  const handleActivateUser = (userId: string, activate: boolean) => {
    executeActivateUser({ userId, activate })
  }

  const handleDeleteUser = (userId: string) => {
    executeDeleteUser({ userId })
  }

  // KYC Approval Action
  const { execute: executeApproveKyc } = useAction(approveKycAction, {
    onExecute(data) {
      setIsApprovingKyc(data.input.customerId)
      toast.loading("Approving KYC...", { id: `kyc-approve-${data.input.customerId}` })
    },
    onSuccess(response) {
      toast.dismiss(`kyc-approve-${response.input.customerId}`)

      if (response.data?.success) {
        toast.success(response.data.message || "KYC approved successfully")
        // Refresh the customer data after successful KYC approval
        handleRefresh()
      } else if (response.data?.statusCode === 401 || response.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex items-center justify-between gap-2">
            <p>{response.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(response.data?.error || "Failed to approve KYC")
      }
      setIsApprovingKyc(null)
    },
    onError(error) {
      if (error.input) {
        toast.dismiss(`kyc-approve-${error.input.customerId}`)
      }
      toast.error(error.error?.serverError || "An error occurred while approving KYC")
      setIsApprovingKyc(null)
    },
  })

  // KYC Rejection Action
  const { execute: executeRejectKyc } = useAction(rejectKycAction, {
    onExecute(data) {
      setIsRejectingKyc(data.input.customerId)
      toast.loading("Rejecting KYC...", { id: `kyc-reject-${data.input.customerId}` })
    },
    onSuccess(response) {
      toast.dismiss(`kyc-reject-${response.input.customerId}`)

      if (response.data?.success) {
        toast.success(response.data.message || "KYC rejected successfully")
        // Refresh the customer data after successful KYC rejection
        handleRefresh()
      } else if (response.data?.statusCode === 401 || response.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex items-center justify-between gap-2">
            <p>{response.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(response.data?.error || "Failed to reject KYC")
      }
      setIsRejectingKyc(null)
    },
    onError(error) {
      if (error.input) {
        toast.dismiss(`kyc-reject-${error.input.customerId}`)
      }
      toast.error(error.error?.serverError || "An error occurred while rejecting KYC")
      setIsRejectingKyc(null)
    },
  })

  // KYC handler functions
  const handleApproveKyc = (customerId: string, customerType: CustomerType) => {
    // Only allow KYC actions for Individual and Business customers
    if (customerType === "Individual" || customerType === "Business") {
      executeApproveKyc({ customerId, customerType })
    }
  }

  const handleRejectKyc = (customerId: string, customerType: CustomerType, rejectionComment: string) => {
    // Only allow KYC actions for Individual and Business customers
    if (customerType === "Individual" || customerType === "Business") {
      executeRejectKyc({ customerId, customerType, rejectionComment })
    }
  }

  // Export customers action
  const { execute: exportCustomers, status: exportStatus } = useAction(exportCustomersAction, {
    onExecute() {
      toast.loading("Exporting customers...", { id: "export-customers" })
    },
    onSuccess(data) {
      toast.dismiss("export-customers")

      if (data.data?.success && data.data.data) {
        // Create a blob and download link with proper type checking
        const csvData = data.data.data || "" // Provide empty string as fallback
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url

        // Use a default filename if none is provided
        const filename = data.data.filename || `${activeTab}-customers-${new Date().toISOString().split("T")[0]}.csv`
        link.download = filename

        // Trigger the download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success(`${activeTab === "Individual" ? "Individual" : "Business"} customers exported successfully`)
      } else if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex items-center justify-between gap-2">
            <p>{data.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(data.data?.error || "Failed to export customers")
      }
    },
    onError(error) {
      toast.dismiss("export-customers")
      toast.error(error.error.serverError || "An error occurred while exporting customers")
    },
  })

  const columns: ColumnDef<CustomerTableData>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const customer = row.original
        const fullId = customer.fullId
        const displayId = customer.customerId || customer.id

        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={customer.avatar} alt="Customer avatar" />
              <AvatarFallback>
                {activeTab === "Individual"
                  ? customer.firstName?.[0] || "?"
                  : customer.businessName?.[0] || "B"}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span>{displayId}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(fullId)
                  toast.success("Customer ID has been copied to clipboard.")
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: activeTab === "Individual" ? "firstName" : "businessName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {activeTab === "Individual" ? "First Name" : "Business Name"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue(activeTab === "Individual" ? "firstName" : "businessName") as string
        return (
          <div className="flex items-center gap-2">
            {value === "N/A" ? <span className="text-muted-foreground italic">Not provided</span> : value}
          </div>
        )
      },
    },
    ...(activeTab === "Individual"
      ? [
          {
            accessorKey: "lastName",
            header: "Last Name",
            cell: ({ row }) => {
              const value = row.getValue("lastName") as string
              return value === "N/A" ? <span className="text-muted-foreground italic">Not provided</span> : value
            }
          } as ColumnDef<CustomerTableData>,
        ]
      : []),
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const value = row.getValue("email") as string
        return value === "N/A" ? <span className="text-muted-foreground italic">Not provided</span> : value
      }
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
      cell: ({ row }) => {
        const value = row.getValue("phone") as string
        return value === "N/A" ? <span className="text-muted-foreground italic">Not provided</span> : value
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.getValue("status") === "active"
              ? "bg-green-100 dark:bg-green-500/10 dark:text-green-500 text-green-700"
              : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-200"
          }`}
        >
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const value = row.getValue("date") as string
        return value === "N/A" ? <span className="text-muted-foreground italic">Not available</span> : value
      }
    },
    // {
    //   accessorKey: "tierLevel",
    //   header: "Tier Level",
    // },
    {
      accessorKey: "kycStatus",
      header: "KYC Status",
      cell: ({ row }) => {
        const status = row.getValue("kycStatus") as string
        let statusClass = ""
        
        switch(status) {
          case "Approved":
            statusClass = "text-green-600 dark:text-green-400"
            break
          case "Rejected":
            statusClass = "text-red-600 dark:text-red-400"
            break
          case "Under Review":
            statusClass = "text-amber-600 dark:text-amber-400"
            break
          case "Pending":
            statusClass = "text-blue-600 dark:text-blue-400"
            break
          default:
            statusClass = "text-gray-600 dark:text-gray-400"
        }
        
        return <span className={statusClass}>{status}</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <MemoizedActionCell
            customer={customer}
            onActivate={handleActivateUser}
            onDelete={handleDeleteUser}
            onApproveKyc={handleApproveKyc}
            onRejectKyc={handleRejectKyc}
            isActivating={isActivating}
            isDeleting={isDeleting}
            isApprovingKyc={isApprovingKyc}
            isRejectingKyc={isRejectingKyc}
          />
        )
      },
    },
  ]

  const customers = activeTab === "Individual" ? individualCustomers : businessCustomers
  const isLoading = activeTab === "Individual" ? isLoadingIndividual : isLoadingBusiness

  // Type-safe filter functions for table 
  type TableRow = {
    getValue: (columnId: string) => unknown
  }

  const customFilterFunctions = React.useMemo(
    () => ({
      date: (row: TableRow, columnId: string, filterValue: [string, string]) => {
        if (!filterValue || (!filterValue[0] && !filterValue[1])) return true

        const rowValue = row.getValue(columnId)
        // Ensure rowValue is a valid date string
        const rowDate = rowValue && typeof rowValue === "string" ? new Date(rowValue) : new Date()
        const fromDate = filterValue[0] ? new Date(filterValue[0]) : null
        const toDate = filterValue[1] ? new Date(filterValue[1]) : null

        if (fromDate && toDate) {
          return rowDate >= fromDate && rowDate <= toDate
        } else if (fromDate) {
          return rowDate >= fromDate
        } else if (toDate) {
          return rowDate <= toDate
        }
        return true
      },
      tierLevel: (row: TableRow, columnId: string, filterValue: string[]) => {
        if (!filterValue || !filterValue.length) return true
        const value = row.getValue(columnId)
        return typeof value === "string" && filterValue.includes(value)
      },
      kycStatus: (row: TableRow, columnId: string, filterValue: string[]) => {
        if (!filterValue || !filterValue.length) return true
        const value = row.getValue(columnId)
        return typeof value === "string" && filterValue.includes(value)
      },
    }),
    [],
  )

  // Initialize the table with type safety
  const table = useReactTable({
    data: customers,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    filterFns: {
      ...customFilterFunctions,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const clearFilter = () => {
    table.getColumn("date")?.setFilterValue([])
    table.getColumn("tierLevel")?.setFilterValue(undefined)
    table.getColumn("kycStatus")?.setFilterValue(undefined)
    setFilterSettings({
      dateFrom: undefined,
      dateTo: undefined,
      tierLevels: [],
      kycStatuses: [],
    })
  }

  const handleFilterApply = () => {
    // For date filtering
    if (filterSettings.dateFrom || filterSettings.dateTo) {
      table
        .getColumn("date")
        ?.setFilterValue([
          filterSettings.dateFrom ? filterSettings.dateFrom.toISOString().split("T")[0] : "",
          filterSettings.dateTo ? filterSettings.dateTo.toISOString().split("T")[0] : "",
        ])
    } else {
      table.getColumn("date")?.setFilterValue(undefined)
    }

    // For tier level filtering
    if (filterSettings.tierLevels.length > 0) {
      table.getColumn("tierLevel")?.setFilterValue(filterSettings.tierLevels)
    } else {
      table.getColumn("tierLevel")?.setFilterValue(undefined)
    }

    // For KYC status filtering
    if (filterSettings.kycStatuses.length > 0) {
      table.getColumn("kycStatus")?.setFilterValue(filterSettings.kycStatuses)
    } else {
      table.getColumn("kycStatus")?.setFilterValue(undefined)
    }
  }

  const handleMultiSelectorChange = (field: "tierLevels" | "kycStatuses", values: string[]) => {
    setFilterSettings((prev) => ({
      ...prev,
      [field]: values,
    }))
  }

  // Apply search only when the debounced term changes
  useEffect(() => {
    const handler = setTimeout(() => {
      table.getColumn("id")?.setFilterValue(searchTerm)
    }, 300)

    return () => clearTimeout(handler)
  }, [searchTerm, table])

  const isFilterApplyDisabled = () => {
    const { dateFrom, dateTo, tierLevels, kycStatuses } = filterSettings
    const isDateInvalid = (dateFrom && !dateTo) || (!dateFrom && dateTo) || (dateFrom && dateTo && dateFrom > dateTo)
    const hasOtherFilters = tierLevels.length > 0 || kycStatuses.length > 0
    return isDateInvalid || (!hasOtherFilters && !dateFrom && !dateTo)
  }

  const handleCreateOnlineClick = () => {
    setTimeout(() => {
      setIsModalOpen(true)
    }, 50)
  }

  const handlePageChange = (newPageNumber: number) => {
    setPagination((prev) => ({
      ...prev,
      pageNumber: newPageNumber,
    }))

    const params: FetchCustomersInput = {
      pageSize: pagination.pageSize,
      pageNumber: newPageNumber,
      customerType: activeTab,
    }

    if (activeTab === "Individual") {
      fetchIndividualCustomers(params)
    } else {
      fetchBusinessCustomers(params)
    }
  }

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    const params: FetchCustomersInput = {
      pageSize: pagination.pageSize,
      pageNumber: pagination.pageNumber,
      customerType: activeTab,
    }

    if (activeTab === "Individual") {
      fetchIndividualCustomers(params)
    } else {
      fetchBusinessCustomers(params)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as CustomerType)
  }

  // Initial data loading
  useEffect(() => {
    if (isInitialLoad) {
      // Load both individual and business customers on initial load
      fetchIndividualCustomers({
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageNumber,
        customerType: "Individual",
      })

      fetchBusinessCustomers({
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageNumber,
        customerType: "Business",
      })
    }
  }, [fetchIndividualCustomers, fetchBusinessCustomers, isInitialLoad, pagination.pageNumber, pagination.pageSize])

  const totalCustomers = table.getFilteredRowModel().rows.length
  const activeCustomers = table.getFilteredRowModel().rows.filter((row) => row.original.status === "active").length
  const inactiveCustomers = totalCustomers - activeCustomers

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search customers by ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xl w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 md:mr-2 text-white" />
                <span className="text-white hidden md:block">Create Customer</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 cursor-pointer md:mr-0 mr-14" align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="py-3 cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download Template</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem className="py-2 cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Individual Customer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Business Customer</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="py-3 cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload Customer</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem className="py-2 cursor-pointer">
                    <FileUp className="mr-2 h-4 w-4" />
                    <span>Individual Customer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer">
                    <FileUp className="mr-2 h-4 w-4" />
                    <span>Business Customer</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem asChild>
                <ResponsiveModal open={isModalOpen} defaultOpen={isCreating === "true"} onOpenChange={setIsModalOpen}>
                  <ResponsiveModalTrigger className="w-full flex" asChild>
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        handleCreateOnlineClick()
                      }}
                      variant="ghost"
                      className="w-full flex"
                    >
                      Create Online
                    </Button>
                  </ResponsiveModalTrigger>
                  <ResponsiveModalContent>
                    <CustomerModalFormCreation />
                  </ResponsiveModalContent>
                </ResponsiveModal>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Download className="mr-2 h-4 w-4" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 cursor-pointer" align="end">
              <DropdownMenuItem
                className="py-2 cursor-pointer"
                onClick={() => exportCustomers({ 
                  customerType: activeTab,
                  format: "csv",
                  pageSize: pagination.pageSize,
                  pageNumber: pagination.pageNumber,
                  searchParams: {
                    searchTerm,
                    ...(filterSettings.dateFrom && { dateFrom: filterSettings.dateFrom.toISOString() }),
                    ...(filterSettings.dateTo && { dateTo: filterSettings.dateTo.toISOString() }),
                    ...(filterSettings.tierLevels.length > 0 && { tierLevels: filterSettings.tierLevels.join(",") }),
                    ...(filterSettings.kycStatuses.length > 0 && { kycStatuses: filterSettings.kycStatuses.join(",") })
                  }
                })}
                disabled={exportStatus === "executing"}
              >
                {exportStatus === "executing" ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting CSV...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="py-2 cursor-pointer"
                onClick={() => exportCustomers({ 
                  customerType: activeTab,
                  format: "pdf",
                  pageSize: pagination.pageSize,
                  pageNumber: pagination.pageNumber,
                  searchParams: {
                    searchTerm,
                    ...(filterSettings.dateFrom && { dateFrom: filterSettings.dateFrom.toISOString() }),
                    ...(filterSettings.dateTo && { dateTo: filterSettings.dateTo.toISOString() }),
                    ...(filterSettings.tierLevels.length > 0 && { tierLevels: filterSettings.tierLevels.join(",") }),
                    ...(filterSettings.kycStatuses.length > 0 && { kycStatuses: filterSettings.kycStatuses.join(",") })
                  }
                })}
                disabled={exportStatus === "executing"}
              >
                {exportStatus === "executing" ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting PDF...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="gooeyLeft" className="bg-transparent border text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <p className="text-sm text-muted-foreground">Set the filters for the customer table</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-1 items-center gap-3">
                    <Label htmlFor="from">From</Label>
                    <div className="col-span-2">
                      <DateTimePicker
                        granularity="day"
                        displayFormat={{ hour24: "yyyy/MM/dd" }}
                        value={filterSettings.dateFrom}
                        onChange={(date) =>
                          setFilterSettings({
                            ...filterSettings,
                            dateFrom: date,
                          })
                        }
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-3">
                    <Label htmlFor="to">To</Label>
                    <div className="col-span-2">
                      <DateTimePicker
                        granularity="day"
                        displayFormat={{ hour24: "yyyy/MM/dd" }}
                        value={filterSettings.dateTo}
                        onChange={(date) =>
                          setFilterSettings({
                            ...filterSettings,
                            dateTo: date,
                          })
                        }
                        className="rounded-md border"
                      />
                    </div>
                    {filterSettings.dateFrom &&
                      filterSettings.dateTo &&
                      filterSettings.dateFrom > filterSettings.dateTo && (
                        <div className="p-2 border text-muted-foreground text-sm rounded-md bg-secondary flex justify-center relative /text-destructive">
                          <div className="arrow-box -top-2 border-t border-l rounded-sm rotate-45 size-4 bg-secondary absolute"></div>
                          Please use a valid date selection
                        </div>
                      )}
                  </div>
                  <div className="grid grid-cols-1 items-center gap-1">
                    <Label htmlFor="tier">Tier Level</Label>
                    <MultiSelector
                      values={filterSettings.tierLevels}
                      onValuesChange={(values) => handleMultiSelectorChange("tierLevels", values)}
                      className="col-span-2"
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput className="text-sm" placeholder="Select tier levels" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          <MultiSelectorItem value="Tier 1">Tier 1</MultiSelectorItem>
                          <MultiSelectorItem value="Tier 2">Tier 2</MultiSelectorItem>
                          <MultiSelectorItem value="Tier 3">Tier 3</MultiSelectorItem>
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-1">
                    <Label htmlFor="kyc">KYC Status</Label>
                    <MultiSelector
                      values={filterSettings.kycStatuses}
                      onValuesChange={(values) => handleMultiSelectorChange("kycStatuses", values)}
                      className="col-span-2"
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput className="text-sm" placeholder="Select KYC statuses" />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          <MultiSelectorItem value="Pending">Pending</MultiSelectorItem>
                          <MultiSelectorItem value="Under Review">Under Review</MultiSelectorItem>
                          <MultiSelectorItem value="Approved">Approved</MultiSelectorItem>
                          <MultiSelectorItem value="Rejected">Rejected</MultiSelectorItem>
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    variant="gooeyLeft"
                    onClick={clearFilter}
                    className="text-muted-foreground/ bg-transparent border"
                  >
                    Clear Filter
                  </Button>
                  <PopoverClose asChild>
                    <Button
                      className="text-white font-semibold"
                      onClick={handleFilterApply}
                      disabled={isFilterApplyDisabled() === true}
                    >
                      Apply Filter
                    </Button>
                  </PopoverClose>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customer</p>
              <p className="text-2xl font-bold">{totalCustomers}</p>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary">⚡</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Customer</p>
              <p className="text-2xl font-bold">{activeCustomers}</p>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-500">⚡</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inactive Customer</p>
              <p className="text-2xl font-bold">{inactiveCustomers}</p>
            </div>
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-red-500">
                <User className="text-foreground size-4" />
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Tabs
          className="p-0 m-0"
          defaultValue="Individual"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="bg-transparent p-0">
            <TabsTrigger value="Individual">Individual</TabsTrigger>
            <TabsTrigger value="Business">Business</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Add refresh button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing || isLoading}
          className="ml-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table className="p-o m-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isInitialLoad ? (
              <TableSkeleton columns={columns.length} rows={10} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow className="text-nowrap" key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {pagination.totalCount > 0 && (
            <span>
              Showing page {pagination.pageNumber + 1} of {pagination.totalPages}
            </span>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageNumber - 1)}
            disabled={pagination.pageNumber === 0 || isLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.pageNumber + 1)}
            disabled={pagination.pageNumber >= pagination.totalPages - 1 || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

