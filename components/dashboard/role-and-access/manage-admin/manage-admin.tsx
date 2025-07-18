"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Download, MoreVertical, Settings, RotateCcw, Eye, Edit, Trash2, User, UserCheck, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ManageAdminModal } from "./manage-admin-modal";
import { useAction } from "next-safe-action/hooks";
import { fetchAdminUsersAction } from "@/server/role-and-access/fetch-admin-users";
import { exportAdminUsersAction } from "@/server/role-and-access/export-admin-users";
import { activateDeactivateAdminAction, deleteAdminUserAction, editAdminUserAction } from "@/server/role-and-access/edit-admin-user";
import { AdminProfileModal } from "./admin-profile-modal";
import { fetchDepartmentsAction } from "@/server/role-and-access/fetch-departments";
import { fetchTeamsAction } from "@/server/role-and-access/fetch-teams";
import { getAllPositionsAction } from "@/server/role-and-access/approval-workflow";
import { fetchBranchesAction } from "@/server/general/fetch-data";
import { fetchRolesAction } from "@/server/role-and-access/fetch-roles";
import { EditAdminSheet } from "./EditAdminSheet";

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  role: string;
  position: string;
  department: string;
  team: string;
  status: "Active" | "Inactive";
  avatar?: string;
  // Add IDs for proper mapping
  roleId?: string;
  positionId?: string;
  departmentId?: string;
  teamId?: string;
  branchId?: string;
  isDeleted?: boolean;
}

interface AdminWithNames extends Admin {
  firstName: string;
  lastName: string;
  isHeadOfDepartment?: boolean;
  viewAllTeamAct?: boolean;
  viewAllDepartmentAct?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars


export default function ManageAdmin() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminWithNames | null>(null);
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { execute: loadAdmins } = useAction(fetchAdminUsersAction, {
    onExecute() {
      setIsLoading(true);
    },
    onSuccess(apiResponse) {
      const payload: any = apiResponse.data ?? {};
      if (payload && payload.success) {
        setAdmins(
          payload.data.map((u: any) => ({
            id: u.id,
            name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
            email: u.emailAddress,
            phone: u.phoneNumber,
            gender: u.gender,
            role: u.role?.name ?? "",
            position: u.position?.name ?? "",
            department: u.department?.name ?? "",
            team: u.team?.name ?? "",
            status: u.isActive ? "Active" : "Inactive",
            avatar: u.profile_picture?.file,
            // Store the IDs for proper mapping - using direct ID fields from API
            roleId: u.role?.id,
            positionId: u.positionId,
            departmentId: u.departmentId,
            teamId: u.teamId,
            branchId: u.branchId,
            isDeleted: u.isDeleted ,
          }))
        );
      }
      setIsLoading(false);
      setHasLoadedOnce(true);
    },
    onError() {
      setIsLoading(false);
    }
  });

