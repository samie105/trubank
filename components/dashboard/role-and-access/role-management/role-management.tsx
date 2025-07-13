"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/dialog-2";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Settings,
  
} from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { fetchRolesAction, fetchPermissionsAction, createRoleAction } from "@/server/role-and-access/fetch-roles";
import type { FetchRolesSuccess, RoleApi, PermissionApi, FetchPermissionsSuccess } from "@/server/role-and-access/fetch-roles";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isExpanded?: boolean;
}

// Available permissions
const availablePermissions: Permission[] = [
  { id: "view_dashboard", name: "View Dashboard Overview", category: "dashboard" },
  { id: "manage_dashboard", name: "Manage Dashboard Overview", category: "dashboard" },
  { id: "view_customers", name: "View Customers", category: "customers" },
  { id: "manage_customers", name: "Manage Customers", category: "customers" },
  { id: "view_accounts", name: "View Accounts", category: "accounts" },
  { id: "manage_accounts", name: "Manage Accounts", category: "accounts" },
  { id: "view_admins", name: "View Admins", category: "admins" },
  { id: "manage_admins", name: "Manage Admins", category: "admins" },
  { id: "view_branch", name: "View Branch", category: "branch" },
  { id: "manage_branch", name: "Manage Branch", category: "branch" },
  { id: "view_bank_staffs", name: "View Bank Staffs", category: "staff" },
  { id: "manage_bank_staffs", name: "Manage Bank Staffs", category: "staff" },
];

const ROLE_FORM_STORAGE_KEY = "role-management-create-form";

