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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Download, 
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  date: string;
  time: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
}

// Mock data for audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    date: "26, Aug 2024",
    time: "6:30 PM",
    user: {
      name: "Samuel Ikenna Chukwuemeka",
      email: "samuelikenna35@gmail.com"
    },
    action: "Processing loan payments"
  },
  {
    id: "2", 
    date: "24, Aug 2024",
    time: "3:10 PM",
    user: {
      name: "Samuel Ikenna Chukwuemeka",
      email: "samuelikenna35@gmail.com"
    },
    action: "Handling customer transaction"
  },
  {
    id: "3",
    date: "23, Aug 2024", 
    time: "6:30 PM",
    user: {
      name: "Samuel Ikenna Chukwuemeka",
      email: "samuelikenna35@gmail.com"
    },
    action: "Approving loan requests"
  },
  {
    id: "4",
    date: "22, Aug 2024",
    time: "4:30 PM", 
    user: {
      name: "Samuel Ikenna Chukwuemeka",
      email: "samuelikenna35@gmail.com"
    },
    action: "Processing transaction"
  },
  {
    id: "5",
    date: "20, Aug 2024",
    time: "5:30 PM",
    user: {
      name: "Samuel Ikenna Chukwuemeka", 
      email: "samuelikenna35@gmail.com"
    },
    action: "Processing transaction"
  },
  {
    id: "6",
    date: "18, Aug 2024",
    time: "3:50 PM",
    user: {
      name: "Samuel Ikenna Chukwuemeka",
      email: "samuelikenna35@gmail.com"
    },
    action: "Customer account update"
  },
  {
    id: "7",
    date: "16, Aug 2024",
    time: "6:30 PM", 
    user: {
      name: "Samuel Ikenna Chukwuemeka",
      email: "samuelikenna35@gmail.com"
    },
    action: "Processing loan payment"
  }
];

const users = [
  "Samuel Ikenna Chukwuemeka",
  "John Doe",
  "Jane Smith",
  "Michael Johnson"
];

const actions = [
  "Processing loan payments",
  "Handling customer transaction", 
  "Approving loan requests",
  "Processing transaction",
  "Customer account update",
  "Processing loan payment",
  "Account creation",
  "Profile update",
  "Document upload"
];

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");

  const logs = mockAuditLogs;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.date.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = !selectedUser || log.user.name === selectedUser;
    const matchesAction = !selectedAction || log.action === selectedAction;
    
    return matchesSearch && matchesUser && matchesAction;
  });

  const handleExport = () => {
    toast.success("Audit logs exported successfully");
  };

  const handleApplyFilter = () => {
    toast.success("Filter applied successfully");
  };

  const handleResetFilter = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedUser("");
    setSelectedAction("");
    toast.success("Filter reset successfully");
  };

  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case "dateRange":
        setFromDate(undefined);
        setToDate(undefined);
        break;
      case "user":
        setSelectedUser("");
        break;
      case "action":
        setSelectedAction("");
        break;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search logs here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 bg-background"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={handleExport}
          >
            Export Logs
            <Download className="ml-2 w-4 h-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="text-muted-foreground border-border"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filter</h3>
                </div>

                <div className="space-y-6">
                  {/* Date Range */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Date Range</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary h-auto p-0 text-sm"
                        onClick={() => clearFilter("dateRange")}
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">From:</Label>
                        <DateTimePicker
                          value={fromDate}
                          onChange={setFromDate}
                          granularity="day"
                          placeholder="Start date"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">To:</Label>
                        <DateTimePicker
                          value={toDate}
                          onChange={setToDate}
                          granularity="day"
                          placeholder="End date"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* User Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">User</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary h-auto p-0 text-sm"
                        onClick={() => clearFilter("user")}
                      >
                        Clear
                      </Button>
                    </div>

                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user} value={user}>
                            {user}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Action</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary h-auto p-0 text-sm"
                        onClick={() => clearFilter("action")}
                      >
                        Clear
                      </Button>
                    </div>

                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {actions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleResetFilter}
                    >
                      Reset all
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 text-white"
                      onClick={handleApplyFilter}
                    >
                      Apply Filter
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>DATE</TableHead>
              <TableHead>USER</TableHead>
              <TableHead>ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{log.date}</div>
                    <div className="text-sm text-muted-foreground">{log.time}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={log.user.avatar} />
                      <AvatarFallback>
                        {log.user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{log.user.name}</div>
                      <div className="text-sm text-muted-foreground">{log.user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{log.action}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs found matching your search criteria.
        </div>
      )}
    </div>
  );
} 