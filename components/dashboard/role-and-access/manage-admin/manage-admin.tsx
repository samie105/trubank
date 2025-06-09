"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
  ResponsiveModalTrigger,
} from "@/components/ui/dialog-2";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  Download, 
  MoreVertical, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  User,
  UserCheck,
  UserX,
  Upload,
  X
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

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
}

// Mock data for admins
const mockAdmins: Admin[] = [
  {
    id: "1",
    name: "Samuel Ikenna Chukwuemeka",
    email: "samuelikenna35@gmail.com",
    phone: "08102384576",
    gender: "M",
    role: "IT Support",
    position: "Team Lead",
    department: "Operations",
    team: "Team 1",
    status: "Active"
  },
  {
    id: "2",
    name: "Samuel Ikenna Chukwuemeka",
    email: "samuelikenna35@gmail.com",
    phone: "08102384576",
    gender: "M",
    role: "IT Support",
    position: "Team Lead",
    department: "Operations",
    team: "Team 1",
    status: "Inactive"
  },
  {
    id: "3",
    name: "Samuel Ikenna Chukwuemeka",
    email: "samuelikenna35@gmail.com",
    phone: "08102384576",
    gender: "M",
    role: "IT Support",
    position: "Team Lead",
    department: "Operations",
    team: "Team 1",
    status: "Active"
  },
  {
    id: "4",
    name: "Samuel Ikenna Chukwuemeka",
    email: "samuelikenna35@gmail.com",
    phone: "08102384576",
    gender: "M",
    role: "IT Support",
    position: "Team Lead",
    department: "Operations",
    team: "Team 1",
    status: "Inactive"
  },
  {
    id: "5",
    name: "Samuel Ikenna Chukwuemeka",
    email: "samuelikenna35@gmail.com",
    phone: "08102384576",
    gender: "M",
    role: "IT Support",
    position: "Team Lead",
    department: "Operations",
    team: "Team 1",
    status: "Active"
  },
  {
    id: "6",
    name: "Samuel Ikenna Chukwuemeka",
    email: "samuelikenna35@gmail.com",
    phone: "08102384576",
    gender: "M",
    role: "IT Support",
    position: "Team Lead",
    department: "Operations",
    team: "Team 1",
    status: "Inactive"
  },
];

const teams = ["Team 1", "Team 2", "Team 3"];
const departments = ["IT Support", "Customer Support", "Operations", "Finance", "HR"];
const positions = ["Team Lead", "Manager", "Supervisor", "Staff"];
const branches = ["Ikeja", "Victoria Island", "Lekki", "Surulere"];
const genders = ["Male", "Female"];
const roles = ["IT Support", "Admin", "Manager", "Supervisor"];

