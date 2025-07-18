"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from "@/components/ui/dialog-2";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, User, Briefcase, Shield, CheckCircle, ChevronLeft, ChevronRight, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { fetchDepartmentsAction } from "@/server/role-and-access/fetch-departments";
import { fetchTeamsAction } from "@/server/role-and-access/fetch-teams";
import { getAllPositionsAction } from "@/server/role-and-access/approval-workflow";
import { fetchBranchesAction } from "@/server/general/fetch-data";
import { fetchRolesAction } from "@/server/role-and-access/fetch-roles";
import { editAdminUserAction } from "@/server/role-and-access/edit-admin-user";
import { createAdminUserAction } from "@/server/role-and-access/create-admin-user";
import type { TeamApi } from "@/server/role-and-access/fetch-teams";
import type { Position } from "@/server/role-and-access/approval-workflow";
import type { Branch } from "@/server/general/fetch-data";
import type { RoleApi } from "@/server/role-and-access/fetch-roles";

// Define local types that are not exported from server files
type DepartmentApi = {
  id: string;
  name: string;
  description?: string;
  numberOfTeams: number;
  createdAt: string;
};

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
}

const genders = ["Male", "Female"];

interface ManageAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  admin: Admin | null;
  onCreate: (admin: Admin) => void;
  onUpdate: (admin: Admin) => void;
  onRefresh?: () => void;
}

