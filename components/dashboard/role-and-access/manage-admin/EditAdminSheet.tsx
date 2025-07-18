import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, User, Mail, Building, Users, Briefcase, MapPin, Crown, ArrowUpRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Option { id: string; name: string; }

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
  roleId?: string;
  positionId?: string;
  departmentId?: string;
  teamId?: string;
  branchId?: string;
  countryCode?: string;
  isHeadOfDepartment?: boolean;
  viewAllTeamAct?: boolean;
  viewAllDepartmentAct?: boolean;
}

interface AdminWithNames extends Admin {
  firstName: string;
  lastName: string;
}

interface EditAdminSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminWithNames | null;
  onSave: (data: AdminWithNames) => void;
  onDelete: (id: string) => void;
  onViewProfile: (admin: AdminWithNames) => void;
  roles: Option[];
  teams: Option[];
  departments: Option[];
  positions: Option[];
  branches: Option[];
  isLoading?: boolean;
}

export function EditAdminSheet({
  open,
  onOpenChange,
  admin,
  onSave,
  onDelete,
  onViewProfile,
  roles,
  teams,
  departments,
  positions,
  branches,
  isLoading = false,
}: EditAdminSheetProps) {
  const [form, setForm] = useState(() => ({
    firstName: admin?.firstName || "",
    lastName: admin?.lastName || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    countryCode: admin?.countryCode || "+234",
    roleId: admin?.roleId || "",
    teamId: admin?.teamId || "",
    departmentId: admin?.departmentId || "",
    positionId: admin?.positionId || "",
    branchId: admin?.branchId || "",
    isHeadOfDepartment: admin?.isHeadOfDepartment ? "yes" : "no",
    viewAllTeamAct: admin?.viewAllTeamAct ?? false,
    viewAllDepartmentAct: admin?.viewAllDepartmentAct ?? false,
  }));

  React.useEffect(() => {
    setForm({
      firstName: admin?.firstName || "",
      lastName: admin?.lastName || "",
      email: admin?.email || "",
      phone: admin?.phone || "",
      countryCode: admin?.countryCode || "+234",
      roleId: admin?.roleId || "",
      teamId: admin?.teamId || "",
      departmentId: admin?.departmentId || "",
      positionId: admin?.positionId || "",
      branchId: admin?.branchId || "",
      isHeadOfDepartment: admin?.isHeadOfDepartment ? "yes" : "no",
      viewAllTeamAct: admin?.viewAllTeamAct ?? false,
      viewAllDepartmentAct: admin?.viewAllDepartmentAct ?? false,
    });
  }, [admin]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSelect(name: string, value: string) {
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSwitch(name: string, value: boolean) {
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...(admin as AdminWithNames),
      ...form,
      roleId: form.roleId || "",
      teamId: form.teamId || "",
      departmentId: form.departmentId || "",
      positionId: form.positionId || "",
      branchId: form.branchId || "",
      isHeadOfDepartment: form.isHeadOfDepartment === "yes",
      viewAllTeamAct: form.viewAllTeamAct,
      viewAllDepartmentAct: form.viewAllDepartmentAct,
    });
  }

  if (!admin) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-2xl w-96 p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="px-6 py-4 border-b bg-muted/30">
            <SheetTitle className="text-xl font-semibold">Edit Admin Details</SheetTitle>
           
          </SheetHeader>

          {/* Admin Profile Header */}
          <div className="px-6 py-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-border">
                  <AvatarImage src={admin.avatar} className="object-cover" />
                  <AvatarFallback className="text-lg font-medium">
                    {admin.firstName?.[0]}{admin.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <User className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{admin.firstName} {admin.lastName}</h3>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {admin.email}
                </p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => onViewProfile(admin)}
                className="shrink-0"
              >
                <ArrowUpRight className="size-4"/>
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input 
                  id="firstName"
                  name="firstName" 
                  value={form.firstName} 
                  onChange={handleChange} 
                  required 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input 
                  id="lastName"
                  name="lastName" 
                  value={form.lastName} 
                  onChange={handleChange} 
                  required 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input 
                  id="email"
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Phone Number</Label>
                <div className="flex gap-2">
                  <Select value={form.countryCode} onValueChange={v => handleSelect("countryCode", v)}>
                    <SelectTrigger className="w-20 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+234">+234</SelectItem>
                   
                    </SelectContent>
                  </Select>
                  <Input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="flex-1 h-10" 
                    placeholder="Enter phone number"
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Role
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={form.roleId} onValueChange={v => handleSelect("roleId", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  Position
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={form.positionId} onValueChange={v => handleSelect("positionId", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  Department
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={form.departmentId} onValueChange={v => handleSelect("departmentId", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Team
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={form.teamId} onValueChange={v => handleSelect("teamId", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Branch
                </Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={form.branchId} onValueChange={v => handleSelect("branchId", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Head of Department</Label>
                <Select value={form.isHeadOfDepartment} onValueChange={v => handleSelect("isHeadOfDepartment", v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-between gap-6">
                <div className="flex items-center px-2 py-4  border rounded-lg justify-between gap-2">
                  <Label className="text-sm font-medium text-nowrap">View All Team Activity</Label>
                  <Switch
                    checked={form.viewAllTeamAct}
                    onCheckedChange={v => handleSwitch("viewAllTeamAct", v)}
                  />
                </div>
                <div className="flex items-center px-2 py-4 border rounded-lg justify-between gap-2">
                  <Label className="text-sm font-medium text-nowrap">View All Department Activity</Label>
                  <Switch
                    checked={form.viewAllDepartmentAct}
                    onCheckedChange={v => handleSwitch("viewAllDepartmentAct", v)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t bg-muted/30">
            <Button 
              type="button" 
              variant="destructive" 
              size="sm"
              className="bg-destructive/10 text-red-500 border-red-500/80 hover:bg-red-500/10" 
              onClick={() => onDelete(admin.id)}
            >
              <Trash2 className="mr-2 w-4 h-4" /> 
              Delete User
            </Button>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                className="bg-[#F59E0B] hover:bg-[#d97706] text-white min-w-[120px]"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
} 