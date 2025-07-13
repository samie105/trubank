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
// Avatar removed (no images returned by API)
import { 
  Search, 
  Download, 
  Settings,
  RotateCcw,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { fetchAuditLogsAction } from "@/server/role-and-access/fetch-audit-logs";
import { Skeleton } from "@/components/ui/skeleton";
import { exportAuditLogsCsvAction, exportAuditLogsPdfAction } from "@/server/role-and-access/export-audit-logs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AuditLog {
  id: string;
  date: string;
  time: string;
  user: {
    name: string;
    email: string;
  };
  action: string;
}

// Removed mockAuditLogs (live data is fetched from API)

// Helper to parse '11-Jun-2025:08:56:10' to Date
function parseLogDate(dateStr: string): Date | null {
  // Split date and time
  const [datePart, timePart] = dateStr.split(":");
  if (!datePart || !timePart) return null;
  // datePart: '11-Jun-2025', timePart: '08:56:10' (but time may have colons)
  // Actually, split on first colon only
  const firstColon = dateStr.indexOf(":");
  if (firstColon === -1) return null;
  const dateSection = dateStr.slice(0, firstColon); // '11-Jun-2025'
  const timeSection = dateStr.slice(firstColon + 1); // '08:56:10'
  // Convert '11-Jun-2025' to '2025-06-11'
  const [day, mon, year] = dateSection.split("-");
  if (!day || !mon || !year) return null;
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };
  const monthNum = months[mon as keyof typeof months];
  if (!monthNum) return null;
  // Compose ISO string
  const iso = `${year}-${monthNum}-${day.padStart(2, "0")}` +
    (timeSection ? `T${timeSection}` : "T00:00:00");
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Compute unique users and actions from logs
  const uniqueUsers = React.useMemo(() => {
    const seen = new Set<string>();
    return logs
      .map((log) => log.user.name)
      .filter((name) => {
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });
  }, [logs]);

  const uniqueActions = React.useMemo(() => {
    const seen = new Set<string>();
    return logs
      .map((log) => log.action)
      .filter((action) => {
        if (seen.has(action)) return false;
        seen.add(action);
        return true;
      });
  }, [logs]);

  const { execute: loadLogs } = useAction(fetchAuditLogsAction, {
    onExecute() {
      setIsLoading(true);
      toast.loading("Fetching audit logs...", { id: "fetch-logs" });
    },
    onSuccess(apiResponse) {
      toast.dismiss("fetch-logs");
      const payload = apiResponse.data;
      if (payload && (payload as { success?: boolean }).success) {
        const successPayload = payload as unknown as { success: true; data: { id: string; date: string; fullName: string; emailAddress: string; action: string; }[] };
        setLogs(
          successPayload.data.map((l) => ({
            id: l.id,
            date: l.date,
            time: "", // backend lacks time; could parse
            user: {
              name: l.fullName,
              email: l.emailAddress,
            },
            action: l.action,
          }))
        );
      } else if (Array.isArray(payload)) {
        const plainData = payload as unknown as { id: string; date: string; fullName: string; emailAddress: string; action: string; }[];
        setLogs(
          plainData.map((l) => ({
            id: l.id,
            date: l.date,
            time: "",
            user: { name: l.fullName, email: l.emailAddress },
            action: l.action,
          }))
        );
      } else {
        toast.error("Failed to load logs");
      }
      setIsLoading(false);
    },
    onError(err) {
      toast.dismiss("fetch-logs");
      toast.error(err.error?.serverError || "Failed to load logs");
      setIsLoading(false);
    },
  });

  const { execute: exportCsv } = useAction(exportAuditLogsCsvAction, {
    onExecute() {
      toast.loading("Exporting audit logs as CSV...", { id: "export-audit-csv" });
    },
    onSuccess(apiResponse) {
      toast.dismiss("export-audit-csv");
      const payload = apiResponse.data;
      if (payload && typeof payload === "object" && "fileData" in payload) {
        const csv = (payload as { fileData: string }).fileData;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `audit_logs_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Audit logs exported as CSV");
      } else {
        toast.error("Export failed");
      }
    },
    onError(err) {
      toast.dismiss("export-audit-csv");
      toast.error(err.error?.serverError || "Export failed");
    },
  });

  const { execute: exportPdf } = useAction(exportAuditLogsPdfAction, {
    onExecute() {
      toast.loading("Exporting audit logs as PDF...", { id: "export-audit-pdf" });
    },
    onSuccess(apiResponse) {
      toast.dismiss("export-audit-pdf");
      const payload = apiResponse.data;
      if (payload && typeof payload === "object" && "fileData" in payload) {
        const pdf = (payload as { fileData: string }).fileData;
        const blob = new Blob([pdf], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `audit_logs_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Audit logs exported as PDF");
      } else {
        toast.error("Export failed");
      }
    },
    onError(err) {
      toast.dismiss("export-audit-pdf");
      toast.error(err.error?.serverError || "Export failed");
    },
  });

  React.useEffect(() => {
    loadLogs({});
  }, [loadLogs]);

  // Filtering logic
  let filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.date.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = !selectedUser || log.user.name === selectedUser;
    const matchesAction = !selectedAction || log.action === selectedAction;

    // Date range filter
    let matchesDate = true;
    const logDate = parseLogDate(log.date);
    if (fromDate && logDate) {
      matchesDate = matchesDate && logDate >= fromDate;
    }
    if (toDate && logDate) {
      // To include the whole day, set toDate to end of day
      const toDateEnd = new Date(toDate);
      toDateEnd.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && logDate <= toDateEnd;
    }

    return matchesSearch && matchesUser && matchesAction && matchesDate;
  });

  // Sort filtered logs
  filteredLogs = filteredLogs.slice().sort((a, b) => {
    const dateA = parseLogDate(a.date)?.getTime() ?? 0;
    const dateB = parseLogDate(b.date)?.getTime() ?? 0;
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // const handleApplyFilter = () => {
  //   toast.success("Filter applied successfully");
  // };

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
      {/* Sticky Header */}
      <div className="flex items-center w-full space-x-2 justify-between mb-6 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border py-4 ">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search logs here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md bg-background"
          />
        </div>

        <div className="flex items-center gap-1">

          <Button 
            variant="outline"
            size="icon"
            onClick={() => loadLogs({})}
            className="text-muted-foreground border-border"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} className=" text-muted-foreground flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden lg:inline">Export Logs</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportCsv({})}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportPdf({})}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                          className="w-full overflow-hidden"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">To:</Label>
                        <DateTimePicker
                          value={toDate}
                          onChange={setToDate}
                          granularity="day"
                          placeholder="End date"
                          className="w-full overflow-hidden"
                          disabled={!fromDate}
                          dayDisabled={fromDate ? (date => date < fromDate) : undefined}
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
                        {uniqueUsers.map((user) => (
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
                        {uniqueActions.map((action) => (
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
                    {/* <Button
                      className="flex-1 bg-primary hover:bg-primary/90 text-white"
                      onClick={handleApplyFilter}
                    >
                      Apply Filter
                    </Button> */}
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
              <TableHead>
                <div className="flex items-center gap-1">
                  <span>DATE</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="p-1 h-6 w-6">
                        {sortOrder === "desc" ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                        <span className="sr-only">Sort</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setSortOrder("desc")}
                        className={sortOrder === "desc" ? "font-semibold text-primary" : ""}
                      >
                        <SortDesc className="w-4 h-4 mr-2" /> Newest first
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOrder("asc")}
                        className={sortOrder === "asc" ? "font-semibold text-primary" : ""}
                      >
                        <SortAsc className="w-4 h-4 mr-2" /> Oldest first
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead>USER</TableHead>
              <TableHead>ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                </TableRow>
              ))
            ) : (
            filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{log.date}</div>
                    <div className="text-sm text-muted-foreground">{log.time}</div>
                  </div>
                </TableCell>
                <TableCell>
                    <div>
                      <div className="font-medium">{log.user.name}</div>
                      <div className="text-sm text-muted-foreground">{log.user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{log.action}</div>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && filteredLogs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs found matching your search criteria.
        </div>
      )}
    </div>
  );
} 