export default function RoleManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionApi[]>([]);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);

  // Form states
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch roles and permissions on mount
  const { execute: loadRoles } = useAction(fetchRolesAction, {
    onExecute() {
      setIsLoading(true);
      toast.loading("Fetching roles...", { id: "fetch-roles" });
    },
    onSuccess(result) {
      const payload = result.data as FetchRolesSuccess | { error?: string } | undefined;
      toast.dismiss("fetch-roles");
      if (payload && (payload as FetchRolesSuccess).success) {
        const successPayload = payload as FetchRolesSuccess;
        setRoles(successPayload.data.map((r: RoleApi) => ({
          id: r.id,
          name: r.roleName,
          description: r.roleDescription,
          permissions: r.permissions,
        })));
      } else {
        toast.error((payload as { error?: string })?.error || "Failed to load roles");
      }
      setIsLoading(false);
    },
    onError(err) {
      toast.dismiss("fetch-roles");
      toast.error(err.error?.serverError || "Failed to load roles");
      setIsLoading(false);
    },
  });

  const { execute: loadPermissions } = useAction(fetchPermissionsAction, {
    onExecute() {
      setIsPermissionsLoading(true);
    },
    onSuccess(result) {
      const payload = result.data as FetchPermissionsSuccess | { error?: string } | undefined;
      if (payload && (payload as FetchPermissionsSuccess).success) {
        const successPayload = payload as FetchPermissionsSuccess;
        setPermissions(successPayload.data);
      } else {
        toast.error((payload as { error?: string })?.error || "Failed to load permissions");
      }
      setIsPermissionsLoading(false);
    },
    onError(err) {
      toast.error(err.error?.serverError || "Failed to load permissions");
      setIsPermissionsLoading(false);
    },
  });

  useEffect(() => {
    loadRoles({});
    loadPermissions({});
  }, [loadRoles, loadPermissions]);

  // Load form state from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(ROLE_FORM_STORAGE_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          setRoleName(parsed.roleName || "");
          setRoleDescription(parsed.roleDescription || "");
          setSelectedPermissions(parsed.selectedPermissions || []);
          setCurrentStep(parsed.currentStep || 1);
          setIsEditMode(parsed.isEditMode || false);
          setSelectedRole(parsed.selectedRole || null);
        }
      } catch {}
    }
  }, []);

  // Save form state to localStorage whenever it changes
  useEffect(() => {
    const data = {
      roleName,
      roleDescription,
      selectedPermissions,
      currentStep,
      isEditMode,
      selectedRole,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_FORM_STORAGE_KEY, JSON.stringify(data));
    }
  }, [roleName, roleDescription, selectedPermissions, currentStep, isEditMode, selectedRole]);

  // Save to localStorage immediately on input/change
  function handleRoleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoleName(e.target.value);
  }
  function handleRoleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setRoleDescription(e.target.value);
  }
  function handlePermissionToggleImmediate(permissionId: string) {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRoleExpansion = (roleId: string) => {
    setRoles(roles.map(role =>
      role.id === roleId
        ? { ...role, isExpanded: !role.isExpanded }
        : role
    ));
  };


  const resetForm = () => {
    setCurrentStep(1);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setIsEditMode(false);
    setSelectedRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ROLE_FORM_STORAGE_KEY);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!roleName.trim() || !roleDescription.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleCreateRole = async () => {
    if (isEditMode && selectedRole) {
      // Update existing role (local only)
      const updatedRole: Role = {
        ...selectedRole,
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions
      };

      setRoles(roles.map(role => 
        role.id === selectedRole.id ? updatedRole : role
      ));
      
      toast.success(`${roleName} role has been updated successfully`);
      resetForm();
      setIsCreateModalOpen(false);
      return;
    }
    // Create new role via API
    if (!roleName.trim() || !roleDescription.trim() || selectedPermissions.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    const toastId = toast.loading("Creating role...");
    const res = await createRoleAction({
      role: roleName.trim(),
      roleDescription: roleDescription.trim(),
      permissions: selectedPermissions,
    });
    toast.dismiss(toastId);
    if (res?.data?.isSuccess) {
      toast.success(res.data.message || "Role created successfully");
      resetForm();
      setIsCreateModalOpen(false);
      loadRoles({});
    } else {
      toast.error(res?.data?.error || res?.data?.message || "Failed to create role");
    }
  };

  const handleEditRole = (role: Role) => {
    // Check if we have saved data for the same role being edited
    const saved = typeof window !== 'undefined' ? localStorage.getItem(ROLE_FORM_STORAGE_KEY) : null;
    let shouldUseSavedData = false;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Use saved data if it's for the same role in edit mode
        if (parsed && parsed.isEditMode && parsed.selectedRole?.id === role.id) {
          shouldUseSavedData = true;
          setRoleName(parsed.roleName || "");
          setRoleDescription(parsed.roleDescription || "");
          setSelectedPermissions(parsed.selectedPermissions || []);
          setCurrentStep(parsed.currentStep || 1);
        }
      } catch {}
    }
    
    if (!shouldUseSavedData) {
      // Set fresh data from the role
      setRoleName(role.name);
      setRoleDescription(role.description);
      // Map role.permissions (which may be names or IDs) to permission IDs
      const matchedIds = permissions
        .filter(p => role.permissions.includes(p.id) || role.permissions.includes(p.name))
        .map(p => p.id);
      setSelectedPermissions(matchedIds);
      setCurrentStep(1);
    }
    
    setSelectedRole(role);
    setIsEditMode(true);
    setIsCreateModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = roles.find(role => role.id === roleId);
    if (roleToDelete) {
      setRoles(roles.filter(role => role.id !== roleId));
      toast.success(`${roleToDelete.name} role has been deleted successfully`);
    }
  };

  const handleCancelModal = () => {
    resetForm();
    setIsCreateModalOpen(false);
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open);
    // Don't reset form when modal closes unless it's explicitly cancelled
  };

  const handleCreateNewRole = () => {
    // Check if we have saved data for create mode (not edit mode)
    const saved = typeof window !== 'undefined' ? localStorage.getItem(ROLE_FORM_STORAGE_KEY) : null;
    let shouldUseSavedData = false;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Use saved data if it's for create mode (not edit mode)
        if (parsed && !parsed.isEditMode) {
          shouldUseSavedData = true;
          setRoleName(parsed.roleName || "");
          setRoleDescription(parsed.roleDescription || "");
          setSelectedPermissions(parsed.selectedPermissions || []);
          setCurrentStep(parsed.currentStep || 1);
        }
      } catch {}
    }
    
    if (!shouldUseSavedData) {
      // Reset to fresh state for new role creation
      setCurrentStep(1);
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
    }
    
    setIsEditMode(false);
    setSelectedRole(null);
    setIsCreateModalOpen(true);
  };

  // Helper: get permission name from backend permissions, always apply word splitting
  function getPermissionName(permissionIdOrName: string): string {
    // Try to find by id or name in loaded permissions
    const found = permissions.find(
      (p) => p.id === permissionIdOrName || p.name === permissionIdOrName
    );
    const name = found?.name
      || availablePermissions.find(
        (p) => p.id === permissionIdOrName || p.name === permissionIdOrName
      )?.name
      || permissionIdOrName;
    // Always apply word splitting/capitalization
    return name
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([a-zA-Z])([0-9]+)/g, '$1 $2')
      .replace(/([0-9])([a-zA-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role</Label>
            <Input
              id="role-name"
              placeholder="Enter role name"
              value={roleName}
              onChange={handleRoleNameChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Role Description</Label>
            <Textarea
              id="role-description"
              placeholder="input role description"
              value={roleDescription}
              onChange={handleRoleDescriptionChange}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-4">
            <Label>Permission</Label>
            <div className="grid grid-cols-2 gap-4">
              {isPermissionsLoading ? (
                [...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-10" />
                  </div>
                ))
              ) : permissions.length > 0 ? (
                permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between py-2">
                    <button
                      type="button"
                      className="text-left text-sm flex-1 cursor-pointer select-none bg-transparent border-0 p-0 m-0"
                      onClick={() => handlePermissionToggleImmediate(permission.id)}
                      tabIndex={0}
                    >
                      {getPermissionName(permission.id)}
                    </button>
                    <Switch
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggleImmediate(permission.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm">No permissions available</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Role:</span>
              <span className="text-sm font-semibold">{roleName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Role Description:</span>
            <p className="text-sm text-foreground leading-relaxed">{roleDescription}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Permission:</span>
            <div className="flex flex-wrap gap-2">
              {selectedPermissions.map(id => {
                const label = getPermissionName(id);
                return (
                  <span
                    key={id}
                    className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
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
          <ResponsiveModal open={isCreateModalOpen} onOpenChange={handleModalOpenChange}>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleCreateNewRole}
            >
             <span className="hidden md:block">Create New Role</span>
              <Plus className="md:ml-2 w-4 h-4" />
            </Button>
            <ResponsiveModalContent className="">
              <ResponsiveModalHeader>
                <ResponsiveModalTitle className="flex items-center justify-between">
                  {currentStep === 1 ? (isEditMode ? "Edit Role" : "Create New Role") : "Confirm Details"}
                </ResponsiveModalTitle>
              </ResponsiveModalHeader>
              
              {renderStepContent()}

              <ResponsiveModalFooter>
                <Button 
                  variant="outline"
                  onClick={handleCancelModal}
                >
                  Cancel
                </Button>
                {currentStep === 2 && (
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Previous
                  </Button>
                )}
                {currentStep === 1 ? (
                  <Button 
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {isEditMode ? "Update Role" : "Create Role"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCreateRole}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Confirm & Submit
                  </Button>
                )}
              </ResponsiveModalFooter>
            </ResponsiveModalContent>
          </ResponsiveModal>

          <Button variant="outline" size="icon" className="text-muted-foreground border-border">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Roles List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, idx) => (
            <Card key={idx} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          filteredRoles.map((role) => (
          <Card key={role.id} className="w-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <h3 className="text-lg font-semibold">{role.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditRole(role)}>
                        Edit role
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleRoleExpansion(role.id)}
                  >
                    {role.isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {role.isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Role Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{role.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permissionId) => (
                        <Badge
                          key={permissionId}
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1"
                        >
                          {getPermissionName(permissionId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          ))
        )}
      </div>

      {!isLoading && filteredRoles.length === 0 && searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          No roles found matching your search.
        </div>
      )}

      {!isLoading && roles.length === 0 && !searchTerm && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-lg font-medium mb-2 text-foreground">No roles available</p>
          <p className="text-sm">Create a role to get started.</p>
        </div>
      )}
    </div>
  );
} 