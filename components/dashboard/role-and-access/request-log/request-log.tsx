"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  RotateCcw,
  FileText,
  FileSpreadsheet,
  RefreshCcw,
  MessageCircle,
  CheckCircle,
  
} from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { fetchRequestLogAction, type RequestLogApi, exportRequestLogCsvAction, exportRequestLogPdfAction } from "@/server/role-and-access/fetch-request-log";
import { approveWorkflowAction } from "@/server/role-and-access/workflow-approval";
import { formatActivityType } from "@/lib/format-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

export default function RequestLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<RequestLogApi | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentData, setCommentData] = useState<{ requestId: string, comment: string } | null>(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve');
  const [approvalRequestId, setApprovalRequestId] = useState<string>("");
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

  const { execute: performWorkflowApproval, isPending: isApproving } = useAction(approveWorkflowAction, {
    onExecute: () => {
      const action = approvalType === 'approve' ? 'Approving' : 'Rejecting';
      toast.loading(`${action} workflow...`, { id: "workflow-approval" });
    },
    onSuccess: (result) => {
      toast.dismiss("workflow-approval");
      if (result.data?.success) {
        toast.success(result.data.message);
        setShowApprovalModal(false);
        setApprovalComment("");
        // Refresh the logs
        loadLogs({});
      } else {
        toast.error(result.data?.error || "Failed to process workflow");
      }
    },
    onError: (err) => {
      toast.dismiss("workflow-approval");
      toast.error(err.error?.serverError || "Failed to process workflow");
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
    // Find the first approval with a comment
    const approvalWithComment = log.approvals?.find(a => a.comment && a.comment.trim() !== "");
    if (approvalWithComment) {
      setCommentData({ 
        requestId: log.requestId, 
        comment: approvalWithComment.comment || "" 
      });
      setShowCommentModal(true);
    }
  };

  const handleViewDetails = (log: RequestLogApi) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  // Workflow approval handlers
  const handleApproveWorkflow = (requestId: string) => {
    setApprovalRequestId(requestId);
    setApprovalType('approve');
    setShowApprovalModal(true);
  };

  const handleRejectWorkflow = (requestId: string) => {
    setApprovalRequestId(requestId);
    setApprovalType('reject');
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = () => {
    if (approvalRequestId) {
      performWorkflowApproval({
        requestId: approvalRequestId,
        approved: approvalType === 'approve',
        comment: approvalComment,
      });
    }
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
                  <TableCell>{formatActivityType(log.activityType)}</TableCell>
                  <TableCell>{log.workflowName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      {log.approvals && log.approvals.some(a => a.comment && a.comment.trim() !== "") && (
                        <button
                          onClick={() => handleViewComment(log)}
                          className="hover:bg-blue-500/10 rounded-full p-1 transition-colors"
                          title="View comment"
                        >
                          <MessageCircle className="w-4 h-4 text-blue-500" />
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
                        {log.approvals && log.approvals.some(a => a.comment) && (
                          <DropdownMenuItem onClick={() => handleViewComment(log)}>
                            View Comment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleViewDetails(log)}>
                          View Details
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
      {/* Details Modal */}
      <ResponsiveModal open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <ResponsiveModalContent className="max-w-2xl">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Activity Information</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          {selectedLog && (
            <div className="p-6 space-y-8">
              {/* Activity Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Activity Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Activity Name</label>
                    <div className="mt-1 text-sm font-medium">{selectedLog.activityName}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rejected Logs</label>
                    <div className="mt-1 text-sm font-medium">25</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <div className="mt-1 text-sm">Registration of new individual customer</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Create User</label>
                    <div className="mt-1 text-sm">{selectedLog.activityType}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Initiator</label>
                    <div className="mt-1 text-sm">{selectedLog.initiator}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned Workflow</label>
                    <div className="mt-1 text-sm">{selectedLog.workflowName}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Initiation Date</label>
                    <div className="mt-1 text-sm">{selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</div>
                  </div>
                </div>
              </div>

              {/* Activity Trail Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Activity Trail</h3>
                <div className="space-y-6">
                  {!selectedLog.approvals || selectedLog.approvals.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No approval levels found.</div>
                  ) : (
                    selectedLog.approvals.map((approval, idx) => (
                      <div key={idx} className="relative">
                        {/* Timeline connector */}
                        {idx < selectedLog.approvals!.length - 1 && (
                          <div className="absolute left-3 top-8 w-px h-20 bg-border"></div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          {/* Status Icon */}
                          <div className="relative z-10 flex-shrink-0">
                            {approval.status === 1 ? (
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                                <CheckCircle className="w-3 h-3 text-green-600 fill-current" />
                              </div>
                            ) : approval.status === 2 ? (
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
                                <XCircle className="w-3 h-3 text-red-600 fill-current" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-200">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Approval Details */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-2">Approval Level {approval.order}</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Department:</span>
                                <div className="font-medium">{approval.approverDepartment}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>
                                <div className={`font-medium ${
                                  approval.status === 1 ? 'text-green-600' : 
                                  approval.status === 2 ? 'text-red-600' : 
                                  'text-yellow-600'
                                }`}>
                                  {approval.status === 1 ? 'Successful' : 
                                   approval.status === 2 ? 'Failed' : 
                                   'Pending'}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Team:</span>
                                <div className="font-medium">{approval.approverTeam}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Approver Name:</span>
                                <div className="font-medium">{approval.approver}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <div className="font-medium">{approval.date ? new Date(approval.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Pending"}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Team Lead:</span>
                                <div className="font-medium">{approval.positionId}</div>
                              </div>
                            </div>
                            {approval.comment && (
                              <div className="mt-3 p-3 bg-muted rounded-md border">
                                <div className="text-xs font-medium text-muted-foreground mb-1">Comment:</div>
                                <div className="text-sm">{approval.comment}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              {selectedLog.status === "Under Review" && (
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    onClick={() => handleRejectWorkflow(selectedLog.requestId)}
                    variant="outline"
                    disabled={isApproving}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveWorkflow(selectedLog.requestId)}
                    disabled={isApproving}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Comment View Modal */}
      <ResponsiveModal open={showCommentModal} onOpenChange={setShowCommentModal}>
        <ResponsiveModalContent className="max-w-md">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>View Comment</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          {commentData && (
            <div className="p-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Comment</label>
                <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                  {commentData.comment}
                </div>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Workflow Approval Modal */}
      <ResponsiveModal open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <ResponsiveModalContent className="max-w-md">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>
              {approvalType === 'approve' ? 'Approve' : 'Reject'} Workflow
            </ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Comment {approvalType === 'reject' ? '(Required)' : '(Optional)'}
              </label>
              <Textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder={`Add your ${approvalType === 'approve' ? 'approval' : 'rejection'} comment...`}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setShowApprovalModal(false)}
                variant="outline"
                className="flex-1"
                disabled={isApproving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApproval}
                className={`flex-1 ${
                  approvalType === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isApproving || (approvalType === 'reject' && !approvalComment.trim())}
              >
                {isApproving ? (
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  approvalType === 'approve' ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )
                )}
                {approvalType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
} 