"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Download, MoreVertical, Settings, ArrowLeft, RotateCcw, Eye, Edit, Trash2 } from "lucide-react";
import type { ApprovalWorkflow } from "./teams";
import { ApprovalWorkflowModal } from "./ApprovalWorkflowModal";

// Accept all necessary props for state and handlers
export interface ApprovalWorkflowProps {
  workflows: ApprovalWorkflow[];
  isWorkflowLoading: boolean;
  setWorkflowQuery: (v: string | null) => void;
  loadWorkflows: (params: { pageSize?: number; pageNumber?: number; searchParams?: Record<string, string> }) => void;
  handleWorkflowExport: (type: 'csv' | 'pdf') => void;
}

export function ApprovalWorkflowSection({
  workflows,
  isWorkflowLoading,
  setWorkflowQuery,
  loadWorkflows,
  handleWorkflowExport,
}: ApprovalWorkflowProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const WorkflowIcon = () => (
    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
      <Settings className="w-4 h-4 text-primary" />
    </div>
  );

  return (
    <div className="p-6">
      <ApprovalWorkflowModal open={modalOpen} onOpenChange={setModalOpen} />
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWorkflowQuery(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden lg:inline">Back</span>
          </Button>
          <h1 className="text-base md:text-2xl font-semibold">Approval Workflow</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Create Approval Level */}
          <Button className="bg-primary hover:bg-primary/90 text-white" size="icon" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
          </Button>

          {/* Export Dropdown Desktop (Workflow) - NOW INSIDE header row */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-muted-foreground border-border hidden lg:inline-flex">
                Export
                <Download className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleWorkflowExport('csv')}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleWorkflowExport('pdf')}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Export Icon (Workflow) - NOW INSIDE header row */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Export Workflows"
                className="text-muted-foreground border-border lg:hidden"
              >
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleWorkflowExport('csv')}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleWorkflowExport('pdf')}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings dropdown for extra actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="text-muted-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => loadWorkflows({})}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-72 mb-6">
        {/* Search icon and input can be added here if needed */}
      </div>

      {/* Workflows Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WORKFLOW NAME</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>NO OF APPROVAL WORKFLOW</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isWorkflowLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : (
              workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <WorkflowIcon />
                      <span className="font-medium">{workflow.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{workflow.type}</TableCell>
                  <TableCell>{workflow.approvalCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 w-4 h-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 w-4 h-4" />
                          Delete
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

      {!isWorkflowLoading && workflows.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-2 text-foreground">No approval workflows available</p>
          <Button variant="outline" className="mt-4" onClick={() => setModalOpen(true)}>Create Approval Level</Button>
        </div>
      )}
    </div>
  );
} 