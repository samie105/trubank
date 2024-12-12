/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Download,
  Settings,
  Upload,
  FileUp,
  User,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/dialog-2";
import { Label } from "@/components/ui/label";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multiselector";
import { DateTimePicker } from "@/components/ui/date-picker";
import { PopoverClose } from "@radix-ui/react-popover";
import CustomerModalFormCreation from "./CustomerModalFormCreation";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

type CustomerType = "individual" | "business";

interface Customer {
  id: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  date: string;
  avatar: string;
  type: CustomerType;
  tierLevel: string;
  kycStatus: string;
}

const data: Customer[] = [
  {
    id: "T867890",
    firstName: "Emily",
    lastName: "Chen",
    email: "emilychen19@gmail.com",
    phone: "0812873904",
    status: "active",
    date: "21, August 2024",
    avatar: "",
    type: "individual",
    tierLevel: "Tier 1",
    kycStatus: "Approved",
  },
  {
    id: "T813579",
    businessName: "Johnson Enterprises",
    email: "info@johnsonenterprises.com",
    phone: "0702345893",
    status: "active",
    date: "20, August 2024",
    avatar: "",
    type: "business",
    tierLevel: "Tier 2",
    kycStatus: "Under Review",
  },
  // ... (add more customer data as needed)
];

export default function CustomerTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState<CustomerType>("individual");
  const [filterSettings, setFilterSettings] = useState({
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    tierLevels: [] as string[],
    kycStatuses: [] as string[],
  });
  const params = useSearchParams();
  const isCreating = params.get("creating");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={row.original.avatar} alt="Customer avatar" />
            <AvatarFallback>
              {
                row.original[
                  activeTab === "individual" ? "firstName" : "businessName"
                ]?.[0]
              }
              {
                row.original[
                  activeTab === "individual" ? "lastName" : "businessName"
                ]?.[0]
              }
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span>{row.getValue("id")}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(row.getValue("id") as string);
                toast.success("Customer ID has been copied to clipboard.");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      accessorKey: activeTab === "individual" ? "firstName" : "businessName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {activeTab === "individual" ? "First Name" : "Business Name"}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.getValue(
            activeTab === "individual" ? "firstName" : "businessName"
          )}
        </div>
      ),
    },
    ...(activeTab === "individual"
      ? [
          {
            accessorKey: "lastName",
            header: "Last Name",
          },
        ]
      : []),
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone Number",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.getValue("status") === "active"
              ? "bg-green-100 dark:bg-green-500/10 dark:text-green-500 text-green-700"
              : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-200"
          }`}
        >
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "tierLevel",
      header: "Tier Level",
    },
    {
      accessorKey: "kycStatus",
      header: "KYC Status",
    },
    {
      id: "actions",
      cell: ({}) => {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="gooeyLeft"
                className="h-8 bg-transparent duration-75 text-foreground w-8 p-0"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64">
              <div className="space-y-2 grid grid-cols-1">
                <p className="text-muted-foreground text-sm">Actions</p>
                <Button variant="ghost" className="flex justify-start">
                  View Profile
                </Button>
                <Button variant="ghost" className="flex justify-start">
                  Edit User
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500 flex justify-start hover:bg-red-500/10 hover:text-red-500"
                >
                  Delete User
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const clearFilter = () => {
    table.getColumn("date")?.setFilterValue([]);
    table.getColumn("tierLevel")?.setFilterValue(undefined);
    table.getColumn("kycStatus")?.setFilterValue(undefined);
    setFilterSettings({
      dateFrom: undefined,
      dateTo: undefined,
      tierLevels: [],
      kycStatuses: [],
    });
  };

  const handleFilterApply = () => {
    table
      .getColumn("date")
      ?.setFilterValue([filterSettings.dateFrom, filterSettings.dateTo]);
    table.getColumn("tierLevel")?.setFilterValue(filterSettings.tierLevels);
    table.getColumn("kycStatus")?.setFilterValue(filterSettings.kycStatuses);
  };

  const handleMultiSelectorChange = (
    field: "tierLevels" | "kycStatuses",
    values: string[]
  ) => {
    setFilterSettings((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const handleSearch = () => {
    table.getColumn("id")?.setFilterValue(searchTerm);
  };

  const isFilterApplyDisabled = () => {
    const { dateFrom, dateTo, tierLevels, kycStatuses } = filterSettings;
    const isDateInvalid =
      (dateFrom && !dateTo) ||
      (!dateFrom && dateTo) ||
      (dateFrom && dateTo && dateFrom > dateTo);
    const hasOtherFilters = tierLevels.length > 0 || kycStatuses.length > 0;
    return isDateInvalid || (!hasOtherFilters && !dateFrom && !dateTo);
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  const handleCreateOnlineClick = () => {
    setTimeout(() => {
      setIsModalOpen(true);
    }, 50);
  };

  const totalCustomers = table.getFilteredRowModel().rows.length;
  const activeCustomers = table
    .getFilteredRowModel()
    .rows.filter((row) => row.original.status === "active").length;
  const inactiveCustomers = totalCustomers - activeCustomers;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search customers by ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xl w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 md:mr-2 text-white" />
                <span className="text-white hidden md:block">
                  Create Customer
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="p-2 cursor-pointer md:mr-0 mr-14"
              align="end"
            >
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="py-3 cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download Template</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem className="py-2 cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Individual Customer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Business Customer</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="py-3 cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload Customer</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem className="py-2 cursor-pointer">
                    <FileUp className="mr-2 h-4 w-4" />
                    <span>Individual Customer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-2 cursor-pointer">
                    <FileUp className="mr-2 h-4 w-4" />
                    <span>Business Customer</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem asChild>
                <ResponsiveModal
                  open={isModalOpen}
                  defaultOpen={isCreating === "true"}
                  onOpenChange={setIsModalOpen}
                >
                  <ResponsiveModalTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleCreateOnlineClick();
                      }}
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      Create Online
                    </Button>
                  </ResponsiveModalTrigger>
                  <ResponsiveModalContent>
                    <CustomerModalFormCreation />
                  </ResponsiveModalContent>
                </ResponsiveModal>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="gooeyLeft"
            className="bg-transparent border text-foreground"
          >
            <Download className="w-4 h-4 md:mr-2" />
            <span className="md:block hidden">Export</span>
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="gooeyLeft"
                className="bg-transparent border text-foreground"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the filters for the customer table
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-1 items-center gap-3">
                    <Label htmlFor="from">From</Label>
                    <div className="col-span-2">
                      <DateTimePicker
                        granularity="day"
                        displayFormat={{ hour24: "yyyy/MM/dd" }}
                        value={filterSettings.dateFrom}
                        onChange={(date) =>
                          setFilterSettings({
                            ...filterSettings,
                            dateFrom: date,
                          })
                        }
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-3">
                    <Label htmlFor="to">To</Label>
                    <div className="col-span-2">
                      <DateTimePicker
                        granularity="day"
                        displayFormat={{ hour24: "yyyy/MM/dd" }}
                        value={filterSettings.dateTo}
                        onChange={(date) =>
                          setFilterSettings({
                            ...filterSettings,
                            dateTo: date,
                          })
                        }
                        className="rounded-md border"
                      />
                    </div>
                    {filterSettings.dateFrom &&
                      filterSettings.dateTo &&
                      filterSettings.dateFrom > filterSettings.dateTo && (
                        <div className="p-2 border text-muted-foreground text-sm rounded-md bg-secondary flex justify-center relative /text-destructive">
                          <div className="arrow-box -top-2 border-t border-l rounded-sm rotate-45 size-4 bg-secondary absolute"></div>
                          Please use a valid date selection
                        </div>
                      )}
                  </div>
                  <div className="grid grid-cols-1 items-center gap-1">
                    <Label htmlFor="tier">Tier Level</Label>
                    <MultiSelector
                      values={filterSettings.tierLevels}
                      onValuesChange={(values) =>
                        handleMultiSelectorChange("tierLevels", values)
                      }
                      className="col-span-2"
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput
                          className="text-sm"
                          placeholder="Select tier levels"
                        />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          <MultiSelectorItem value="Tier 1">
                            Tier 1
                          </MultiSelectorItem>
                          <MultiSelectorItem value="Tier 2">
                            Tier 2
                          </MultiSelectorItem>
                          <MultiSelectorItem value="Tier 3">
                            Tier 3
                          </MultiSelectorItem>
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-1">
                    <Label htmlFor="kyc">KYC Status</Label>
                    <MultiSelector
                      values={filterSettings.kycStatuses}
                      onValuesChange={(values) =>
                        handleMultiSelectorChange("kycStatuses", values)
                      }
                      className="col-span-2"
                    >
                      <MultiSelectorTrigger>
                        <MultiSelectorInput
                          className="text-sm"
                          placeholder="Select KYC statuses"
                        />
                      </MultiSelectorTrigger>
                      <MultiSelectorContent>
                        <MultiSelectorList>
                          <MultiSelectorItem value="Pending">
                            Pending
                          </MultiSelectorItem>
                          <MultiSelectorItem value="Under Review">
                            Under Review
                          </MultiSelectorItem>
                          <MultiSelectorItem value="Approved">
                            Approved
                          </MultiSelectorItem>
                          <MultiSelectorItem value="Rejected">
                            Rejected
                          </MultiSelectorItem>
                        </MultiSelectorList>
                      </MultiSelectorContent>
                    </MultiSelector>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    variant="gooeyLeft"
                    onClick={clearFilter}
                    className="text-muted-foreground/ bg-transparent border"
                  >
                    Clear Filter
                  </Button>
                  <PopoverClose asChild>
                    <Button
                      className="text-white font-semibold"
                      onClick={handleFilterApply}
                      disabled={isFilterApplyDisabled() === true}
                    >
                      Apply Filter
                    </Button>
                  </PopoverClose>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customer</p>
              <p className="text-2xl font-bold">{totalCustomers}</p>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-primary">⚡</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Customer</p>
              <p className="text-2xl font-bold">{activeCustomers}</p>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-green-500">⚡</span>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inactive Customer</p>
              <p className="text-2xl font-bold">{inactiveCustomers}</p>
            </div>
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-red-500">
                <User className="text-foreground size-4" />
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Tabs
        className="p-0 m-0"
        defaultValue="individual"
        onValueChange={(value) => setActiveTab(value as CustomerType)}
      >
        <TabsList className="bg-transparent p-0">
          <TabsTrigger value="individual">Individual</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-md border">
        <Table className="p-o m-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                if (row.original.type !== activeTab) return null;
                return (
                  <TableRow
                    className="text-nowrap"
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground"></div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
