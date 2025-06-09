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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Users
} from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  department: string;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  type: string;
  approvalCount: number;
}

// Mock data for teams
const mockTeams: Team[] = [
  { id: "1", name: "Team 1", department: "IT Support" },
  { id: "2", name: "Team 2", department: "IT Support" },
  { id: "3", name: "Team 3", department: "IT Support" },
  { id: "4", name: "Team 1", department: "Customer Support" },
  { id: "5", name: "Team 2", department: "Customer Support" },
  { id: "6", name: "Team 3", department: "Customer Support" },
];

// Mock data for approval workflows
const mockWorkflows: ApprovalWorkflow[] = [
  { id: "1", name: "Customer Creation", type: "Create User", approvalCount: 3 },
  { id: "2", name: "Branch Creation", type: "Create Branch", approvalCount: 3 },
  { id: "3", name: "GL Creation", type: "Create GL", approvalCount: 3 },
  { id: "4", name: "Team Creation", type: "Create Team", approvalCount: 3 },
  { id: "5", name: "Department Creation", type: "Create Department", approvalCount: 3 },
  { id: "6", name: "Role Creation", type: "Create Role", approvalCount: 3 },
  { id: "7", name: "Journal Creation", type: "Create Journal", approvalCount: 3 },
];

const departments = ["IT Support", "Customer Support", "Finance", "HR", "Operations"];

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showApprovalWorkflow, setShowApprovalWorkflow] = useState(false);
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [workflows] = useState<ApprovalWorkflow[]>(mockWorkflows);
  
  // Create team form state
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeam = () => {
    if (!teamName || !selectedDepartment) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTeam: Team = {
      id: (teams.length + 1).toString(),
      name: teamName,
      department: selectedDepartment,
    };

    setTeams([...teams, newTeam]);
    setTeamName("");
    setDescription("");
    setSelectedDepartment("");
    setIsCreateModalOpen(false);
    toast.success("Team created successfully");
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(team => team.id !== teamId));
    toast.success("Team deleted successfully");
  };

  const TeamIcon = () => (
    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
      <Users className="w-4 h-4 text-primary" />
    </div>
  );

  const WorkflowIcon = () => (
    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
      <Settings className="w-4 h-4 text-primary" />
    </div>
  );

  if (showApprovalWorkflow) {
    return (
      <div className="p-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApprovalWorkflow(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold">Approval Workflow</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="mr-2 w-4 h-4" />
              Create Approval Level
            </Button>
            <Button variant="outline">
              <Download className="mr-2 w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-72 mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search"
            className="pl-10"
          />
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
              {workflows.map((workflow) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
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
            className="pl-10 w-64 bg-background"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowApprovalWorkflow(true)}
            className="text-muted-foreground border-border"
          >
            Approval Workflow
          </Button>

          <ResponsiveModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <ResponsiveModalTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Create Team
                <Plus className="ml-2 w-4 h-4" />
              </Button>
            </ResponsiveModalTrigger>
            <ResponsiveModalContent className="sm:max-w-md">
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
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
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
                >
                  Create
                </Button>
              </ResponsiveModalFooter>
            </ResponsiveModalContent>
          </ResponsiveModal>

          <Button variant="outline" className="text-muted-foreground border-border">
            Export
            <Download className="ml-2 w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon" className="text-muted-foreground border-border">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TEAM NAME</TableHead>
              <TableHead>ASSOCIATED DEPARTMENT</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TableRow key={team.id}>
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
                      <DropdownMenuItem>
                        <Eye className="mr-2 w-4 h-4" />
                        View Teams
                      </DropdownMenuItem>
                      <DropdownMenuItem>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No teams found matching your search.
        </div>
      )}
    </div>
  );
} 