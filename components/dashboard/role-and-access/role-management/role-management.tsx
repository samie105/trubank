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

// Mock roles data
const mockRoles: Role[] = [
  {
    id: "1",
    name: "Branch Manager",
    description: "Oversees daily branch operations, Manages and trains branch staff, Approves loans up to $100,000, Develops and implements sales strategies, Ensures compliance with bank policies and regulations",
    permissions: ["view_dashboard", "manage_dashboard", "view_customers", "manage_customers", "view_accounts", "manage_accounts", "view_branch", "manage_branch", "view_bank_staffs", "manage_bank_staffs"]
  },
  {
    id: "2", 
    name: "IT Support",
    description: "Oversees daily branch operations, Manages and trains branch staff, Approves loans up to $100,000, Develops and implements sales strategies, Ensures compliance with bank policies and regulations",
    permissions: ["view_dashboard", "manage_dashboard", "view_customers", "manage_customers", "view_accounts", "manage_accounts", "view_branch", "manage_branch", "view_bank_staffs", "manage_bank_staffs"]
  },
  {
    id: "3",
    name: "Teller",
    description: "Processes transactions accurately and efficiently, Handles cash, deposits, and withdrawals, Maintains cash drawer and reconciles discrepancies, Provides basic account information to customers, Identifies and refers sales opportunities",
    permissions: ["view_dashboard", "view_customers", "view_accounts", "view_branch"]
  },
  {
    id: "4",
    name: "Branch Manager",
    description: "Oversees daily branch operations, Manages and trains branch staff, Approves loans up to $100,000, Develops and implements sales strategies, Ensures compliance with bank policies and regulations",
    permissions: ["view_dashboard", "manage_dashboard", "view_customers", "manage_customers", "view_accounts", "manage_accounts", "view_branch", "manage_branch", "view_bank_staffs", "manage_bank_staffs"]
  }
];

export default function RoleManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

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



  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const resetForm = () => {
    setCurrentStep(1);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setIsEditMode(false);
    setSelectedRole(null);
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

  const handleCreateRole = () => {
    if (isEditMode && selectedRole) {
      // Update existing role
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
    } else {
      // Create new role
      const newRole: Role = {
        id: (roles.length + 1).toString(),
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions
      };

      setRoles([...roles, newRole]);
      toast.success(`${roleName} role has been created successfully`);
    }
    
    resetForm();
    setIsCreateModalOpen(false);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditMode(true);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions);
    setCurrentStep(1);
    setIsCreateModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = roles.find(role => role.id === roleId);
    if (roleToDelete) {
      setRoles(roles.filter(role => role.id !== roleId));
      toast.success(`${roleToDelete.name} role has been deleted successfully`);
    }
  };

  const getPermissionName = (permissionId: string) => {
    return availablePermissions.find(p => p.id === permissionId)?.name || permissionId;
  };

  const getSelectedPermissionNames = () => {
    return selectedPermissions.map(id => getPermissionName(id)).join(", ");
  };

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
              onChange={(e) => setRoleName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">Role Description</Label>
            <Textarea
              id="role-description"
              placeholder="input role description"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-4">
            <Label>Permission</Label>
            <div className="grid grid-cols-2 gap-4">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between py-2">
                  <span className="text-sm">{permission.name}</span>
                  <Switch
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                  />
                </div>
              ))}
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
            <p className="text-sm text-foreground">{getSelectedPermissionNames()}</p>
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
          <ResponsiveModal open={isCreateModalOpen} onOpenChange={(open) => {
            setIsCreateModalOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
            >
              Create New Role
              <Plus className="ml-2 w-4 h-4" />
            </Button>
            <ResponsiveModalContent className="sm:max-w-2xl">
              <ResponsiveModalHeader>
                <ResponsiveModalTitle className="flex items-center justify-between">
                  {currentStep === 1 ? (isEditMode ? "Edit Role" : "Create New Role") : "Confirm Details"}
                
                </ResponsiveModalTitle>
              </ResponsiveModalHeader>
              
              {renderStepContent()}

              <ResponsiveModalFooter>
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
        {filteredRoles.map((role) => (
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
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No roles found matching your search.
        </div>
      )}
    </div>
  );
} 