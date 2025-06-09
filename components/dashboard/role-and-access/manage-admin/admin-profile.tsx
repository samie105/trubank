"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MoreVertical } from "lucide-react";

// Mock data - in real app, this would come from an API
const mockAdmins = [
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
    status: "Active" as const,
    branch: "Ikeja",
    viewTeamActivity: "Yes",
    viewDepartmentActivity: "No",
    avatar: undefined
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
    status: "Inactive" as const,
    branch: "Ikeja",
    viewTeamActivity: "Yes",
    viewDepartmentActivity: "No",
    avatar: undefined
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
    status: "Active" as const,
    branch: "Ikeja",
    viewTeamActivity: "Yes",
    viewDepartmentActivity: "No",
    avatar: undefined
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
    status: "Inactive" as const,
    branch: "Ikeja",
    viewTeamActivity: "Yes",
    viewDepartmentActivity: "No",
    avatar: undefined
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
    status: "Active" as const,
    branch: "Ikeja",
    viewTeamActivity: "Yes",
    viewDepartmentActivity: "No",
    avatar: undefined
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
    status: "Inactive" as const,
    branch: "Ikeja",
    viewTeamActivity: "Yes",
    viewDepartmentActivity: "No",
    avatar: undefined
  }
];

interface AdminProfileProps {
  adminId: string;
}

export default function AdminProfile({ adminId }: AdminProfileProps) {
  const router = useRouter();
  const admin = mockAdmins.find(a => a.id === adminId);

  if (!admin) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Admin not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Details</h1>
          <div className="w-16 h-1 bg-primary rounded-full mt-2"></div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={admin.avatar} />
                  <AvatarFallback className="text-xl font-semibold">
                    {admin.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {admin.name}
                  </h2>
                  <p className="text-lg text-muted-foreground">{admin.email}</p>
                  <Badge 
                    variant={admin.status === "Active" ? "default" : "secondary"}
                    className={`${
                      admin.status === "Active" 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } flex items-center gap-2 w-fit text-sm px-3 py-1`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      admin.status === "Active" ? "bg-green-500" : "bg-gray-500"
                    }`}></div>
                    {admin.status}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Gender</p>
                <p className="text-lg font-medium text-foreground">{admin.gender === "M" ? "Male" : "Female"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Phone Number</p>
                <p className="text-lg font-medium text-foreground">{admin.phone}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Email Address</p>
                <p className="text-lg font-medium text-foreground break-all">{admin.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Role</p>
                <p className="text-lg font-medium text-foreground">{admin.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Team</p>
                <p className="text-lg font-medium text-foreground">{admin.team}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Department</p>
                <p className="text-lg font-medium text-foreground">{admin.department}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Position</p>
                <p className="text-lg font-medium text-foreground">{admin.position}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Branch</p>
                <p className="text-lg font-medium text-foreground">{admin.branch}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Permissions */}
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Access Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">View Other Team Activities</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    admin.viewTeamActivity === "Yes" ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <p className="text-lg font-medium text-foreground">{admin.viewTeamActivity}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">View Other Department Activities</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    admin.viewDepartmentActivity === "Yes" ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <p className="text-lg font-medium text-foreground">{admin.viewDepartmentActivity}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 