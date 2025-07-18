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
  MoreVertical,
  Users,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  FileSpreadsheet,
  RefreshCcw,
  
} from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { fetchRequestLogAction, type RequestLogApi, exportRequestLogCsvAction, exportRequestLogPdfAction } from "@/server/role-and-access/fetch-request-log";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function RequestLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<RequestLogApi | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [logs, setLogs] = useState<RequestLogApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Checkbox selection states
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { execute: loadLogs } = useAction(fetchRequestLogAction, {
    onExecute() {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      toast.loading("Fetching request logs...", { id: "fetch-logs" });
    },
    onSuccess(apiResponse) {
      toast.dismiss("fetch-logs");
      const result = apiResponse.data;
      if (result && result.success) {
        setLogs(result.data);
        setHasLoadedOnce(true);
      } else {
        toast.error((result && 'error' in result && result.error) || "Failed to load request logs");
      }
      setIsLoading(false);
    },
    onError(err) {
      toast.dismiss("fetch-logs");
      toast.error(err.error?.serverError || "Failed to load request logs");
      setIsLoading(false);
    },
  });

  const { execute: exportCsv } = useAction(exportRequestLogCsvAction, {
    onExecute: () => toast.loading("Exporting request logs as CSV...", { id: "export-csv" }),
    onSuccess: (apiResponse) => {
      toast.dismiss("export-csv");
      const result = apiResponse.data;
      if (result && result.success) {
        const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `request_logs_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Request logs exported as CSV successfully");
      } else {
        toast.error((result && 'error' in result && result.error) || "Failed to export as CSV");
      }
    },
    onError: (err) => {
      toast.dismiss("export-csv");
      toast.error(err.error?.serverError || "Failed to export as CSV");
    },
  });

  const { execute: exportPdf } = useAction(exportRequestLogPdfAction, {
    onExecute: () => toast.loading("Exporting request logs as PDF...", { id: "export-pdf" }),
    onSuccess: (apiResponse) => {
      toast.dismiss("export-pdf");
      const result = apiResponse.data;
      if (result && result.success) {
        const blob = new Blob([result.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `request_logs_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Request logs exported as PDF successfully");
      } else {
        toast.error((result && 'error' in result && result.error) || "Failed to export as PDF");
      }
    },
    onError: (err) => {
      toast.dismiss("export-pdf");
      toast.error(err.error?.serverError || "Failed to export as PDF");
    },
  });

  // Refresh handler
  const handleRefresh = () => {
    setHasLoadedOnce(false);
    loadLogs({});
  };

  // Checkbox selection handlers
  const handleSelectLog = (logId: string) => {
    setSelectedLogIds(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogIds(filteredLogs.map(log => log.requestId));
    } else {
      setSelectedLogIds([]);
    }
  };

  React.useEffect(() => {
    loadLogs({});
  }, [loadLogs]);

  const filteredLogs = logs.filter(log =>
    log.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.initiator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.activityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.workflowName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Checkbox selection states
  const isAllSelected = filteredLogs.length > 0 && selectedLogIds.length === filteredLogs.length;
  const isIndeterminate = selectedLogIds.length > 0 && selectedLogIds.length < filteredLogs.length;

  // Calculate statistics
  const totalLogs = logs.length;
  const pendingLogs = logs.filter(log => log.status === "Under Review").length;
  const rejectedLogs = logs.filter(log => log.status === "Rejected").length;

  const handleViewComment = (log: RequestLogApi) => {
    setSelectedLog(log);
    setIsCommentModalOpen(true);
  };

  const handleViewDetails = (log: RequestLogApi) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  const handleExportCSV = () => {
    exportCsv({
      selectedIds: selectedLogIds.length > 0 ? selectedLogIds : undefined,
    });
  };

  const handleExportPDF = () => {
    exportPdf({
      selectedIds: selectedLogIds.length > 0 ? selectedLogIds : undefined,
    });
  };

  const handleRetry = () => {
    loadLogs({});
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; text: string }> = {
      "Initiated": {
        className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
        text: "Initiated"
      },
      "Under Review": {
        className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
        text: "Under Review"
      },
      "Approved": {
        className: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        text: "Approved"
      },
      "Rejected": {
        className: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
        text: "Rejected"
      }
    };
    const config = statusConfig[status] || { className: "bg-gray-500/10 text-gray-500", text: status };
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
            className="pl-10 max-w-md bg-background"
          />
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="text-muted-foreground border-border"
                disabled={selectedLogIds.length === 0}
              >
               <span className="hidden md:block">Export</span>  {selectedLogIds.length > 0 && `(${selectedLogIds.length})`}
                <Download className="md:ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="mr-2 w-4 h-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="mr-2 w-4 h-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={handleRefresh} className="text-muted-foreground border-border">
            <RefreshCcw className="w-4 h-4" />
          </Button>
          {/* <Button variant="outline" size="icon" className="text-muted-foreground border-border">
            <Settings className="w-4 h-4" />
          </Button> */}
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
              <div className="w-12 h-12 bg-gray-500/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-500" />
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
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
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
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isIndeterminate ? "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" : ""}
                />
              </TableHead>
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
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.requestId}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLogIds.includes(log.requestId)}
                      onCheckedChange={() => handleSelectLog(log.requestId)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.activityName}</div>
                  </TableCell>
                  <TableCell>{log.initiator}</TableCell>
                  <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{log.activityType}</TableCell>
                  <TableCell>{log.workflowName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      {log.approvals.some(a => a.comment) && (
                        <button
                          onClick={() => handleViewComment(log)}
                          className="hover:bg-yellow-500/10 rounded-full p-1 transition-colors"
                          title="View comment"
                        >
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
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
                        {log.approvals.some(a => a.comment) && (
                          <DropdownMenuItem onClick={() => handleViewComment(log)}>
                            View Comment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleViewDetails(log)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Download Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && filteredLogs.length === 0 && (
        <div className="text-center flex flex-col items-center justify-center py-8 text-muted-foreground">
          <div className="mb-4">No request logs found matching your search.</div>
          <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}
      {/* Comment Modal */}
      <ResponsiveModal open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Comment
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>
          {selectedLog && (
            <div className="p-6 space-y-4">
              {selectedLog.approvals.filter(a => a.comment).map((a, idx) => (
                <div key={idx} className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-500/5">
                  <div className="text-sm text-foreground leading-relaxed">{a.comment}</div>
                  <div className="text-xs text-muted-foreground mt-1">By {a.approver} on {a.date ? new Date(a.date).toLocaleString() : "-"}</div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
      {/* Details Modal */}
      <ResponsiveModal open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Request Details</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          {selectedLog && (
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="font-semibold text-lg">{selectedLog.activityName}</div>
                <div className="text-sm text-muted-foreground">Initiator: {selectedLog.initiator}</div>
                <div className="text-sm text-muted-foreground">Date: {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : "-"}</div>
                <div className="text-sm text-muted-foreground">Workflow: {selectedLog.workflowName}</div>
                <div className="text-sm text-muted-foreground">Type: {selectedLog.activityType}</div>
                <div className="text-sm text-muted-foreground">Status: {selectedLog.status}</div>
              </div>
              <div>
                <div className="font-semibold mb-2">Approval Levels</div>
                <div className="space-y-2">
                  {selectedLog.approvals.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No approval levels found.</div>
                  ) : (
                    selectedLog.approvals.map((a, idx) => (
                      <div key={idx} className="border rounded p-3 bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">Level {a.order}</div>
                          <div>{getStatusBadge(typeof a.status === "number" ? (a.status === 1 ? "Approved" : a.status === 2 ? "Rejected" : "Under Review") : String(a.status))}</div>
                        </div>
                        <div className="text-sm mt-1">Approver: {a.approver}</div>
                        <div className="text-sm">Department: {a.approverDepartment}</div>
                        <div className="text-sm">Team: {a.approverTeam}</div>
                        <div className="text-sm">Position ID: {a.positionId}</div>
                        {a.comment && (
                          <div className="text-xs text-yellow-500 mt-2">Comment: {a.comment}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">Date: {a.date ? new Date(a.date).toLocaleString() : "-"}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
} 