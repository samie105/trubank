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
import { ResponsiveModal, ResponsiveModalTrigger, ResponsiveModalContent } from "@/components/ui/dialog-2"
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
import { fetchCustomersAction, type CustomerTableData } from "@/server/customer-management/fetch-customers"
import { exportCustomersAction } from "@/server/customer-management/export-customers"
import { useRouter } from "next/navigation"
import { logoutAction } from "@/server/auth/auth-server"
import React from "react"
import { TableSkeleton } from "./table-skeleton"
import { Switch } from "@/components/ui/switch"
// Update imports to include the new server actions
import { activateUserAction, deleteUserAction } from "@/server/customer-management/customer-actions"

type CustomerType = "individual" | "business"

// Enhanced CustomerTableData to include the full customer data
interface EnhancedCustomerTableData extends CustomerTableData {
  fullData?: any // Store the complete customer data
}

// Replace the ActionCell component with this updated version that uses Popover
function ActionCell({
  customer,
  onActivate,
  onDelete,
  isActivating,
  isDeleting,
}: {
  customer: EnhancedCustomerTableData
  onActivate: (id: string, activate: boolean) => void
  onDelete: (id: string) => void
  isActivating: string | null
  isDeleting: string | null
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const isActive = customer.status === "active"

  // Create separate handler functions to avoid closure issues
  const handleActivate = () => {
    onActivate(customer.fullId || customer.id, !isActive)
    setOpen(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      onDelete(customer.fullId || customer.id)
      setOpen(false)
    }
  }

  const handleViewProfile = () => {
    const viewId = customer.fullId || customer.id
    router.push(`/dashboard/customer-management/view/${customer.type}/${viewId}`)
    setOpen(false)
  }

  // Updated handleEditUser function to use the already fetched full customer data
  const handleEditUser = () => {
    // Show loading toast

    // Make sure we're using the full ID for the API request
    const editId = customer.fullId || customer.id

    // Navigate to the edit page - the page will fetch the customer data
    router.push(`/dashboard/customer-management/edit/${customer.type}/${editId}`)

    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" type="button">
          <span className="sr-only">Open menu</span>
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
          <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted-foreground/10">
            <span>{isActive ? "Deactivate" : "Activate"} User</span>
            <Switch checked={isActive} disabled={isActivating === customer.id} onCheckedChange={handleActivate} />
          </div>
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
            onClick={handleDelete}
            disabled={isDeleting === customer.id}
            type="button"
          >
            {isDeleting === customer.id ? (
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
  )
}

// Memoize the ActionCell component to prevent unnecessary re-renders
const MemoizedActionCell = React.memo(ActionCell)

export default function CustomerTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [activeTab, setActiveTab] = useState<CustomerType>("individual")
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
  const [individualCustomers, setIndividualCustomers] = useState<EnhancedCustomerTableData[]>([])
  const [businessCustomers, setBusinessCustomers] = useState<EnhancedCustomerTableData[]>([])
  const [isLoadingIndividual, setIsLoadingIndividual] = useState(false)
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false) // New state for refresh button
  const [isActivating, setIsActivating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
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

  // Handle re-login

  // Handle logout
  const handleLogout = () => {
    executeLogout()
  }

  // Fetch individual customers action - updated to store full customer data
  const { execute: fetchIndividualCustomers } = useAction(fetchCustomersAction, {
    onExecute() {
      setIsLoadingIndividual(true)
    },
    onSuccess(data) {
      if (data.data?.success) {
        // Transform the data for the table component, but keep the full data
        const transformedData: EnhancedCustomerTableData[] = (data.data?.data as any[]).map((customer) => {
          // Only store the essential data needed for the table and actions
          const essentialData = {
            id: customer.id,
            customerId: customer.customerId,
            firstName: customer.firstName,
            lastName: customer.lastName,
            emailAddress: customer.emailAddress,
            phoneNumber: customer.phoneNumber,
            status: customer.status,
            createdAt: customer.createdAt,
            profilePicture: customer.profilePicture,
            accountTier: customer.accountTier,
            kycStatus: customer.kycStatus,
          }

          return {
            id: customer.customerId || customer.id.split("-")[0],
            fullId: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.emailAddress,
            phone: customer.phoneNumber,
            status: customer.status,
            date: customer.createdAt,
            avatar: customer.profilePicture?.profilePicture || "",
            type: "individual",
            tierLevel: customer.accountTier?.name || "Tier 1",
            kycStatus: customer.kycStatus,
            fullData: essentialData, // Store only essential data
          }
        })
        setIndividualCustomers(transformedData || [])
        if (data.data?.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalCount: data.data?.pagination?.totalCount || 0,
            totalPages: data.data?.pagination?.totalPages || 0,
          }))
        }
      } else if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
        // Replace this:
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
      setIsRefreshing(false) // Reset refreshing state
    },
    onError(error) {
      toast.error(error.error.serverError || "An error occurred while fetching individual customers")
      setIsLoadingIndividual(false)
      setIsInitialLoad(false)
      setIsRefreshing(false) // Reset refreshing state
    },
  })

  // Fetch business customers action - updated to store full customer data
  const { execute: fetchBusinessCustomers } = useAction(fetchCustomersAction, {
    onExecute() {
      setIsLoadingBusiness(true)
    },
    onSuccess(data) {
      if (data.data?.success) {
        // Transform the data for the table component, but keep the full data
        const transformedData: EnhancedCustomerTableData[] = (data.data?.data as any[]).map((customer) => {
          // Ensure we have a business name, even with the API typo
          const businessName = customer.busienssName || customer.businessName || ""

          // Only store the essential data needed for the table and actions
          const essentialData = {
            id: customer.id,
            customerId: customer.customerId,
            busienssName: businessName, // Keep the original field name with typo
            emailAddress: customer.emailAddress,
            phoneNumber: customer.phoneNumber,
            status: customer.status,
            createdAt: customer.createdAt,
            accountTier: customer.accountTier,
            kycStatus: customer.kycStatus,
          }

          return {
            id: customer.customerId || customer.id.split("-")[0],
            fullId: customer.id,
            businessName: businessName, // Use the extracted business name
            email: customer.emailAddress,
            phone: customer.phoneNumber,
            status: customer.status,
            date: customer.createdAt,
            avatar: "",
            type: "business",
            tierLevel: customer.accountTier?.name || "Tier 1",
            kycStatus: customer.kycStatus,
            fullData: essentialData, // Store only essential data
          }
        })
        setBusinessCustomers(transformedData || [])
        if (data.data?.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalCount: data.data?.pagination?.totalCount || 0,
            totalPages: data.data?.pagination?.totalPages || 0,
          }))
        }
      } else if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
        // Replace this:
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
      setIsRefreshing(false) // Reset refreshing state
    },
    onError(error) {
      toast.error(error.error.serverError || "An error occurred while fetching business customers")
      setIsLoadingBusiness(false)
      setIsInitialLoad(false)
      setIsRefreshing(false) // Reset refreshing state
    },
  })

  // Action to handle user activation/deactivation
  const { execute: executeActivateUser } = useAction(activateUserAction, {
    onExecute(data) {
      setIsActivating(data.input.userId)
      // Add loading toast for activation/deactivation
      const action = data.input.activate ? "Activating" : "Deactivating"
      toast.loading(`${action} user...`, { id: `user-status-${data.input.userId}` })
    },
    onSuccess(response) {
      // Dismiss the loading toast
      toast.dismiss(`user-status-${response.input.userId}`)

      if (response.data?.success) {
        toast.success(
          response.data.message || `User ${response.input.activate ? "activated" : "deactivated"} successfully`,
        )

        // Update the customer lists with the new status
        const updateCustomerList = (customers: EnhancedCustomerTableData[]) => {
          return customers.map((customer) =>
            customer.id === response.input.userId
              ? {
                  ...customer,
                  status: response.input.activate ? ("active" as const) : ("inactive" as const),
                  fullData: {
                    ...customer.fullData,
                    status: response.input.activate ? 1 : 0,
                  },
                }
              : customer,
          )
        }

        setIndividualCustomers((prev) => updateCustomerList(prev))
        setBusinessCustomers((prev) => updateCustomerList(prev))
      } else if (response.data?.statusCode === 401 || response.data?.error?.includes("Authentication required")) {
        // Replace this:
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
      // Dismiss the loading toast on error
      if (error.input) {
        toast.dismiss(`user-status-${error.input.userId}`)
      }
      toast.error(error.error.serverError || "An error occurred while updating user status")
      setIsActivating(null)
    },
  })

  // Update the executeDeleteUser action to include better toast handling
  const { execute: executeDeleteUser } = useAction(deleteUserAction, {
    onExecute(data) {
      setIsDeleting(data.input.userId)
      toast.loading("Deleting user...", { id: `delete-user-${data.input.userId}` })
    },
    onSuccess(response) {
      toast.dismiss(`delete-user-${response.input.userId}`)

      if (response.data?.success) {
        toast.success(response.data.message || "User deleted successfully")

        // Remove the user from the customer lists
        setIndividualCustomers((prev) => prev.filter((customer) => customer.id !== response.input.userId))
        setBusinessCustomers((prev) => prev.filter((customer) => customer.id !== response.input.userId))
      } else if (response.data?.statusCode === 401 || response.data?.error?.includes("Authentication required")) {
        // Replace this:
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

        toast.success(`${activeTab === "individual" ? "Individual" : "Business"} customers exported successfully`)
      } else if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
        // Replace this:
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

  const columns: ColumnDef<EnhancedCustomerTableData>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        // Get the full ID for copying to clipboard
        const fullId = row.original.fullId || (row.getValue("id") as string)
        // Get the short ID for display (part before the dash or the customerId)
        const displayId = row.original.customerId || (row.getValue("id") as string).split("-")[0]

        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={row.original.avatar} alt="Customer avatar" />
              <AvatarFallback>
                {activeTab === "individual"
                  ? row.original.firstName?.[0] || "?"
                  : row.original.businessName?.[0] || row.original.fullData?.busienssName?.[0] || "B"}
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
      accessorKey: activeTab === "individual" ? "firstName" : "businessName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {activeTab === "individual" ? "First Name" : "Business Name"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.getValue(activeTab === "individual" ? "firstName" : "businessName")}
        </div>
      ),
    },
    ...(activeTab === "individual"
      ? [
          {
            accessorKey: "lastName",
            header: "Last Name",
          } as ColumnDef<EnhancedCustomerTableData>,
        ]
      : []),
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
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
    },
    {
      accessorKey: "tierLevel",
      header: "Tier Level",
    },
    {
      accessorKey: "kycStatus",
      header: "KYC Status",
    },
    // Update the columns definition to use the new handlers
    // In the columns array, update the actions cell:
    {
      id: "actions",
      cell: ({ row }) => {
        const customer = row.original
        return (
          <MemoizedActionCell
            customer={customer}
            onActivate={handleActivateUser}
            onDelete={handleDeleteUser}
            isActivating={isActivating}
            isDeleting={isDeleting}
          />
        )
      },
    },
  ]

  const customers = activeTab === "individual" ? individualCustomers : businessCustomers
  const isLoading = activeTab === "individual" ? isLoadingIndividual : isLoadingBusiness

  // Add custom filter functions for the columns
  // Add this after the columns definition but before creating the table
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

  // Update the table creation to include the custom filter functions
  // Replace the existing table creation with this:
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

  // Fix the filter functionality by updating the handleFilterApply function
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

  // Handle export customers
  const handleExportCustomers = () => {
    exportCustomers({ customerType: activeTab })
  }

  const handlePageChange = (newPageNumber: number) => {
    setPagination((prev) => ({
      ...prev,
      pageNumber: newPageNumber,
    }))

    if (activeTab === "individual") {
      fetchIndividualCustomers({
        pageSize: pagination.pageSize,
        pageNumber: newPageNumber,
        customerType: "individual",
      })
    } else {
      fetchBusinessCustomers({
        pageSize: pagination.pageSize,
        pageNumber: newPageNumber,
        customerType: "business",
      })
    }
  }

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    if (activeTab === "individual") {
      fetchIndividualCustomers({
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageNumber,
        customerType: "individual",
      })
    } else {
      fetchBusinessCustomers({
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageNumber,
        customerType: "business",
      })
    }
  }

  // Initial data loading
  useEffect(() => {
    if (isInitialLoad) {
      // Load both individual and business customers on initial load
      fetchIndividualCustomers({
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageNumber,
        customerType: "individual",
      })

      fetchBusinessCustomers({
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageNumber,
        customerType: "business",
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
          <Button
            variant="gooeyLeft"
            className="bg-transparent border text-foreground"
            onClick={handleExportCustomers}
            disabled={exportStatus === "executing"}
          >
            {exportStatus === "executing" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin md:mr-2" />
                <span className="md:block hidden">Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 md:mr-2" />
                <span className="md:block hidden">Export</span>
              </>
            )}
          </Button>
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
          defaultValue="individual"
          onValueChange={(value) => setActiveTab(value as CustomerType)}
        >
          <TabsList className="bg-transparent p-0">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
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