export default function ManageAdmin() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form states
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [viewTeamActivity, setViewTeamActivity] = useState("no");
  const [viewDepartmentActivity, setViewDepartmentActivity] = useState("no");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAdmins = admins.length;
  const activeAdmins = admins.filter(admin => admin.status === "Active").length;
  const inactiveAdmins = admins.filter(admin => admin.status === "Inactive").length;

  const handleToggleStatus = (adminId: string) => {
    setAdmins(prevAdmins =>
      prevAdmins.map(admin =>
        admin.id === adminId
          ? { ...admin, status: admin.status === "Active" ? "Inactive" : "Active" }
          : admin
      )
    );
    toast.success("Admin status updated successfully");
  };

  const handleDeleteAdmin = (adminId: string) => {
    const adminToDelete = admins.find(admin => admin.id === adminId);
    if (adminToDelete) {
      setAdmins(admins.filter(admin => admin.id !== adminId));
      toast.success(`${adminToDelete.name} has been deleted successfully`);
    }
  };

  const handleViewProfile = (admin: Admin) => {
    router.push(`/dashboard/role-and-access/manage-admin/${admin.id}`);
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsEditMode(true);
    
    // Pre-fill form with admin data
    const [first, ...rest] = admin.name.split(" ");
    setFirstName(first);
    setLastName(rest.join(" "));
    setEmail(admin.email);
    setPhoneNumber(admin.phone);
    setSelectedGender(admin.gender === "M" ? "Male" : "Female");
    setSelectedRole(admin.role);
    setSelectedTeam(admin.team);
    setSelectedDepartment(admin.department);
    setSelectedPosition(admin.position);
    setSelectedBranch("Ikeja"); // Default since not in mock data
    setViewTeamActivity("no"); // Default
    setViewDepartmentActivity("no"); // Default
    setProfileImage(null);
    
    setCurrentStep(1);
    setIsCreateModalOpen(true);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedTeam("");
    setSelectedDepartment("");
    setSelectedPosition("");
    setSelectedBranch("");
    setViewTeamActivity("no");
    setViewDepartmentActivity("no");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setSelectedGender("");
    setSelectedRole("");
    setProfileImage(null);
    setIsEditMode(false);
    setSelectedAdmin(null);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!firstName || !lastName || !email || !phoneNumber || !selectedGender || !selectedRole) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (currentStep === 2) {
      if (!selectedTeam || !selectedDepartment || !selectedPosition || !selectedBranch) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCreateAdmin = () => {
    if (isEditMode && selectedAdmin) {
      // Update existing admin
      const updatedAdmin: Admin = {
        ...selectedAdmin,
        name: `${firstName} ${lastName}`,
        email,
        phone: phoneNumber,
        gender: selectedGender === "Male" ? "M" : "F",
        role: selectedRole,
        position: selectedPosition,
        department: selectedDepartment,
        team: selectedTeam,
      };

      setAdmins(admins.map(admin => 
        admin.id === selectedAdmin.id ? updatedAdmin : admin
      ));
      
      toast.success(`${firstName} ${lastName} has been updated successfully`);
    } else {
      // Create new admin
      const newAdmin: Admin = {
        id: (admins.length + 1).toString(),
        name: `${firstName} ${lastName}`,
        email,
        phone: phoneNumber,
        gender: selectedGender === "Male" ? "M" : "F",
        role: selectedRole,
        position: selectedPosition,
        department: selectedDepartment,
        team: selectedTeam,
        status: "Active"
      };

      setAdmins([...admins, newAdmin]);
      toast.success(`${firstName} ${lastName} has been created successfully`);
    }
    
    // Reset form and close modal
    resetForm();
    setIsCreateModalOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size must be less than 5MB");
        return;
      }
      setProfileImage(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const getImagePreviewUrl = () => {
    if (profileImage) {
      return URL.createObjectURL(profileImage);
    }
    return null;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex">
                <Select defaultValue="+234">
                  <SelectTrigger className="w-20">
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
                  className="flex-1 ml-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
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
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-3">
                <Label>View all Team Act.</Label>
                <RadioGroup value={viewTeamActivity} onValueChange={setViewTeamActivity}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="team-yes" />
                    <Label htmlFor="team-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="team-no" />
                    <Label htmlFor="team-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>View all Department Act.</Label>
                <RadioGroup value={viewDepartmentActivity} onValueChange={setViewDepartmentActivity}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="dept-yes" />
                    <Label htmlFor="dept-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="dept-no" />
                    <Label htmlFor="dept-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Upload Profile Picture</Label>
              
              {profileImage ? (
                <div className="flex items-center gap-4 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="relative">
                    <Image
                      src={getImagePreviewUrl()!}
                      alt="Profile preview"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover border border-border"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profileImage.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(profileImage.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('profile-upload')?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Drop your profile here, or{" "}
                    <span className="text-primary hover:underline">
                      Browse
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">Maximum file size 5mb</p>
                  <input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 py-4">
            <div className="">
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  {profileImage ? (
                    <Avatar className="w-16 border-primary border h-16">
                      <AvatarImage src={URL.createObjectURL(profileImage)} alt="Profile" />
                      <AvatarFallback>
                        <User className="w-8 h-8 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {firstName} {lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-sm font-medium">{phoneNumber}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gender</p>
                      <p className="text-sm font-medium">{selectedGender}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Role</p>
                      <p className="text-sm font-medium">{selectedRole}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Position</p>
                      <p className="text-sm font-medium">{selectedPosition}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Team</p>
                      <p className="text-sm font-medium">{selectedTeam}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Department</p>
                      <p className="text-sm font-medium">{selectedDepartment}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Branch</p>
                      <p className="text-sm font-medium">{selectedBranch}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Team Activity</p>
                      <p className="text-sm font-medium">{viewTeamActivity === "yes" ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Department Activity</p>
                    <p className="text-sm font-medium">{viewDepartmentActivity === "yes" ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
       

      default:
        return null;
    }
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
            <ResponsiveModalTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  resetForm();
                  setIsCreateModalOpen(true);
                }}
              >
                Create New Admin
                <Plus className="ml-2 w-4 h-4" />
              </Button>
            </ResponsiveModalTrigger>
            <ResponsiveModalContent className="sm:max-w-md">
              <ResponsiveModalHeader>
                <ResponsiveModalTitle>
                  {currentStep === 3 ? "Upload Profile Picture" : currentStep === 4 ? "Confirm Details" : isEditMode ? "Edit Admin" : "Create New Admin"}
                </ResponsiveModalTitle>
              </ResponsiveModalHeader>
              
              {renderStepContent()}

              <ResponsiveModalFooter>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePreviousStep}>
                    Previous
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button 
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Next
                  </Button>
                ) : currentStep === 3 ? (
                  <Button 
                    onClick={handleNextStep}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCreateAdmin}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {currentStep === 4 ? (isEditMode ? "Update Admin" : "Create Admin") : "Next"}
                  </Button>
                )}
              </ResponsiveModalFooter>
            </ResponsiveModalContent>
          </ResponsiveModal>

          <Button variant="outline" className="text-muted-foreground border-border">
            Export
            <Download className="ml-2 w-4 h-4" />
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
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
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
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
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
            {filteredAdmins.map((admin) => (
              <TableRow key={admin.id}>
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
                <TableCell>{admin.role}</TableCell>
                <TableCell>{admin.position}</TableCell>
                <TableCell>{admin.department}</TableCell>
                <TableCell>{admin.team}</TableCell>
                <TableCell>
                  <Badge 
                    variant={admin.status === "Active" ? "default" : "secondary"}
                    className={admin.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
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
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredAdmins.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No administrators found matching your search.
        </div>
      )}
    </div>
  );
} 