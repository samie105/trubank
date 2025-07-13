/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Download, MoreVertical, Users, RotateCcw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useAction } from "next-safe-action/hooks"
import { fetchDepartmentsAction, createDepartmentAction, exportDepartmentsCsvAction, exportDepartmentsPdfAction, updateDepartmentAction } from "@/server/role-and-access/fetch-departments"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveModal, ResponsiveModalContent, ResponsiveModalHeader, ResponsiveModalTitle } from "@/components/ui/dialog-2"

interface Department {
  id: string
  name: string
  description?: string
  numberOfTeams: number
}

export default function DepartmentsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [departmentName, setDepartmentName] = useState("")
  const [departmentDescription, setDepartmentDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // View modal state
  const [viewedDepartment, setViewedDepartment] = useState<Department | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editDepartmentId, setEditDepartmentId] = useState("")
  const [editDepartmentName, setEditDepartmentName] = useState("")
  const [editDepartmentDescription, setEditDepartmentDescription] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false);

  const { execute: loadDepartments } = useAction(fetchDepartmentsAction, {
    onExecute() {
      setIsLoading(true)
      toast.loading("Fetching departments...", { id: "fetch-dept" })
    },
    onSuccess(apiResponse) {
      toast.dismiss("fetch-dept")
      const payload = apiResponse.data
      if (payload && payload.success) {
        const successPayload = payload as {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          success: true; data: any[];
        }
        setDepartments(
          successPayload.data.map((d) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            numberOfTeams: d.numberOfTeams,
          }))
        )
      } else {
        const errMsg = (payload as any)?.error || "Failed to load departments"
        toast.error(errMsg)
      }
      setIsLoading(false)
    },
    onError(err) {
      toast.dismiss("fetch-dept")
      toast.error(err.error?.serverError || "Failed to load departments")
      setIsLoading(false)
    },
  })

  useEffect(() => {
    loadDepartments({})
  }, [loadDepartments])

  const handleCreateDepartment = async () => {
    if (!departmentName.trim()) return;
    setIsCreating(true);
    const toastId = toast.loading("Creating department...");
    const res = await createDepartmentAction({
        name: departmentName.trim(),
        description: departmentDescription.trim(),
    });
    toast.dismiss(toastId);
    setIsCreating(false);
    if (res?.data?.isSuccess) {
      toast.success(res.data.message || "Department created successfully");
      setDepartmentName("");
      setDepartmentDescription("");
      setIsCreateModalOpen(false);
      loadDepartments({});
    } else {
      toast.error(res?.data?.error || res?.data?.message || "Failed to create department");
    }
  }

  const openEditModal = (department: Department) => {
    setEditDepartmentId(department.id)
    setEditDepartmentName(department.name)
    setEditDepartmentDescription(department.description || "")
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditDepartmentId("")
    setEditDepartmentName("")
    setEditDepartmentDescription("")
  }

  const handleUpdateDepartment = async () => {
    if (!editDepartmentName.trim()) return;
    setIsUpdating(true);
    const toastId = toast.loading("Updating department...");
    const res = await updateDepartmentAction({
      id: editDepartmentId,
      name: editDepartmentName.trim(),
      description: editDepartmentDescription.trim(),
    });
    toast.dismiss(toastId);
    setIsUpdating(false);
    if (res?.data?.isSuccess) {
      toast.success(res.data.message || "Department updated successfully");
      closeEditModal();
      loadDepartments({});
    } else {
      toast.error(res?.data?.error || res?.data?.message || "Failed to update department");
    }
  }

  const filteredDepartments = departments.filter((dept) => dept.name.toLowerCase().includes(searchQuery.toLowerCase()))

  // Export handlers
  function getExportSearchParams(): Record<string, string> {
    if (searchQuery) return { name: searchQuery };
    return {};
  }

  async function handleExport(type: 'csv' | 'pdf') {
    const toastId = toast.loading(`Exporting departments as ${type.toUpperCase()}...`);
    try {
      const params = {
        pageSize: 1000,
        pageNumber: 1,
        searchParams: getExportSearchParams(),
        selectedFields: [],
      };
      let fileData: string | undefined;
      const fileName = `departments.${type}`;
      if (type === 'csv') {
        const res = await exportDepartmentsCsvAction(params);
        fileData = res && res.data;
      } else {
        const res = await exportDepartmentsPdfAction(params);
        fileData = res && res.data;
      }
      if (!fileData) throw new Error('No file data returned');
      const blob = new Blob([fileData], { type: type === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported departments as ${type.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export departments as ${type.toUpperCase()}`);
    } finally {
      toast.dismiss(toastId);
    }
  }

  return (
    <div className="p-6 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md bg-background"
          />
        </div>




        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">Create Department</span>
          </Button>

          {/* Export Dropdown Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-muted-foreground border-border hidden lg:inline-flex">
                Export
                <Download className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Export Icon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-muted-foreground border-border lg:hidden"
                aria-label="Export"
              >
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" className="text-muted-foreground border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="text-muted-foreground border-border">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => loadDepartments({})}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Button>
        </div>
      </div>

      {/* Departments Table */}
      <Card className="bg-background border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow  className="border-b border-border bg-muted/50">
                <TableHead className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Department Name
                </TableHead>
                <TableHead className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Number of Teams
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <TableRow key={idx} className="border-b border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-6 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                filteredDepartments.map((department) => (
                <TableRow key={department.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                  <TableCell className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{department.name}</span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-2xl font-bold text-foreground">{department.numberOfTeams}</span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu
                      open={openDropdownId === department.id}
                      onOpenChange={(open) => setOpenDropdownId(open ? department.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="cursor-pointer"
                          onClick={() => { setViewedDepartment(department); setIsViewModalOpen(true); }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Department
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer"
                          onClick={() => openEditModal(department)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
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

          {filteredDepartments.length === 0 && !isLoading && (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2 text-foreground">No departments found</p>
              <p className="text-sm">Try adjusting your search or create a new department.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Department Modal */}
      <ResponsiveModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <ResponsiveModalContent className=" bg-background border-border">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="text-xl font-semibold text-foreground">Create Department</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="department-name" className="text-sm font-medium text-foreground">
                Department Name
              </label>
              <Input
                id="department-name"
                placeholder="Enter name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="department-description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="department-description"
                placeholder="Description"
                value={departmentDescription}
                onChange={(e) => setDepartmentDescription(e.target.value)}
                className="w-full min-h-[100px] resize-none bg-background border-border"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false)
                setDepartmentName("")
                setDepartmentDescription("")
              }}
              className="border-border text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDepartment}
              disabled={!departmentName.trim() || isCreating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* View Department Modal */}
      <ResponsiveModal open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <ResponsiveModalContent className="bg-background border-border">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="text-xl font-semibold text-foreground">Department Details</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          {viewedDepartment && (
            <div className="space-y-6 py-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Department Name</div>
                <div className="text-lg font-bold text-foreground">{viewedDepartment.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Description</div>
                <div className="text-base text-foreground">{viewedDepartment.description || <span className='italic text-muted-foreground'>No description</span>}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Number of Teams</div>
                <div className="text-lg font-bold text-foreground">{viewedDepartment.numberOfTeams}</div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  className="bg-destructive text-destructive-foreground"
                  // onClick={handleDeleteDepartment}
                >
                  Delete
                </Button>
                <Button
                  className="bg-primary text-primary-foreground"
                  onClick={() => openEditModal(viewedDepartment)}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Edit Department Modal */}
      <ResponsiveModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ResponsiveModalContent className="bg-background border-border">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="text-xl font-semibold text-foreground">Edit Department</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-department-name" className="text-sm font-medium text-foreground">
                Department Name
              </label>
              <Input
                id="edit-department-name"
                placeholder="Enter name"
                value={editDepartmentName}
                onChange={(e) => setEditDepartmentName(e.target.value)}
                className="w-full bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-department-description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                id="edit-department-description"
                placeholder="Description"
                value={editDepartmentDescription}
                onChange={(e) => setEditDepartmentDescription(e.target.value)}
                className="w-full min-h-[100px] resize-none bg-background border-border"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={closeEditModal}
              className="border-border text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDepartment}
              disabled={!editDepartmentName.trim() || isUpdating}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  )
}
