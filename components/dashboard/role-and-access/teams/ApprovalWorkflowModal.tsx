"use client";
import React, { useState, useEffect } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
  ResponsiveModalClose,
} from "@/components/ui/dialog-2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RotateCcw, Trash } from "lucide-react";
import { getWorkflowTypesAction, getAllPositionsAction, createWorkflowAction } from "@/server/role-and-access/approval-workflow";
import { fetchDepartmentsAction } from "@/server/role-and-access/fetch-departments";
import { fetchTeamsAction } from "@/server/role-and-access/fetch-teams";
import type { WorkflowType, Position } from "@/server/role-and-access/approval-workflow";
import type { TeamApi } from "@/server/role-and-access/fetch-teams";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ApprovalLevel {
  department: string;
  team: string;
  position: string;
}

// Helper function to convert camelCase to Title Case
function camelCaseToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export function ApprovalWorkflowModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(1);
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [workflowType, setWorkflowType] = useState("");
  const [selectedWorkflowTypeName, setSelectedWorkflowTypeName] = useState("");
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([
    { department: "", team: "", position: "" },
  ]);
  const [workflowTypes, setWorkflowTypes] = useState<WorkflowType[]>([]);
  const [positionsList, setPositionsList] = useState<Position[]>([]);
  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string }[]>([]);
  const [teamsList, setTeamsList] = useState<TeamApi[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { execute: fetchWorkflowTypes, isExecuting: isLoadingTypes } = useAction(getWorkflowTypesAction, {
    onSuccess: ({ data }) => {
      console.log("data", data);
      console.log("data arr", data?.result);
      if (data?.isSuccess && data?.result) {
        setWorkflowTypes(data.result.data);
        // toast.success(data?.message || "Workflow types loaded successfully");
      } else {
        setWorkflowTypes([]);
        toast.error(data?.error || "Failed to load workflow types");
      }
    },
    onError: () => {
      console.error("Failed to fetch workflow types:");
      setWorkflowTypes([]);
      toast.error("Failed to fetch workflow types");
    }
  });

  const { execute: fetchPositions, isExecuting: isLoadingPositions } = useAction(getAllPositionsAction, {
    onSuccess: ({ data }) => {
      console.log("positions data", data);
      console.log("positions data result", data);
      if (data?.isSuccess && data?.result.data) {
        setPositionsList(data.result.data || []);
        // toast.success("Positions loaded successfully");
      } else {
        setPositionsList([]);
        toast.error(data?.error || "Failed to load positions");
      }
    },
    onError: () => {
      setPositionsList([]);
      toast.error("Failed to fetch positions");
    }
  });

  const { execute: fetchDepartments, isExecuting: isLoadingDepartments } = useAction(fetchDepartmentsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && Array.isArray(data?.data)) {
        setDepartmentsList(data.data);
      } else {
        setDepartmentsList([]);
      }
    },
    onError: () => {
      setDepartmentsList([]);
      toast.error("Failed to fetch departments");
    }
  });

  const { execute: fetchTeams, isExecuting: isLoadingTeams } = useAction(fetchTeamsAction, {
    onSuccess: ({ data }) => {
      if (data?.success && Array.isArray(data?.data)) {
        setTeamsList(data.data);
      } else {
        setTeamsList([]);
      }
    },
    onError: () => {
      setTeamsList([]);
      toast.error("Failed to fetch teams");
    }
  });

  const { execute: submitWorkflow } = useAction(createWorkflowAction, {
    onExecute: () => setIsSubmitting(true),
    onSuccess: ({ data }) => {
      setIsSubmitting(false);
      if (data?.isSuccess) {
        toast.success(data?.message || "Workflow created successfully");
        onOpenChange(false);
      } else {
        toast.error(data?.error || data?.message || "Failed to create workflow");
      }
    },
    onError: () => {
      setIsSubmitting(false);
      toast.error("Failed to create workflow");
    }
  });

  useEffect(() => {
    if (!open) {
      setStep(1);
      setWorkflowName("");
      setDescription("");
      setWorkflowType("");
      setSelectedWorkflowTypeName("");
      setApprovalLevels([{ department: "", team: "", position: "" }]);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchWorkflowTypes({});
      fetchPositions({
        pageSize: 100,
        pageNumber: 1,
        searchParams: {}
      });
      fetchDepartments({});
      fetchTeams({});
    }
  }, [open, fetchWorkflowTypes, fetchPositions, fetchDepartments, fetchTeams]);

  // Update selectedWorkflowTypeName when workflowType changes
  useEffect(() => {
    const found = workflowTypes.find((type) => type.id === workflowType);
    setSelectedWorkflowTypeName(found ? camelCaseToTitleCase(found.name) : "");
  }, [workflowType, workflowTypes]);

  function handleAddLevel() {
    setApprovalLevels((prev) => [...prev, { department: "", team: "", position: "" }]);
  }

  function handleRemoveLevel(idx: number) {
    setApprovalLevels((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleLevelChange(idx: number, field: keyof ApprovalLevel, value: string) {
    setApprovalLevels((prev) =>
      prev.map((level, i) => (i === idx ? { ...level, [field]: value } : level))
    );
  }

  function handleNext() {
    if (step === 1 && workflowName && workflowType) setStep(2);
    else if (step === 2) setStep(3);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleSubmit() {
    // Build approvalLevels payload
    const approvalLevelsPayload = approvalLevels.map((level, idx) => ({
      order: idx + 1,
      departmentId: level.department,
      teamId: level.team,
      positionId: level.position
    }));
    submitWorkflow({
      name: workflowName,
      description,
      workflowTypeId: workflowType,
      approvalLevels: approvalLevelsPayload
    });
  }

  function handleRefreshData() {
    fetchWorkflowTypes({});
    fetchPositions({
      pageSize: 100,
      pageNumber: 1,
      searchParams: {}
    });
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className=" w-full">
        <ResponsiveModalHeader>
          <div className="flex items-center justify-between">
            <ResponsiveModalTitle>
              {step === 1 && "Create Workflow"}
              {step === 2 && "Set Approval Level"}
              {step === 3 && "Confirm Details"}
            </ResponsiveModalTitle>
            {step === 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshData}
                disabled={isLoadingTypes || isLoadingPositions}
                className="h-8 px-2"
              >
                <RotateCcw className={`w-4 h-4 ${(isLoadingTypes || isLoadingPositions) ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </ResponsiveModalHeader>
        <div className="py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  placeholder="Enter workflow name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow-description">Description</Label>
                <Input
                  id="workflow-description"
                  placeholder="Enter workflow description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="workflow-type">Workflow Type</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchWorkflowTypes({})}
                    disabled={isLoadingTypes}
                    className="h-6 px-2"
                  >
                    <RotateCcw className={`w-3 h-3 ${isLoadingTypes ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <Select value={workflowType} onValueChange={setWorkflowType}>
                  <SelectTrigger id="workflow-type">
                    {isLoadingTypes ? (
                      <Skeleton className="h-4 w-24" />
                    ) : (
                      <SelectValue placeholder="Select type">
                        {selectedWorkflowTypeName}
                      </SelectValue>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTypes ? (
                      <>
                        <div className="p-2">
                          <Skeleton className="h-8 w-full rounded" />
                        </div>
                        <div className="p-2">
                          <Skeleton className="h-8 w-full rounded" />
                        </div>
                        <div className="p-2">
                          <Skeleton className="h-8 w-full rounded" />
                        </div>
                      </>
                    ) : workflowTypes.length === 0 ? (
                      <SelectItem value="__empty__" disabled>No types found</SelectItem>
                    ) : (
                      workflowTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{camelCaseToTitleCase(type.name)}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              {approvalLevels.map((level, idx) => (
                <div
                  key={idx}
                  className={
                    approvalLevels.length > 1 && idx !== approvalLevels.length - 1
                      ? "border-b pb-4 mb-4"
                      : ""
                  }
                >
                  <div className="font-semibold text-primary mb-2">Approval level {idx + 1}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`department-${idx}`}>Department</Label>
                      <Select
                        value={level.department}
                        onValueChange={(v) => handleLevelChange(idx, "department", v)}
                      >
                        <SelectTrigger id={`department-${idx}`}>
                          {isLoadingDepartments ? (
                            <Skeleton className="h-4 w-32" />
                          ) : (
                            <SelectValue placeholder="Select department" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingDepartments ? (
                            <div className="p-2">
                              <Skeleton className="h-8 w-full rounded" />
                            </div>
                          ) : departmentsList.length === 0 ? (
                            <SelectItem value="__empty__" disabled>No departments found</SelectItem>
                          ) : (
                            departmentsList.map((d) => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`team-${idx}`}>Team</Label>
                      <Select
                        value={level.team}
                        onValueChange={(v) => handleLevelChange(idx, "team", v)}
                      >
                        <SelectTrigger id={`team-${idx}`}>
                          {isLoadingTeams ? (
                            <Skeleton className="h-4 w-24" />
                          ) : (
                            <SelectValue placeholder="Select team" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingTeams ? (
                            <div className="p-2">
                              <Skeleton className="h-8 w-full rounded" />
                            </div>
                          ) : teamsList.length === 0 ? (
                            <SelectItem value="__empty__" disabled>No teams found</SelectItem>
                          ) : (
                            teamsList.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`position-${idx}`}>Position</Label>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchPositions({
                            pageSize: 100,
                            pageNumber: 1,
                            searchParams: {}
                          })}
                          disabled={isLoadingPositions}
                          className="h-6 px-2"
                        >
                          <RotateCcw className={`w-3 h-3 ${isLoadingPositions ? 'animate-spin' : ''}`} />
                        </Button> */}
                      </div>
                      <Select
                        value={level.position}
                        onValueChange={(v) => handleLevelChange(idx, "position", v)}
                      >
                        <SelectTrigger id={`position-${idx}`}>
                          {isLoadingPositions ? (
                            <Skeleton className="h-4 w-28" />
                          ) : (
                            <SelectValue placeholder="Select position" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingPositions ? (
                            <div className="p-2">
                              <Skeleton className="h-8 w-full rounded" />
                            </div>
                          ) : positionsList.length === 0 ? (
                            <SelectItem value="__empty__" disabled>No positions found</SelectItem>
                          ) : (
                            positionsList.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {approvalLevels.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => handleRemoveLevel(idx)}
                    >
                       <Trash className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={handleAddLevel}
              >
                + Add Approval level
              </Button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workflow Name</Label>
                  <div className="text-lg font-semibold text-foreground mt-1">{workflowName}</div>
                </div>
                <Separator className="my-2 w-32 mx-auto"/>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</Label>
                  <div className="text-base text-foreground mt-1">{description || <span className="italic text-muted-foreground">No description</span>}</div>
                </div>
                <Separator className="my-2 w-32 mx-auto"/>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workflow Type</Label>
                  <div className="text-base text-foreground mt-1">{selectedWorkflowTypeName}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-sm font-medium text-foreground">Approval Levels</Label>
                {approvalLevels.map((level, idx) => (
                  <div key={idx} className="border border-border/50 rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                      </div>
                      <div className="font-medium text-foreground">Approval Level {idx + 1}</div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm text-muted-foreground">Department:</Label>
                        <span className="text-sm font-medium text-foreground">{departmentsList.find(d => d.id === level.department)?.name || level.department}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Label className="text-sm text-muted-foreground">Team:</Label>
                        <span className="text-sm font-medium text-foreground">{teamsList.find(t => t.id === level.team)?.name || level.team}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <Label className="text-sm text-muted-foreground">Position:</Label>
                        <span className="text-sm font-medium text-foreground">{positionsList.find(p => p.id === level.position)?.name || level.position}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <ResponsiveModalFooter className="flex flex-row justify-between gap-2 mt-4 w-full">
          <div className="flex gap-2">
            <ResponsiveModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ResponsiveModalClose>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Previous
              </Button>
            )}
          </div>
          <div>
            {step < 3 && (
              <Button
                className="bg-primary text-white"
                onClick={handleNext}
                disabled={step === 1 && (!workflowName || !workflowType)}
              >
                {step === 1 ? "Next" : "Create"}
              </Button>
            )}
            {step === 3 && (
              <Button className="bg-primary text-white" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </Button>
            )}
          </div>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
} 