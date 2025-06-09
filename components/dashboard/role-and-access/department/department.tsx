"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Download, MoreVertical, Users } from "lucide-react"
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

  const [departments, setDepartments] = useState<Department[]>([
    { id: "1", name: "IT Support", numberOfTeams: 5, description: "Technical support and infrastructure" },
    { id: "2", name: "Customer Service", numberOfTeams: 6, description: "Customer support and relations" },
    { id: "3", name: "Human Resource", numberOfTeams: 3, description: "HR management and recruitment" },
    { id: "4", name: "Accounting", numberOfTeams: 4, description: "Financial management and accounting" },
    { id: "5", name: "Welfare", numberOfTeams: 2, description: "Employee welfare and benefits" },
    { id: "6", name: "Media Communication", numberOfTeams: 5, description: "Marketing and communications" },
  ])

  const handleCreateDepartment = () => {
    if (departmentName.trim()) {
      const newDepartment: Department = {
        id: Date.now().toString(),
        name: departmentName.trim(),
        description: departmentDescription.trim(),
        numberOfTeams: 0,
      }
      setDepartments([...departments, newDepartment])
      setDepartmentName("")
      setDepartmentDescription("")
      setIsCreateModalOpen(false)
    }
  }

  const filteredDepartments = departments.filter((dept) => dept.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
            className="pl-10 w-64 bg-background"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Create Department
            <Plus className="ml-2 w-4 h-4" />
          </Button>

          <Button variant="outline" className="text-muted-foreground border-border">
            Export
            <Download className="ml-2 w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon" className="text-muted-foreground border-border">
            <MoreVertical className="w-4 h-4" />
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
              {filteredDepartments.map((department) => (
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
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" />
                          View Teams
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
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
              ))}
            </TableBody>
          </Table>

          {filteredDepartments.length === 0 && (
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
        <ResponsiveModalContent className="sm:max-w-md bg-background border-border">
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
              disabled={!departmentName.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Create
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  )
}
