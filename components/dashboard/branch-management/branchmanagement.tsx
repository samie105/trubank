"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Plus, Search, SlidersHorizontal, MoreVertical, Eye, Pencil, Trash2, Building } from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Server Actions
import {
  getBranchesAction,
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
  type Branch,
} from "@/server/branch-management/branch-actions"

// Form Schema
const branchFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Branch name is required"),
  address: z.string().min(1, "Branch address is required"),
})

type BranchFormValues = z.infer<typeof branchFormSchema>

// Branch Table Skeleton component
function BranchTableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton className="h-6 w-[180px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-full max-w-[350px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default function BranchManagement() {
  // State
  const [branches, setBranches] = useState<Branch[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch branches action
  const { execute: fetchBranches } = useAction(getBranchesAction, {
    onExecute() {
      setIsLoading(true)
    },
    onSuccess(data) {
      if (data.data?.success) {
        // Fixed: Added null check and default empty array
        setBranches(data.data.branches || [])
      } else {
        toast.error(data.data?.error || "Failed to fetch branches")
      }
      setIsLoading(false)
    },
    onError(error) {
      toast.error(error.error.serverError || "An error occurred while fetching branches")
      setIsLoading(false)
    },
  })

  // Create branch action
  const { execute: createBranch } = useAction(createBranchAction, {
    onExecute() {
      setIsSubmitting(true)
    },
    onSuccess(data) {
      setIsSubmitting(false)
      if (data.data?.success && data.data.branch) {
        setBranches((prev) => [...prev, data.data!.branch!])
        setIsCreateModalOpen(false)
        toast.success("Branch created successfully")
        createForm.reset()
      } else {
        toast.error(data.data?.error || "Failed to create branch")
      }
    },
    onError(error) {
      setIsSubmitting(false)
      toast.error(error.error.serverError || "An error occurred while creating the branch")
    },
  })

  // Update branch action
  const { execute: updateBranch } = useAction(updateBranchAction, {
    onExecute() {
      setIsSubmitting(true)
    },
    onSuccess(data) {
      setIsSubmitting(false)
      if (data.data?.success && data.data.branch) {
        setBranches((prev) => prev.map((branch) => (branch.id === data.data!.branch!.id ? data.data!.branch! : branch)))
        setIsEditModalOpen(false)
        toast.success("Branch updated successfully")
      } else {
        toast.error(data.data?.error || "Failed to update branch")
      }
    },
    onError(error) {
      setIsSubmitting(false)
      toast.error(error.error.serverError || "An error occurred while updating the branch")
    },
  })

  // Delete branch action
  const { execute: deleteBranch } = useAction(deleteBranchAction, {
    onExecute() {
      setIsDeleting(true)
    },
    onSuccess(data) {
      setIsDeleting(false)
      if (data.data?.success && selectedBranch?.id) {
        setBranches((prev) => prev.filter((branch) => branch.id !== selectedBranch.id))
        setIsDeleteDialogOpen(false)
        toast.success("Branch deleted successfully")
      } else {
        toast.error(data.data?.error || "Failed to delete branch")
      }
    },
    onError(error) {
      setIsDeleting(false)
      toast.error(error.error.serverError || "An error occurred while deleting the branch")
    },
  })

  // Forms
  const createForm = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  })

  const editForm = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      id: "",
      name: "",
      address: "",
    },
  })

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // Update edit form when selected branch changes
  useEffect(() => {
    if (selectedBranch && isEditModalOpen) {
      editForm.reset({
        id: selectedBranch.id,
        name: selectedBranch.name,
        address: selectedBranch.address,
      })
    }
  }, [selectedBranch, isEditModalOpen, editForm])

  // Handle form submissions
  const onCreateSubmit = (values: BranchFormValues) => {
    createBranch(values)
  }

  const onEditSubmit = (values: BranchFormValues) => {
    updateBranch(values)
  }

  const handleDeleteBranch = () => {
    if (selectedBranch?.id) {
      deleteBranch({ id: selectedBranch.id })
    }
  }

  // Filter branches based on search term
  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Header with search and actions */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for bank branch"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-10 w-10" aria-label="Filter">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button className="text-white" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Branch
          </Button>
        </div> 
      </div>

      {/* Branches table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Branch Name</TableHead>
              <TableHead className="font-medium">Address</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <BranchTableSkeleton />
            ) : filteredBranches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {searchTerm ? (
                    <div className="flex flex-col items-center justify-center">
                      <Building className="h-8 w-8 text-muted-foreground mb-2" />
                      <p>No branches found matching &quot;{searchTerm}&quot;</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Building className="h-8 w-8 text-muted-foreground mb-2" />
                      <p>No branches found. Add your first branch to get started.</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBranch(branch)
                            setIsPreviewModalOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBranch(branch)
                            setIsEditModalOpen(true)
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedBranch(branch)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Branch Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Enter the details for the new branch. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter branch name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter branch address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button className="text-white"
 type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Branch"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Preview Branch Modal */}
      {selectedBranch && (
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Branch Details</DialogTitle>
              <DialogDescription>View the details of the selected branch.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Branch Name</h4>
                <p className="text-base">{selectedBranch.name}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Branch Address</h4>
                <p className="text-base">{selectedBranch.address}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Branch ID</h4>
                <p className="text-base text-muted-foreground">{selectedBranch.id}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Branch Modal */}
      {selectedBranch && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Branch</DialogTitle>
              <DialogDescription>
                Update the details for this branch. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter branch name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter branch address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button                   className="text-white"
 type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Branch Dialog */}
      {selectedBranch && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this branch?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the branch
                <strong> {selectedBranch.name}</strong> and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDeleteBranch} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}