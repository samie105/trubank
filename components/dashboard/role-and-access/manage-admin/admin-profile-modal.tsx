"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/dialog-2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, Users, Building, MapPin, Calendar, Flag } from "lucide-react";

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
  viewAllTeamAct?: boolean;
  viewAllDepartmentAct?: boolean;
}

interface Branch { id: string; name: string; branchCode?: string; }
interface Team { id: string; name: string; }
interface Department { id: string; name: string; }
interface Position { id: string; name: string; }

interface AdminProfileModalProps {
  admins: Admin[];
  branches: Branch[];
  teams: Team[];
  departments: Department[];
  positions: Position[];
}

export function AdminProfileModal({ admins, branches, teams, departments, positions }: AdminProfileModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Get profile ID from URL
  const profileId = searchParams.get("profile");

  useEffect(() => {
    if (profileId && admins.length > 0) {
      const admin = admins.find(a => a.id === profileId);
      if (admin) {
        setSelectedAdmin(admin);
        setIsOpen(true);
      }
    } else {
      setSelectedAdmin(null);
      setIsOpen(false);
    }
  }, [profileId, admins]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove profile query parameter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("profile");
    const newUrl = newSearchParams.toString() 
      ? `${window.location.pathname}?${newSearchParams.toString()}`
      : window.location.pathname;
    router.replace(newUrl);
  };

  if (!selectedAdmin) {
    return null;
  }

  const branchName = branches.find(b => b.id === selectedAdmin.branchId)?.name || "Not specified";
  const teamName = teams.find(t => t.id === selectedAdmin.teamId)?.name || selectedAdmin.team || "Not specified";
  const departmentName = departments.find(d => d.id === selectedAdmin.departmentId)?.name || selectedAdmin.department || "Not specified";
  const positionName = positions.find(p => p.id === selectedAdmin.positionId)?.name || selectedAdmin.position || "Not specified";
  const roleName = selectedAdmin.role || "Not specified";

  return (
    <ResponsiveModal open={isOpen} onOpenChange={handleClose}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Admin Profile</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className="space-y-6 py-4">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={selectedAdmin.avatar} alt={selectedAdmin.name} />
              <AvatarFallback className="text-lg">
                {selectedAdmin.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{selectedAdmin.name}</h2>
              <p className="text-muted-foreground">{roleName}</p>
              <Badge 
                variant={selectedAdmin.status === "Active" ? "default" : "secondary"}
                className={selectedAdmin.status === "Active" 
                  ? "bg-green-500/10 text-green-700 hover:bg-green-200" 
                  : "bg-gray-500/10 text-gray-700 hover:bg-gray-200"
                }
              >
                {selectedAdmin.status}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedAdmin.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedAdmin.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">
                      {selectedAdmin.gender === "M" || selectedAdmin.gender === "male" ? "Male" : "Female"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{departmentName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="font-medium">{teamName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Flag className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{positionName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{roleName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">{branchName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <div className="rounded-2xl border border-muted p-8 bg-background">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-8">
             
              <div>
                <div className="text-muted-foreground text-sm mb-1">View Other Team Activities</div>
                <div className="font-medium">{selectedAdmin.viewAllTeamAct ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm mb-1">View Other Department Activities</div>
                <div className="font-medium">{selectedAdmin.viewAllDepartmentAct ? "Yes" : "No"}</div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
} 