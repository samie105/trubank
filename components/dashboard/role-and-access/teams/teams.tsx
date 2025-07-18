/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
  ResponsiveModalClose,
  ResponsiveModalTrigger,
} from "@/components/ui/dialog-2";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Plus, 
  Download, 
  MoreVertical, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  Users,
  RotateCcw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "next-safe-action/hooks";
import { fetchTeamsAction, createTeamAction, exportTeamsCsvAction, exportTeamsPdfAction, updateTeamAction } from "@/server/role-and-access/fetch-teams";
import { fetchDepartmentsAction } from "@/server/role-and-access/fetch-departments";
import type { FetchTeamsSuccess, TeamApi } from "@/server/role-and-access/fetch-teams";
import { fetchWorkflowsAction, exportWorkflowsCsvAction, exportWorkflowsPdfAction } from "@/server/role-and-access/fetch-workflows";
import type { WorkflowApi } from "@/server/role-and-access/fetch-workflows";
import { toast } from "sonner";
import { ApprovalWorkflowSection } from "./approval-workflow";

interface Team {
  id: string;
  name: string;
  department: string;
  description: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  type: string;
  approvalCount: number;
}

// live data will be fetched; start with empty array
const mockTeams: Team[] = [];

// workflows will be fetched

// Departments will be fetched from API

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [workflowQuery, setWorkflowQuery] = useQueryState<string | null>("workflow", {
    parse: v => v || null,
    serialize: v => v || "",
  });
  const showApprovalWorkflow = workflowQuery === "1";
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [isLoading, setIsLoading] = useState(false);
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [isWorkflowLoading, setWorkflowLoading] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Create team form state
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false);

  // View modal state
  const [viewedTeam, setViewedTeam] = useState<TeamApi | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Add state for editing team
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editTeamId, setEditTeamId] = useState("");

  // Function to open edit modal and prefill fields
  function openEditModal(team: TeamApi) {
    setEditTeamName(team.name);
    setEditDescription(team.description);
    setEditTeamId(team.id);
    // Prefer matching by id if possible
    const idMatch = departments.find((dept) => dept.id === team.department);
    if (idMatch) {
      setEditDepartment(idMatch.id);
    } else {
      // Fallback: match by name (case-insensitive)
      const nameMatch = departments.find(
        (dept) => dept.name.toLowerCase() === team.department.toLowerCase()
      );
      setEditDepartment(nameMatch ? nameMatch.id : "");
    }
    setIsEditModalOpen(true);
  }

  // Function to close edit modal and reset fields
  function closeEditModal() {
    setIsEditModalOpen(false);
    setEditTeamName("");
    setEditDescription("");
    setEditDepartment("");
    setEditTeamId("");
  }

  // Function to handle team update
  async function handleUpdateTeam() {
    if (!editTeamName || !editDepartment || !editTeamId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const toastId = toast.loading("Updating team...");
    const res = await updateTeamAction({
      id: editTeamId,
      name: editTeamName,
      description: editDescription,
      departmentId: editDepartment,
    });
    toast.dismiss(toastId);
    if (res?.data?.isSuccess) {
      toast.success(res.data.message || "Team updated successfully");
      closeEditModal();
      loadTeams({});
    } else {
      toast.error(res?.data?.error || res?.data?.message || "Failed to update team");
    }
  }

  // Debug: log viewedTeam when it changes
  useEffect(() => {
    if (viewedTeam) {
      // eslint-disable-next-line no-console
      console.log('Viewed Team:', viewedTeam);
    }
  }, [viewedTeam]);

  const { execute: loadTeams } = useAction(fetchTeamsAction, {
    onExecute() {
      setIsLoading(true);
      toast.loading("Fetching teams...", { id: "fetch-teams" });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess(result: any) {
      const payload = result.data as FetchTeamsSuccess | { error?: string } | undefined;
      toast.dismiss("fetch-teams");
      if (payload && (payload as FetchTeamsSuccess).success) {
        const successPayload = payload as FetchTeamsSuccess;
        setTeams(successPayload.data.map((t: TeamApi) => ({
          id: t.id,
          name: t.name,
          department: t.department,
          description: t.description,
        })));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((payload as any)?.error || "Failed to load teams");
      }
      setIsLoading(false);
      setHasLoadedOnce(true);
    },
    onError(err) {
      toast.dismiss("fetch-teams");
      toast.error(err.error?.serverError || "Failed to load teams");
      setIsLoading(false);
    },
  });

  const { execute: loadWorkflows } = useAction(fetchWorkflowsAction, {
    onExecute() {
      setWorkflowLoading(true);
    },
    onSuccess(res: any) {
      const data = res as any;
      console.log(data);
      if (data?.data?.success) {
        const workflowsArr = (data.data.data ?? []) as WorkflowApi[];
        setWorkflows(
          workflowsArr.map((w: WorkflowApi) => ({
            id: w.id,
            name: w.name,
            type: w.type,
            approvalCount: w.approvalCount,
          }))
        );
      } else if (data && data.data && !data.data.success) {
        toast.error("Error loading workflows");
      } else {
        toast.error("Failed to load workflows, Try again");
      }
      setWorkflowLoading(false);
    },
    onError() {
      toast.error("Failed to load workflows, Try again later");
      setWorkflowLoading(false);
    },
  });

  // Fetch departments for dropdown
  useEffect(() => {
    async function loadDepartments() {
      setIsDepartmentsLoading(true);
      try {
        const res = await fetchDepartmentsAction({});
        if (res?.data && res.data.success === true && Array.isArray(res.data.data)) {
          setDepartments(res.data.data.map((d: any) => ({ id: d.id, name: d.name })));
        } else {
          // Only show error toast if we're in a modal where departments are needed
          if (isCreateModalOpen || isEditModalOpen) {
            toast.error("Failed to load departments");
          }
          console.error("Failed to load departments:", res?.data);
        }
      } catch (error) {
        console.error("Error loading departments:", error);
        if (isCreateModalOpen || isEditModalOpen) {
          toast.error("Failed to load departments");
        }
      } finally {
        setIsDepartmentsLoading(false);
      }
    }
    
    // Load departments on mount
    loadDepartments();
  }, [isCreateModalOpen, isEditModalOpen]);

  useEffect(() => {
   if (!showApprovalWorkflow && !hasLoadedOnce) {
     loadTeams({});
   }
  }, [loadTeams, showApprovalWorkflow, hasLoadedOnce]);

  useEffect(() => {
    if (showApprovalWorkflow) {
      loadWorkflows({});
    }
  }, [showApprovalWorkflow, loadWorkflows]);

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTeamIds(filteredTeams.map(team => team.id));
    } else {
      setSelectedTeamIds([]);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = filteredTeams.length > 0 && selectedTeamIds.length === filteredTeams.length;
  const isIndeterminate = selectedTeamIds.length > 0 && selectedTeamIds.length < filteredTeams.length;

  const handleCreateTeam = async () => {
    if (!teamName || !selectedDepartment) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsCreatingTeam(true);
    const toastId = toast.loading("Creating team...");
    const res = await createTeamAction({
      name: teamName,
      description,
      departmentId: selectedDepartment,
    });
    toast.dismiss(toastId);
    setIsCreatingTeam(false);
    if (res?.data && res.data.isSuccess) {
      toast.success(res.data.message || "Team created successfully");
    setTeamName("");
    setDescription("");
    setSelectedDepartment("");
    setIsCreateModalOpen(false);
      // Refresh data after create
      loadTeams({});
    } else {
      toast.error(res?.data?.error || res?.data?.message || "Failed to create team");
    }
    console.log('createTeamAction response:', res);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId));
    toast.success("Team deleted successfully");
  };

  // Export handlers
  function getExportSearchParams(): Record<string, string> {
    if (searchTerm) return { name: searchTerm };
    return {};
  }

  async function handleExport(type: 'csv' | 'pdf') {
    const toastId = toast.loading(`Exporting teams as ${type.toUpperCase()}...`);
    try {
      const params = {
        pageSize: 1000,
        pageNumber: 1,
        searchParams: getExportSearchParams(),
        selectedFields: [],
        selectedIds: selectedTeamIds.length > 0 ? selectedTeamIds : undefined,
      };
      let fileData: string | undefined;
      const fileName = `teams.${type}`;
      if (type === 'csv') {
        const res = await exportTeamsCsvAction(params);
        fileData = res && res.data;
      } else {
        const res = await exportTeamsPdfAction(params);
        fileData = res && res.data;
      }
      if (!fileData) throw new Error('No file data returned');
      const blob = new Blob([fileData], { type: type === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported teams as ${type.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export teams as ${type.toUpperCase()}`);
    } finally {
      toast.dismiss(toastId);
    }
  }

  // Export handlers for workflows
  function getWorkflowExportSearchParams(): Record<string, string> {
    // Add workflow search/filter logic if needed
    return {};
  }

  async function handleWorkflowExport(type: 'csv' | 'pdf') {
    const toastId = toast.loading(`Exporting workflows as ${type.toUpperCase()}...`);
    try {
      const params = {
        pageSize: 1000,
        pageNumber: 1,
        searchParams: getWorkflowExportSearchParams(),
        selectedFields: [],
      };
      let fileData: string | undefined;
      const fileName = `workflows.${type}`;
      if (type === 'csv') {
        const res = await exportWorkflowsCsvAction(params);
        fileData = res && res.data;
      } else {
        const res = await exportWorkflowsPdfAction(params);
        fileData = res && res.data;
      }
      if (!fileData) throw new Error('No file data returned');
      const blob = new Blob([fileData], { type: type === 'csv' ? 'text/csv' : 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported workflows as ${type.toUpperCase()}`);
    } catch {
      toast.error(`Failed to export workflows as ${type.toUpperCase()}`);
    } finally {
      toast.dismiss(toastId);
    }
  }

  const TeamIcon = () => (
    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
      <Users className="w-4 h-4 text-primary" />
    </div>
  );

  if (showApprovalWorkflow) {
    return (
      <ApprovalWorkflowSection
        workflows={workflows}
        isWorkflowLoading={isWorkflowLoading}
        setWorkflowQuery={setWorkflowQuery}
        loadWorkflows={loadWorkflows}
        handleWorkflowExport={handleWorkflowExport}
      />
    );
  }

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
          {/* Desktop actions */}
          <Button
            variant="outline"
            onClick={() => setWorkflowQuery("1")}
            className="text-muted-foreground border-border hidden lg:inline-flex"
          >
            Approval Workflow
          </Button>

          <ResponsiveModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <ResponsiveModalTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Create Team</span>
              </Button>
            </ResponsiveModalTrigger>
            <ResponsiveModalContent className="">
              <ResponsiveModalHeader>
                <ResponsiveModalTitle>Create Team</ResponsiveModalTitle>
              </ResponsiveModalHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Associated Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {isDepartmentsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading departments...
                        </SelectItem>
                      ) : departments.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No departments available
                        </SelectItem>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ResponsiveModalFooter>
                <ResponsiveModalClose asChild>
                  <Button variant="outline">Cancel</Button>
                </ResponsiveModalClose>
                <Button 
                  onClick={handleCreateTeam}
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isCreatingTeam}
                >
                  {isCreatingTeam ? "Creating..." : "Create"}
                </Button>
              </ResponsiveModalFooter>
            </ResponsiveModalContent>
          </ResponsiveModal>

          <Button
            variant="outline"
            size="icon"
            onClick={() => loadTeams({})}
            className="text-muted-foreground border-border hidden lg:inline-flex"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {/* Export Dropdown Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="text-muted-foreground border-border hidden lg:inline-flex"
                disabled={selectedTeamIds.length === 0}
              >
                Export {selectedTeamIds.length > 0 ? `(${selectedTeamIds.length})` : ''}
                <Download className="ml-2 w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Export Icon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-muted-foreground border-border lg:hidden"
                aria-label="Export"
                disabled={selectedTeamIds.length === 0}
              >
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile 3-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-muted-foreground border-border lg:hidden"
                aria-label="More"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setWorkflowQuery("1")}> 
                <Settings className="w-4 h-4 mr-2" />
                Approval Workflow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Teams Table */}
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
              <TableHead>TEAM NAME</TableHead>
              <TableHead>ASSOCIATED DEPARTMENT</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="w-4 h-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-6 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTeamIds.includes(team.id)}
                      onCheckedChange={() => handleSelectTeam(team.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <TeamIcon />
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{team.department}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => { setViewedTeam(team as TeamApi); setIsViewModalOpen(true); }}
                        >
                          <Eye className="mr-2 w-4 h-4" />
                          View Teams
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditModal(team as TeamApi)}
                        >
                          <Edit className="mr-2 w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
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

      {/* No data state */}
      {!isLoading && teams.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg font-medium mb-2 text-foreground">No teams available</p>
          <p className="text-sm">Create a team to get started.</p>
        </div>
      )}

      {/* No search match state */}
      {!isLoading && teams.length > 0 && filteredTeams.length === 0 && searchTerm.trim() !== "" && (
        <div className="text-center py-8 text-muted-foreground">
          No teams found matching your search.
        </div>
      )}

      {/* View Team Modal */}
      <ResponsiveModal open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="text-xl font-semibold text-foreground">Team Details</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          {viewedTeam && (
            <div className="space-y-6 py-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Team Name</div>
                <div className="text-lg font-bold text-foreground">{viewedTeam.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Department</div>
                <div className="text-base text-foreground">{viewedTeam.department}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Description</div>
                <div className="text-base text-foreground">{viewedTeam.description || "No description provided"}</div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-primary text-primary-foreground"
                  onClick={() => openEditModal(viewedTeam)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="bg-destructive text-destructive-foreground"
                  onClick={() => { handleDeleteTeam(viewedTeam.id); setIsViewModalOpen(false); }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Edit Team Modal */}
      <ResponsiveModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="text-xl font-semibold text-foreground">Edit Team</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-team-name">Team Name</Label>
              <Input
                id="edit-team-name"
                placeholder="Enter name"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Associated Department</Label>
              <Select value={editDepartment} onValueChange={setEditDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {isDepartmentsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading departments...
                    </SelectItem>
                  ) : departments.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No departments available
                    </SelectItem>
                  ) : (
                    departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ResponsiveModalFooter className="flex flex-row gap-2">
            <ResponsiveModalClose asChild>
              <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
            </ResponsiveModalClose>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white" 
              onClick={handleUpdateTeam}
            >
              Save Changes
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
} 