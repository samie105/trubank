"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp,
  Settings as SettingsIcon,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface FormField {
  id: string;
  name: string;
  type: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  isExpanded?: boolean;
}

// Mock data for form sections
const mockFormSections: FormSection[] = [
  {
    id: "business-customer",
    title: "Business Customer",
    description: "This form is designed to collect essential information from new customers to create a personalized account. The data collected will enable us to:",
    fields: [
      { id: "1", name: "Business Name", type: "text" },
      { id: "2", name: "Business Type", type: "select" },
      { id: "3", name: "Industry/Sector", type: "select" },
      { id: "4", name: "Business Address", type: "text" },
      { id: "5", name: "Business Email", type: "email" },
      { id: "6", name: "Phone Number", type: "tel" },
      { id: "7", name: "Owner Name", type: "text" },
      { id: "8", name: "RC Number", type: "text" },
      { id: "9", name: "Upload CAC", type: "file" },
      { id: "10", name: "Owner First Name", type: "text" },
      { id: "11", name: "Owner Last Name", type: "text" },
      { id: "12", name: "Title", type: "text" },
      { id: "13", name: "Phone Number", type: "tel" },
      { id: "14", name: "Email", type: "email" },
      { id: "15", name: "Branch", type: "select" },
      { id: "16", name: "Account Officer", type: "select" }
    ],
    isExpanded: true
  },
  {
    id: "individual-customer",
    title: "Individual Customer", 
    fields: [
      { id: "17", name: "First Name", type: "text" },
      { id: "18", name: "Last Name", type: "text" },
      { id: "19", name: "Email", type: "email" },
      { id: "20", name: "Phone Number", type: "tel" },
      { id: "21", name: "Date of Birth", type: "date" },
      { id: "22", name: "Address", type: "text" }
    ],
    isExpanded: false
  },
  {
    id: "create-admin",
    title: "Create Admin",
    fields: [
      { id: "23", name: "First Name", type: "text" },
      { id: "24", name: "Last Name", type: "text" },
      { id: "25", name: "Email", type: "email" },
      { id: "26", name: "Role", type: "select" },
      { id: "27", name: "Department", type: "select" }
    ],
    isExpanded: false
  },
  {
    id: "add-branch",
    title: "Add Branch",
    fields: [
      { id: "28", name: "Branch Name", type: "text" },
      { id: "29", name: "Branch Code", type: "text" },
      { id: "30", name: "Address", type: "text" },
      { id: "31", name: "Manager", type: "select" },
      { id: "32", name: "Phone Number", type: "tel" }
    ],
    isExpanded: false
  },
  {
    id: "create-role",
    title: "Create Role",
    fields: [
      { id: "33", name: "Role Name", type: "text" },
      { id: "34", name: "Description", type: "textarea" },
      { id: "35", name: "Permissions", type: "multiselect" },
      { id: "36", name: "Department", type: "select" }
    ],
    isExpanded: false
  }
];

const formBenefits = [
  "Verify customer identity",
  "Provide tailored recommendations and offers", 
  "Improve customer service and support",
  "Enhance overall user experience",
  "Comply with regulatory requirements"
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("form-customization");
  const [searchTerm, setSearchTerm] = useState("");
  const [formSections, setFormSections] = useState<FormSection[]>(mockFormSections);

  const tabs = [
    { id: "form-customization", label: "Form Customization" },
    { id: "account-settings", label: "Account Settings" },
    { id: "notification-settings", label: "Notification Settings" }
  ];

  const filteredSections = formSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.fields.some(field => 
      field.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleSection = (sectionId: string) => {
    setFormSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const handlePreview = (sectionTitle: string) => {
    toast.success(`Previewing ${sectionTitle} form`);
  };

  const handleEdit = (sectionTitle: string) => {
    toast.success(`Editing ${sectionTitle} form`);
  };

  const handleDelete = (sectionTitle: string) => {
    toast.error(`${sectionTitle} form deleted`);
  };

  const handleCreateNewForm = () => {
    toast.success("Creating new form");
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex items-center gap-8 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Customization Content */}
      {activeTab === "form-customization" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
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
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={handleCreateNewForm}
              >
                Create New Form
                <Plus className="ml-2 w-4 h-4" />
              </Button>

              <Button variant="outline" size="icon">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-4">
            {filteredSections.map((section) => (
              <Card key={section.id} className="border border-border">
                <Collapsible 
                  open={section.isExpanded}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(section.title)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(section.title)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(section.title)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        {section.isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 px-4 pb-4">
                      {section.description && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Form Description
                          </h4>
                          <p className="text-sm text-foreground mb-4">
                            {section.description}
                          </p>
                          
                          <ul className="text-sm text-foreground space-y-1">
                            {formBenefits.map((benefit, index) => (
                              <li key={index}>- {benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                          Fields
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {section.fields.map((field) => (
                            <Badge 
                              key={field.id} 
                              variant="secondary"
                              className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30"
                            >
                              {field.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          {filteredSections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No forms found matching your search criteria.
            </div>
          )}
        </div>
      )}

      {/* Account Settings Content */}
      {activeTab === "account-settings" && (
        <div className="text-center py-8 text-muted-foreground">
          Account Settings content coming soon...
        </div>
      )}

      {/* Notification Settings Content */}
      {activeTab === "notification-settings" && (
        <div className="text-center py-8 text-muted-foreground">
          Notification Settings content coming soon...
        </div>
      )}
    </div>
  );
}