  const { execute: exportAdmins } = useAction(exportAdminUsersAction, {
    onExecute() {
      toast.loading("Exporting admins...", { id: "export-admins" });
    },
    onSuccess(apiResponse) {
      toast.dismiss("export-admins");
      const payload = apiResponse.data;
      if (payload && typeof payload === "object" && "fileData" in payload) {
        const csv = (payload as { fileData: string }).fileData;
        try {
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `admins_${Date.now()}.csv`);
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          URL.revokeObjectURL(url);
        } catch {
          /* swallow */
        }
        toast.success("Admins exported successfully");
        // Clear selected items after successful export
        setSelectedAdminIds([]);
      } else if (typeof payload === "string") {
        const blob = new Blob([payload], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `admins_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Admins exported successfully");
        // Clear selected items after successful export
        setSelectedAdminIds([]);
        // Clear selected items after successful export
        setSelectedAdminIds([]);
      } else {
        toast.error("Export failed");
      }
    },
    onError(err) {
      toast.dismiss("export-admins");
      toast.error(err.error?.serverError || "Export failed");
    },
  });

  React.useEffect(() => {
    if (!hasLoadedOnce) {
      loadAdmins({});
    }
  }, [loadAdmins, hasLoadedOnce]);

  const filteredAdmins = admins
    .filter(admin => !admin.isDeleted)
    .filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.team.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(admin => admin.status === "Active").length;
  const inactiveAdmins = admins.filter(admin => admin.status === "Inactive").length;

  const handleCreate = (admin: Admin) => {
    setAdmins([...admins, admin]);
    toast.success(`${admin.name} has been created successfully`);
    // Refresh data after create
    loadAdmins({});
  };

  const handleUpdate = () => {
    // Refresh admin data from server after update
    loadAdmins({});
  };

  const handleRefresh = () => {
    setHasLoadedOnce(false);
    loadAdmins({});
  };

  const handleSelectAdmin = (adminId: string) => {
    setSelectedAdminIds(prev => 
      prev.includes(adminId) 
        ? prev.filter(id => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAdminIds(filteredAdmins.map(admin => admin.id));
    } else {
      setSelectedAdminIds([]);
    }
  };

  const isAllSelected = filteredAdmins.length > 0 && selectedAdminIds.length === filteredAdmins.length;
  const isIndeterminate = selectedAdminIds.length > 0 && selectedAdminIds.length < filteredAdmins.length;

  const handleEditAdmin = (admin: Admin) => {
    // Split name into first and last
    const [firstName, ...rest] = (admin.name || "").split(" ");
    setEditingAdmin({
      ...admin,
      firstName,
      lastName: rest.join(" "),
    });
    setIsEditSheetOpen(true);
  };

  const { execute: editAdmin } = useAction(editAdminUserAction, {
    onExecute() {
      toast.loading("Updating admin...", { id: "edit-admin" });
    },
    onSuccess(result) {
      toast.dismiss("edit-admin");
      if (result.data?.isSuccess) {
        toast.success("Admin updated successfully");
        setIsEditSheetOpen(false);
        setEditingAdmin(null);
        loadAdmins({});
      } else {
        toast.error(result.data?.message || "Failed to update admin");
      }
    },
    onError(err) {
      toast.dismiss("edit-admin");
      toast.error(err.error?.serverError || "Failed to update admin");
    },
  });

  function handleEditSave(updated: AdminWithNames) {
    // Validate required fields
    if (!updated.id || !updated.firstName || !updated.lastName || !updated.email || !updated.phone) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Only include optional fields if they have a value
    const payload: any = {
      userId: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      emailAddress: updated.email,
      phoneNumber: updated.phone,
      gender: updated.gender === "F" ? "female" : updated.gender === "M" ? "male" : "male",
      headOfDepartment: updated.isHeadOfDepartment ? 1 : 0,
      positionId: updated.positionId || undefined,
      branchId: updated.branchId || undefined,
      viewAllTeamAct: updated.viewAllTeamAct ?? false,
      viewAllDepartmentAct: updated.viewAllDepartmentAct ?? false,
    };
    if (updated.roleId) payload.roleId = updated.roleId;
    if (updated.teamId) payload.teamId = updated.teamId;
    if (updated.departmentId) payload.departmentId = updated.departmentId;

    editAdmin(payload);
  }

  function handleEditDelete(id: string) {
    handleDeleteAdmin(id); // already calls server action and refetches
    setIsEditSheetOpen(false);
    setEditingAdmin(null);
  }

  const { execute: deleteAdmin } = useAction(deleteAdminUserAction, {
    onExecute() {
      toast.loading("Deleting admin...", { id: "delete-admin" });
    },
    onSuccess(result) {
      toast.dismiss("delete-admin");
      if (result.data?.isSuccess) {
        loadAdmins({});
        toast.success("Admin deleted successfully");
      } else {
        toast.error(result.data?.message || "Failed to delete admin");
      }
    },
    onError(err) {
      toast.dismiss("delete-admin");
      toast.error(err.error?.serverError || "Failed to delete admin");
    },
  });

  const { execute: toggleAdminStatus } = useAction(activateDeactivateAdminAction, {
    onExecute() {
      toast.loading("Updating admin status...", { id: "toggle-status" });
    },
    onSuccess(result) {
      toast.dismiss("toggle-status");
      if (result.data?.isSuccess) {
        loadAdmins({});
        toast.success("Admin status updated successfully");
      } else {
        toast.error(result.data?.message || "Failed to update admin status");
      }
    },
    onError(err) {
      toast.dismiss("toggle-status");
      toast.error(err.error?.serverError || "Failed to update admin status");
    },
  });

  const handleDeleteAdmin = (adminId: string) => {
    deleteAdmin({ userId: adminId });
  };

  const handleToggleStatus = (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    if (admin) {
      toggleAdminStatus({
        id: adminId,
        isActivate: admin.status === "Inactive"
      });
    }
  };

  const handleViewProfile = (admin: Admin) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("profile", admin.id);
    router.push(currentUrl.toString());
  };

  type Branch = { id: string; name: string; branchCode?: string };
  type Team = { id: string; name: string };
  type Department = { id: string; name: string };
  type Position = { id: string; name: string };
  type Role = { id: string; roleName: string; roleDescription: string; permissions: string[] };

  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Loading states for individual data
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const { execute: loadDepartments } = useAction(fetchDepartmentsAction, {
    onExecute() {
      setIsLoadingDepartments(true);
    },
    onSuccess(result) {
      if (result.data?.success) setDepartments(result.data.data);
      setIsLoadingDepartments(false);
    },
    onError() {
      setIsLoadingDepartments(false);
    },
  });
  const { execute: loadTeams } = useAction(fetchTeamsAction, {
    onExecute() {
      setIsLoadingTeams(true);
    },
    onSuccess(result) {
      if (result.data?.success) setTeams(result.data.data);
      setIsLoadingTeams(false);
    },
    onError() {
      setIsLoadingTeams(false);
    },
  });
  const { execute: loadPositions } = useAction(getAllPositionsAction, {
    onExecute() {
      setIsLoadingPositions(true);
    },
    onSuccess(result) {
      if (result.data?.isSuccess) setPositions(result.data.result.data);
      setIsLoadingPositions(false);
    },
    onError() {
      setIsLoadingPositions(false);
    },
  });
  const { execute: loadBranches } = useAction(fetchBranchesAction, {
    onSuccess(result) {
      if (result.data?.success) setBranches(result.data.data || []);
    },
  });
  const { execute: loadRoles } = useAction(fetchRolesAction, {
    onExecute() {
      setIsLoadingRoles(true);
    },
    onSuccess(result) {
      if (result.data?.success) setRoles(result.data.data);
      setIsLoadingRoles(false);
    },
    onError() {
      setIsLoadingRoles(false);
    },
  });

  React.useEffect(() => {
    loadDepartments({});
    loadTeams({});
    loadPositions({});
    loadBranches();
    loadRoles({});
  }, [loadDepartments, loadTeams, loadPositions, loadBranches, loadRoles]);

  return (
    <>
      <EditAdminSheet
        open={isEditSheetOpen}
        onOpenChange={(open) => {
          setIsEditSheetOpen(open);
          if (!open) setEditingAdmin(null);
        }}
        admin={editingAdmin}
        onSave={handleEditSave}
        onDelete={handleEditDelete}
        onViewProfile={handleViewProfile}
        roles={positions} // using positions for roles as per mapping
        teams={teams}
        departments={departments}
        positions={positions}
        branches={branches}
      />
      <div className="p-6">
      <ManageAdminModal
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setSelectedAdmin(null);
            setIsEditMode(false);
          }
        }}
        isEditMode={isEditMode}
        admin={selectedAdmin}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onRefresh={() => loadAdmins({})}
      />
      <AdminProfileModal 
        admins={admins} 
        branches={branches} 
        teams={teams} 
        departments={departments} 
        positions={positions} 
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 bg-background"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            onClick={() => {
              setSelectedAdmin(null);
              setIsEditMode(false);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Create New Admin</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="text-muted-foreground border-border"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="text-muted-foreground border-border flex items-center gap-2"
            onClick={() => exportAdmins({ selectedIds: selectedAdminIds })}
            disabled={selectedAdminIds.length === 0}
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export {selectedAdminIds.length > 0 ? `(${selectedAdminIds.length})` : ''}</span>
          </Button>
          <Button variant="outline" size="icon" className="text-muted-foreground border-border">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Admin</p>
                <p className="text-3xl font-bold">{totalAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Admin</p>
                <p className="text-3xl font-bold">{activeAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Admin</p>
                <p className="text-3xl font-bold">{inactiveAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Admin Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className={isIndeterminate ? "data-[state=checked]:bg-blue-600" : ""}
                />
              </TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>PHONE NO</TableHead>
              <TableHead>GENDER</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>POSITION</TableHead>
              <TableHead>DEPARTMENT</TableHead>
              <TableHead>TEAM</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                </TableRow>
              ))
            ) : (
            filteredAdmins.map((admin) => {
              const roleName = admin.role || roles.find(r => r.id === admin.roleId)?.roleName || "-";
              const positionName = admin.position || positions.find(p => p.id === admin.positionId)?.name || "-";
              const departmentName = admin.department || departments.find(d => d.id === admin.departmentId)?.name || "-";
              const teamName = admin.team || teams.find(t => t.id === admin.teamId)?.name || "-";
              return (
                <TableRow key={admin.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAdminIds.includes(admin.id)}
                      onCheckedChange={() => handleSelectAdmin(admin.id)}
                      aria-label={`Select ${admin.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={admin.avatar} />
                        <AvatarFallback>
                          {admin.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{admin.phone}</TableCell>
                  <TableCell>{admin.gender}</TableCell>
                  <TableCell>
                    {isLoadingRoles ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      roleName
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoadingPositions ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      positionName
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoadingDepartments ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      departmentName
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoadingTeams ? (
                      <Skeleton className="h-4 w-16" />
                    ) : (
                      teamName
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={admin.status === "Active" ? "default" : "secondary"}
                      className={admin.status === "Active" ? "bg-green-500/10 text-green-700 hover:bg-green-200" : "bg-gray-500/10 text-gray-700 hover:bg-gray-200"}
                    >
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewProfile(admin)}>
                          <Eye className="mr-2 w-4 h-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditAdmin(admin)}>
                          <Edit className="mr-2 w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          <Trash2 className="mr-2 w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-0">
                          <div className="flex items-center justify-between w-full px-2 py-1.5">
                            <span className="flex items-center">
                              Activate/Deactivate
                            </span>
                            <Switch
                              checked={admin.status === "Active"}
                              onCheckedChange={() => handleToggleStatus(admin.id)}
                              className="ml-2"
                            />
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && filteredAdmins.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No administrators found matching your search.
        </div>
      )}
    </div>
    </>
  );
} 