export function ManageAdminModal({
  open,
  onOpenChange,
  isEditMode,
  admin,
  onCreate, // Keep for interface compatibility
  onUpdate,
  onRefresh,
}: ManageAdminModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = onCreate; // Keep for interface compatibility
  
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [viewTeamActivity, setViewTeamActivity] = useState("no");
  const [viewDepartmentActivity, setViewDepartmentActivity] = useState("no");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // Data state
  const [departments, setDepartments] = useState<DepartmentApi[]>([]);
  const [teams, setTeams] = useState<TeamApi[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<RoleApi[]>([]);

  // Loading states
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Server actions
  const { execute: editAdmin } = useAction(editAdminUserAction, {
    onExecute() {
      toast.loading("Updating admin...", { id: "edit-admin" });
    },
    onSuccess(result) {
      toast.dismiss("edit-admin");
      if (result.data?.isSuccess) {
        toast.success("Admin updated successfully");
        onOpenChange(false);
        // Refresh the admin data in parent component
        if (isEditMode && admin) {
          const updatedAdmin: Admin = {
            ...admin,
            name: `${firstName} ${lastName}`,
            email,
            phone: phoneNumber,
            gender: selectedGender === "Male" ? "M" : "F",
          };
          onUpdate(updatedAdmin);
        }
      } else {
        toast.error(result.data?.message || "Failed to update admin");
      }
    },
    onError(err) {
      toast.dismiss("edit-admin");
      toast.error(err.error?.serverError || "Failed to update admin");
    },
  });

  const { execute: createAdmin } = useAction(createAdminUserAction, {
    onExecute() {
      toast.loading("Creating admin...", { id: "create-admin" });
    },
    onSuccess(result) {
      toast.dismiss("create-admin");
      if (result.data?.isSuccess) {
        toast.success("Admin created successfully");
        onOpenChange(false);
        // Refresh the admin list in parent component
        if (onRefresh) {
          onRefresh();
        }
        // Reset form
        setCurrentStep(1);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setSelectedGender("");
        setSelectedRole("");
        setSelectedTeam("");
        setSelectedDepartment("");
        setSelectedPosition("");
        setSelectedBranch("");
        setViewTeamActivity("no");
        setViewDepartmentActivity("no");
        setProfileImage(null);
      } else {
        toast.error(result.data?.message || "Failed to create admin");
      }
    },
    onError(err) {
      toast.dismiss("create-admin");
      toast.error(err.error?.serverError || "Failed to create admin");
    },
  });

  const { execute: loadDepartments } = useAction(fetchDepartmentsAction, {
    onExecute() {
      setIsLoadingDepartments(true);
    },
    onSuccess(result) {
      setIsLoadingDepartments(false);
      if (result.data?.success) {
        setDepartments(result.data.data);
      }
    },
    onError() {
      setIsLoadingDepartments(false);
      toast.error("Failed to load departments");
    }
  });

  const { execute: loadTeams } = useAction(fetchTeamsAction, {
    onExecute() {
      setIsLoadingTeams(true);
    },
    onSuccess(result) {
      setIsLoadingTeams(false);
      if (result.data?.success) {
        setTeams(result.data.data);
      }
    },
    onError() {
      setIsLoadingTeams(false);
      toast.error("Failed to load teams");
    }
  });

  const { execute: loadPositions } = useAction(getAllPositionsAction, {
    onExecute() {
      setIsLoadingPositions(true);
    },
    onSuccess(result) {
      setIsLoadingPositions(false);
      if (result.data?.isSuccess) {
        setPositions(result.data.result.data);
      }
    },
    onError() {
      setIsLoadingPositions(false);
      toast.error("Failed to load positions");
    }
  });

  const { execute: loadBranches } = useAction(fetchBranchesAction, {
    onExecute() {
      setIsLoadingBranches(true);
    },
    onSuccess(result) {
      setIsLoadingBranches(false);
      if (result.data?.success) {
        setBranches(result.data.data || []);
      }
    },
    onError() {
      setIsLoadingBranches(false);
      toast.error("Failed to load branches");
    }
  });

  const { execute: loadRoles } = useAction(fetchRolesAction, {
    onExecute() {
      setIsLoadingRoles(true);
    },
    onSuccess(result) {
      setIsLoadingRoles(false);
      if (result.data?.success) {
        setRoles(result.data.data);
      }
    },
    onError() {
      setIsLoadingRoles(false);
      toast.error("Failed to load roles");
    }
  });

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadDepartments({});
      loadTeams({});
      loadPositions({});
      loadBranches();
      loadRoles({});
    }
  }, [open, loadDepartments, loadTeams, loadPositions, loadBranches, loadRoles]);

  useEffect(() => {
    if (open) {
      if (isEditMode && admin) {
        const [first, ...rest] = admin.name.split(" ");
        setFirstName(first);
        setLastName(rest.join(" "));
        setEmail(admin.email);
        setPhoneNumber(admin.phone);
        setSelectedGender(admin.gender === "M" ? "Male" : "Female");
        
        // Use IDs if available, otherwise fallback to names for backward compatibility
        setSelectedRole(admin.roleId || admin.role);
        setSelectedTeam(admin.teamId || admin.team);
        setSelectedDepartment(admin.departmentId || admin.department);
        setSelectedPosition(admin.positionId || admin.position);
        setSelectedBranch(admin.branchId || "");
        
        setViewTeamActivity("no");
        setViewDepartmentActivity("no");
        setProfileImage(null);
        setCurrentStep(1);
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditMode, admin]);

  function resetForm() {
    setCurrentStep(1);
    setSelectedTeam("");
    setSelectedDepartment("");
    setSelectedPosition("");
    setSelectedBranch("");
    setSelectedRole("");
    setSelectedGender("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setViewTeamActivity("no");
    setViewDepartmentActivity("no");
    setProfileImage(null);
  }

  function handleNext() {
    // Validate password fields on step 2 if password is provided
    if (currentStep === 2 && password) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      // if (password.length < 8) {
      //   toast.error("Password must be at least 8 characters long");
      //   return;
      // }
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  }

  function handlePrevious() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size should be less than 5MB");
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, JPG and PNG files are allowed");
        return;
      }
      
      setProfileImage(file);
    }
  }

  function removeImage() {
    setProfileImage(null);
  }

  function handleSubmit() {
    if (isEditMode && admin) {
      // Use the edit API for updating existing admin
      editAdmin({
        userId: admin.id,
        firstName,
        lastName,
        emailAddress: email,
        phoneNumber,
        gender: selectedGender.toLowerCase(),
        roleId: selectedRole || undefined,
        teamId: selectedTeam || undefined,
        departmentId: selectedDepartment || undefined,
        positionId: selectedPosition || undefined,
        branchId: selectedBranch || undefined,
        viewAllTeamAct: viewTeamActivity === "yes",
        viewAllDepartmentAct: viewDepartmentActivity === "yes",
        profilePicture: profileImage ?? undefined, // Pass the file directly
      });
    } else {
      // Validate required fields before creating new admin
      if (!firstName || !lastName || !email || !phoneNumber || !selectedGender || 
          !selectedRole || !selectedTeam || !selectedDepartment || !selectedPosition || !selectedBranch) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate password if provided
      if (password && password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // Use the create API for creating new admin
      createAdmin({
        firstName,
        lastName,
        emailAddress: email,
        phoneNumber,
        password: password || undefined, // Send password only if provided
        gender: selectedGender,
        roleId: selectedRole,
        teamId: selectedTeam,
        departmentId: selectedDepartment,
        positionId: selectedPosition,
        branchId: selectedBranch,
        viewAllTeamAct: viewTeamActivity === "yes",
        viewAllDepartmentAct: viewDepartmentActivity === "yes",
        profilePicture: profileImage ?? undefined, // Pass the file directly
      });
    }
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone number</Label>
                <div className="flex gap-2">
                  <Select defaultValue="+234">
                    <SelectTrigger className="w-20 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+234">+234</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    placeholder="123 456 7890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 h-11"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="h-11">
                    {isLoadingRoles ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    ) : (
                      <SelectValue placeholder="Select Role" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRoles ? (
                      <>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                      </>
                    ) : roles.length === 0 ? (
                      <SelectItem value="no-data" disabled>No roles available</SelectItem>
                    ) : (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.roleName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team" className="text-sm font-medium">Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="h-11">
                    {isLoadingTeams ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    ) : (
                      <SelectValue placeholder="Select Team" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTeams ? (
                      <>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                      </>
                    ) : teams.length === 0 ? (
                      <SelectItem value="no-data" disabled>No teams available</SelectItem>
                    ) : (
                      teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="h-11">
                    {isLoadingDepartments ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    ) : (
                      <SelectValue placeholder="Select Department" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDepartments ? (
                      <>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                      </>
                    ) : departments.length === 0 ? (
                      <SelectItem value="no-data" disabled>No departments available</SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger className="h-11">
                    {isLoadingPositions ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    ) : (
                      <SelectValue placeholder="Select Position" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingPositions ? (
                      <>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                      </>
                    ) : positions.length === 0 ? (
                      <SelectItem value="no-data" disabled>No positions available</SelectItem>
                    ) : (
                      positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch" className="text-sm font-medium">Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="h-11">
                    {isLoadingBranches ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </div>
                    ) : (
                      <SelectValue placeholder="Select Branch" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingBranches ? (
                      <>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                        <div className="px-2 py-1.5">
                          <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        </div>
                      </>
                    ) : branches.length === 0 ? (
                      <SelectItem value="no-data" disabled>No branches available</SelectItem>
                    ) : (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password (Optional)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* <p className="text-xs text-muted-foreground">Leave empty to generate a random password</p> */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 pr-10"
                    disabled={!password}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={!password}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-4 block">Permissions</Label>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-3">
                      <Label className="text-sm font-medium">View All Team Activities</Label>
                      <p className="text-sm text-muted-foreground">Allow this admin to view activities across all teams</p>
                      <RadioGroup
                        value={viewTeamActivity}
                        onValueChange={setViewTeamActivity}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="team-yes" />
                          <Label htmlFor="team-yes" className="text-sm">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="team-no" />
                          <Label htmlFor="team-no" className="text-sm">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="p-4 border rounded-lg space-y-3">
                      <Label className="text-sm font-medium">View All Department Activities</Label>
                      <p className="text-sm text-muted-foreground">Allow this admin to view activities across all departments</p>
                      <RadioGroup
                        value={viewDepartmentActivity}
                        onValueChange={setViewDepartmentActivity}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="dept-yes" />
                          <Label htmlFor="dept-yes" className="text-sm">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="dept-no" />
                          <Label htmlFor="dept-no" className="text-sm">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 py-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">Upload a profile picture for the admin</p>
              </div>
              
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-border shadow-lg">
                    {profileImage ? (
                      <AvatarImage 
                        src={URL.createObjectURL(profileImage)} 
                        alt="Profile preview"
                        className="object-cover"
                      />
                    ) : admin?.avatar ? (
                      <AvatarImage 
                        src={admin.avatar} 
                        alt="Current profile"
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {profileImage && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full shadow-lg"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="w-full max-w-md">
                  <label htmlFor="profile-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">JPEG, JPG or PNG (max. 5MB)</p>
                      </div>
                    </div>
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                {(profileImage || admin?.avatar) && (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={removeImage}>
                      <X className="w-4 h-4 mr-2" />
                      Remove Image
                    </Button>
                    <label htmlFor="profile-upload">
                      <Button variant="secondary" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Change Image
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 py-6">
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-xl font-semibold">Review Admin Details</h3>
              <p className="text-sm text-muted-foreground">Please review the information before proceeding</p>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-border shadow-lg">
                  {profileImage ? (
                    <AvatarImage 
                      src={URL.createObjectURL(profileImage)} 
                      alt="Profile preview"
                      className="object-cover"
                    />
                  ) : admin?.avatar ? (
                    <AvatarImage 
                      src={admin.avatar} 
                      alt="Current profile"
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-xl">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              <div className="w-full max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {/* Personal Information Card */}
                  <div className="border rounded-lg p-6 space-y-4">
                   
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Name:</span>
                        <span className="text-sm font-medium">{firstName} {lastName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Email:</span>
                        <span className="text-sm font-medium">{email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                        <span className="text-sm font-medium">+234{phoneNumber}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-muted-foreground">Gender:</span>
                        <span className="text-sm font-medium">{selectedGender}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Work Information Card */}
                  <div className="border rounded-lg p-6 space-y-4">
                  
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Role:</span>
                        <span className="text-sm font-medium">{roles.find(r => r.id === selectedRole)?.roleName || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Position:</span>
                        <span className="text-sm font-medium">{positions.find(p => p.id === selectedPosition)?.name || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Department:</span>
                        <span className="text-sm font-medium">{departments.find(d => d.id === selectedDepartment)?.name || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Team:</span>
                        <span className="text-sm font-medium">{teams.find(t => t.id === selectedTeam)?.name || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-muted-foreground">Branch:</span>
                        <span className="text-sm font-medium">{branches.find(b => b.id === selectedBranch)?.name || "Not selected"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Permissions Card */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Team Permissions
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">View All Team Activities:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          viewTeamActivity === "yes" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {viewTeamActivity === "yes" ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Department Permissions Card */}
                  <div className="border rounded-lg p-6 space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Department Permissions
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">View All Department Activities:</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          viewDepartmentActivity === "yes" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {viewDepartmentActivity === "yes" ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden">
        <ResponsiveModalHeader className="border-b pb-4 shrink-0">
          <ResponsiveModalTitle className="text-xl font-bold">
            {isEditMode ? "Edit Admin" : "Create New Admin"}
          </ResponsiveModalTitle>
          <div className="flex items-center justify-center space-x-1 mt-4">
            {[
              { step: 1, label: "Information", icon: User },
              { step: 2, label: "Information", icon: Briefcase },
              { step: 3, label: "Profile Picture", icon: Shield },
              { step: 4, label: "Review", icon: CheckCircle }
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      step <= currentStep
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium text-nowrap mt-2 transition-colors ${
                    step <= currentStep
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}>
                    {label}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`w-6 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                      step < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </ResponsiveModalHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="min-h-[300px] max-h-[500px]">
            {renderStepContent()}
          </div>
        </div>

        <ResponsiveModalFooter className="border-t pt-4 shrink-0 bg-card">
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 hover:bg-muted/80 transition-colors"
              >
                Cancel
              </Button>
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  className="px-4 py-2 hover:bg-muted/80 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div>
              {currentStep < 4 ? (
                <Button 
                  onClick={handleNext}
                  className="px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Admin" : "Create Admin"}
                </Button>
              )}
            </div>
          </div>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}