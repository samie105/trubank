"use client";

import React, { useState } from "react";
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
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/dialog-2";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Download, 
  Settings,
  MoreVertical,
  Users,
  Clock,
  XCircle,
  AlertTriangle,
  
} from "lucide-react";
import { toast } from "sonner";

interface RequestLog {
  id: string;
  activityName: string;
  initiator: string;
  initiationDate: string;
  activityType: string;
  assignedWorkflow: string;
  status: "Initiated" | "Under Review" | "Approved" | "Rejected";
  comment?: string;
  hasWarning?: boolean;
}

// Mock data for request logs
const mockRequestLogs: RequestLog[] = [
  {
    id: "1",
    activityName: "Individual Customer Creation",
    initiator: "Samuel Ikechukwu",
    initiationDate: "21 August 2024",
    activityType: "Create User",
    assignedWorkflow: "Customer Creation",
    status: "Initiated"
  },
  {
    id: "2",
    activityName: "Individual Customer Creation",
    initiator: "Samuel Ikechukwu", 
    initiationDate: "20 August 2024",
    activityType: "Create User",
    assignedWorkflow: "Customer Creation",
    status: "Under Review",
    comment: "Arcu felis sed sed faucibus a tortor in ultricies. Placerat convallis iaculis in orci lectus vulputate urna amet. Ultrices sed quam consequat adipiscing lorem integer nisl tempor."
  },
  {
    id: "3",
    activityName: "Business Customer Creation",
    initiator: "Samuel Ikechukwu",
    initiationDate: "18 August 2024", 
    activityType: "Create User",
    assignedWorkflow: "Customer Creation",
    status: "Approved"
  },
  {
    id: "4",
    activityName: "Product Creation",
    initiator: "Samuel Ikechukwu",
    initiationDate: "17 August 2024",
    activityType: "Create Product", 
    assignedWorkflow: "Product Creation",
    status: "Under Review"
  },
  {
    id: "5", 
    activityName: "Product Creation",
    initiator: "Samuel Ikechukwu",
    initiationDate: "16 August 2024",
    activityType: "Create Product",
    assignedWorkflow: "Product Creation", 
    status: "Rejected",
    hasWarning: true,
    comment: "Product specifications do not meet the required criteria. Please review and resubmit with proper documentation."
  },
  {
    id: "6",
    activityName: "Team Creation", 
    initiator: "Samuel Ikechukwu",
    initiationDate: "15 August 2024",
    activityType: "Create Team",
    assignedWorkflow: "Team Creation",
    status: "Initiated"
  },
  {
    id: "7",
    activityName: "Role Creation",
    initiator: "Samuel Ikechukwu", 
    initiationDate: "13 August 2024",
    activityType: "Create Role",
    assignedWorkflow: "Role Creation",
    status: "Approved"
  },
  {
    id: "8",
    activityName: "Admin Creation",
    initiator: "Samuel Ikechukwu",
    initiationDate: "10 August 2024", 
    activityType: "Create Admin",
    assignedWorkflow: "Admin Creation",
    status: "Approved"
  },
  {
    id: "9",
    activityName: "Team Creation",
    initiator: "Samuel Ikechukwu",
    initiationDate: "07 August 2024",
    activityType: "Create Team", 
    assignedWorkflow: "Team Creation",
    status: "Under Review"
  },
  {
    id: "10",
    activityName: "Product Creation",
    initiator: "Samuel Ikechukwu",
    initiationDate: "06 August 2024",
    activityType: "Create Product",
    assignedWorkflow: "Product Creation",
    status: "Rejected",
    hasWarning: true,
    comment: "Missing required compliance documentation and risk assessment report."
  }
];

export default function RequestLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  
  const logs = mockRequestLogs;

  const filteredLogs = logs.filter(log =>
    log.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.initiator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.assignedWorkflow.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalLogs = logs.length;
  const pendingLogs = logs.filter(log => log.status === "Under Review").length;
  const rejectedLogs = logs.filter(log => log.status === "Rejected").length;

  const handleViewComment = (log: RequestLog) => {
    setSelectedLog(log);
    setIsCommentModalOpen(true);
  };

  const handleExport = () => {
    toast.success("Request logs exported successfully");
  };

  const getStatusBadge = (status: RequestLog["status"]) => {
    const statusConfig = {
      "Initiated": {
        className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        text: "Initiated"
      },
      "Under Review": {
        className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200", 
        text: "Under Review"
      },
      "Approved": {
        className: "bg-green-100 text-green-700 hover:bg-green-200",
        text: "Approved"
      },
      "Rejected": {
        className: "bg-red-100 text-red-700 hover:bg-red-200",
        text: "Rejected"
      }
    };

    const config = statusConfig[status];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.text}
      </Badge>
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
          <Button variant="outline" onClick={handleExport} className="text-muted-foreground border-border">
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
                <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                <p className="text-3xl font-bold">{totalLogs}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{pendingLogs}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected Logs</p>
                <p className="text-3xl font-bold">{rejectedLogs}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Logs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ACTIVITY NAME</TableHead>
              <TableHead>INITIATOR</TableHead>
              <TableHead>INITIATION DATE</TableHead>
              <TableHead>ACTIVITY TYPE</TableHead>
              <TableHead>ASSIGNED WORKFLOW</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="font-medium">{log.activityName}</div>
                </TableCell>
                <TableCell>{log.initiator}</TableCell>
                <TableCell>{log.initiationDate}</TableCell>
                <TableCell>{log.activityType}</TableCell>
                <TableCell>{log.assignedWorkflow}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(log.status)}
                    {log.hasWarning && (
                      <button
                        onClick={() => handleViewComment(log)}
                        className="hover:bg-yellow-50 rounded-full p-1 transition-colors"
                        title="View comment"
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {log.comment && (
                        <DropdownMenuItem onClick={() => handleViewComment(log)}>
                          View Comment
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Download Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No request logs found matching your search.
        </div>
      )}

      {/* Comment Modal */}
      <ResponsiveModal open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <ResponsiveModalContent className="sm:max-w-md">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Comment
              </div>
            
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>
          
          {selectedLog && (
            <div className="p-6">
              <p className="text-sm text-foreground leading-relaxed">
                {selectedLog.comment}
              </p>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
} 