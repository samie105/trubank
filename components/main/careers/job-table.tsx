"use client";

import * as React from "react";
import { GlobeIcon as World } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetCountries } from "react-country-state-city";

interface Job {
  id: string;
  role: string;
  team: string;
  office: string;
  isRemote: boolean;
}

// const jobs: Job[] = [
//   {
//     id: "1",
//     role: "Customer Relationship Manager",
//     team: "Customer Service",
//     office: "Lagos, Nigeria",
//     isRemote: false,
//   },
//   {
//     id: "2",
//     role: "Operations Analyst",
//     team: "Operations",
//     office: "Lagos, Nigeria",
//     isRemote: false,
//   },
//   {
//     id: "3",
//     role: "Branch Support Specialist",
//     team: "Customer Operations",
//     office: "Remote",
//     isRemote: true,
//   },
//   {
//     id: "4",
//     role: "Client Support Officer",
//     team: "Customer Service",
//     office: "Lagos, Nigeria",
//     isRemote: false,
//   },
//   {
//     id: "5",
//     role: "Software Engineer",
//     team: "Technology Development",
//     office: "Remote",
//     isRemote: true,
//   },
//   {
//     id: "6",
//     role: "Cybersecurity Analyst",
//     team: "IT Security",
//     office: "Lagos, Nigeria",
//     isRemote: false,
//   },
//   {
//     id: "7",
//     role: "Data Scientist",
//     team: "Data Analytics",
//     office: "Remote",
//     isRemote: true,
//   },
//   {
//     id: "8",
//     role: "API Integration Specialist",
//     team: "Technology Development",
//     office: "Lagos, Nigeria",
//     isRemote: false,
//   },
//   {
//     id: "9",
//     role: "Financial Analyst",
//     team: "Finance And Strategy",
//     office: "Lagos, Nigeria",
//     isRemote: false,
//   },
//   {
//     id: "10",
//     role: "Marketing Strategist",
//     team: "Marketing",
//     office: "Remote",
//     isRemote: true,
//   },
//   {
//     id: "11",
//     role: "Compliance Officer",
//     team: "Risk And Compliance",
//     office: "Lagos, Nigeria",
//     isRemote: false,
//   },
// ];
const jobs:Job[] = []
const teams = Array.from(new Set(jobs.map((job) => job.team)));
const offices = Array.from(new Set(jobs.map((job) => job.office)));

export function JobsTable() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTeam, setSelectedTeam] = React.useState("");
  const [selectedOffice, setSelectedOffice] = React.useState("");
  const [nigeriaFlagUrl, setNigeriaFlagUrl] = React.useState("");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.role
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTeam =
      selectedTeam === "all" || !selectedTeam || job.team === selectedTeam;
    const matchesOffice =
      selectedOffice === "all" ||
      !selectedOffice ||
      job.office === selectedOffice;
    return matchesSearch && matchesTeam && matchesOffice;
  });

  React.useEffect(() => {
    const fetchCountry = async () => {
      const data = await GetCountries();
      const nigeriaCountry = data.find((country) => country.name === "Nigeria");
      if (nigeriaCountry) {
        setNigeriaFlagUrl(nigeriaCountry.emoji);
      }
    };
    fetchCountry();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl ">
      <div className="rounded-xl bg-white p-6">
        {/* Search and Filters */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Input
            placeholder="Search Role"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-2 border-gray-200 bg-white focus:border-primary text-black/80 focus:ring-primary"
          />
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="border-gray-200 bg-white text-black/80 focus:border-primary focus:ring-primary">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent className="border border-gray-300 bg-white text-black/80 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <SelectItem
                value="all"
                className="focus:bg-gray-100 focus:text-black/70"
              >
                All Teams
              </SelectItem>
              {teams.map((team) => (
                <SelectItem
                  className="focus:bg-gray-100 focus:text-black/70"
                  key={team}
                  value={team}
                >
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedOffice} onValueChange={setSelectedOffice}>
            <SelectTrigger className="border-gray-200 bg-white focus:border-none text-black/80 focus:ring-primary">
              <SelectValue placeholder="Select Office" />
            </SelectTrigger>
            <SelectContent className="border border-gray-300 bg-white text-black/80 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <SelectItem
                value="all"
                className="focus:bg-gray-100 focus:text-black/70"
              >
                All Offices
              </SelectItem>
              {offices.map((office) => (
                <SelectItem
                  key={office}
                  value={office}
                  className="focus:bg-gray-100 focus:text-black/70"
                >
                  {office}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Available Roles Count */}
        <div className="mb-6 flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Available Roles
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
            {filteredJobs.length}
          </span>
        </div>

        {/* Jobs Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 hover:bg-gray-100 bg-gray-50">
                <TableHead className="text-xs font-medium uppercase text-gray-500">
                  Role
                </TableHead>
                <TableHead className="text-xs font-medium uppercase text-gray-500">
                  Team
                </TableHead>
                <TableHead className="text-xs font-medium uppercase text-gray-500">
                  Office
                </TableHead>
                <TableHead className="w-[100px] text-xs font-medium uppercase text-gray-500"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm text-gray-500">0 Records</p>
                      {/* <p className="text-xs text-gray-400">Try adjusting your filters</p> */}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="border-b hover:bg-gray-100 border-gray-200"
                  >
                    <TableCell className="font-medium  text-gray-900">
                      {job.role}
                    </TableCell>
                    <TableCell className="text-gray-500 ">{job.team}</TableCell>
                    <TableCell className="text-gray-500 ">
                      <div className="flex items-center gap-2">
                        {job.isRemote ? (
                          <World className="h-4 w-4 text-gray-400" />
                        ) : (
                          <div className="size-7 flex items-center justify-center">
                            {nigeriaFlagUrl}
                          </div>
                        )}
                        {job.office}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button className="w-full bg-primary text-white hover:bg-primary/90">
                        Apply
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
