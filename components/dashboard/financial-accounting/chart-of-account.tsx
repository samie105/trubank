"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileSpreadsheet,
  FileText,
  Filter,
  X,
  Check,
  Landmark,
  Briefcase,
  LineChart,
  PieChart,
  CircleDollarSign,
  FileIcon,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

// Define the Account type
type Account = {
  id: string;
  accountType: string;
  accountTypeIcon: string;
  accountName: string;
  accountNameIcon: string;
  accountCode: string;
  subAccount: string;
  subAccountCode: string;
  usage: string;
  currency: string;
  branch: string;
};

// Sample data
const data: Account[] = [
  {
    id: "1",
    accountType: "Expense Account",
    accountTypeIcon: "expense",
    accountName: "Expense",
    accountNameIcon: "expense",
    accountCode: "231****4794",
    subAccount: "Savings",
    subAccountCode: "133****2583",
    usage: "Header",
    currency: "₦",
    branch: "Lekki",
  },
  {
    id: "2",
    accountType: "Asset Account",
    accountTypeIcon: "asset",
    accountName: "Asset",
    accountNameIcon: "asset",
    accountCode: "231****4794",
    subAccount: "N/A",
    subAccountCode: "N/A",
    usage: "Details",
    currency: "₦",
    branch: "Lekki",
  },
  {
    id: "3",
    accountType: "Investment Account",
    accountTypeIcon: "investment",
    accountName: "Investment",
    accountNameIcon: "investment",
    accountCode: "231****4794",
    subAccount: "N/A",
    subAccountCode: "N/A",
    usage: "Header",
    currency: "₦",
    branch: "Lekki",
  },
  {
    id: "4",
    accountType: "Equity Account",
    accountTypeIcon: "equity",
    accountName: "Equity",
    accountNameIcon: "equity",
    accountCode: "231****4794",
    subAccount: "Savings",
    subAccountCode: "133****2583",
    usage: "Details",
    currency: "₦",
    branch: "Lekki",
  },
  {
    id: "5",
    accountType: "Liability Account",
    accountTypeIcon: "liability",
    accountName: "Liability",
    accountNameIcon: "liability",
    accountCode: "231****4794",
    subAccount: "Savings",
    subAccountCode: "133****2583",
    usage: "Header",
    currency: "₦",
    branch: "Lekki",
  },
];

// Get unique values for filter options
const accountTypes = [...new Set(data.map((item) => item.accountType))];
const subAccounts = [...new Set(data.map((item) => item.subAccount))];
const usageTypes = [...new Set(data.map((item) => item.usage))];

// Filter form schema
const filterFormSchema = z.object({
  accountType: z.string().optional(),
  subAccount: z.string().optional(),
  usage: z.string().optional(),
});

// Create GL form schema
const createGLFormSchema = z.object({
  accountType: z.string().min(1, { message: "Account type is required" }),
  accountName: z.string().min(1, { message: "Account name is required" }),
  accountCode: z.string().min(1, { message: "Account code is required" }),
  subAccount: z.string().optional(),
  subAccountCode: z.string().optional(),
  usage: z.string().min(1, { message: "Usage is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  branch: z.string().min(1, { message: "Branch is required" }),
});

// Function to get the appropriate icon for account types
const getAccountIcon = (type: string) => {
  switch (type.toLowerCase().split(" ")[0]) {
    case "expense":
      return <CircleDollarSign className="h-4 w-4" />;
    case "asset":
      return <Briefcase className="h-4 w-4" />;
    case "investment":
      return <LineChart className="h-4 w-4" />;
    case "equity":
      return <PieChart className="h-4 w-4" />;
    case "liability":
      return <Landmark className="h-4 w-4" />;
    default:
      return <FileIcon className="h-4 w-4" />;
  }
};

export default function AccountTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter form
  const filterForm = useForm<z.infer<typeof filterFormSchema>>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      accountType: "",
      subAccount: "",
      usage: "",
    },
  });

  // Create GL form
  const createGLForm = useForm<z.infer<typeof createGLFormSchema>>({
    resolver: zodResolver(createGLFormSchema),
    defaultValues: {
      accountType: "Expense Account",
      accountName: "",
      accountCode: "",
      subAccount: "",
      subAccountCode: "",
      usage: "Header",
      currency: "₦",
      branch: "Lekki",
    },
  });

  // Apply filters function
  const applyFilters = (values: z.infer<typeof filterFormSchema>) => {
    // Clear existing filters
    table.resetColumnFilters();

    // Apply new filters if they exist and are not the "all" options
    if (values.accountType && values.accountType !== "all-types") {
      table.getColumn("accountType")?.setFilterValue(values.accountType);
    }

    if (values.subAccount && values.subAccount !== "all-sub-accounts") {
      table.getColumn("subAccount")?.setFilterValue(values.subAccount);
    }

    if (values.usage && values.usage !== "all-usage-types") {
      table.getColumn("usage")?.setFilterValue(values.usage);
    }
  };

  // Clear filters function
  const clearFilters = () => {
    filterForm.reset();
    table.resetColumnFilters();
  };

  // Create GL function
  const onCreateGL = (values: z.infer<typeof createGLFormSchema>) => {
    console.log("Creating GL with values:", values);
    // Here you would typically add the new GL to your data
    setIsCreating(true);

    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      setIsSheetOpen(false);
      createGLForm.reset();
      toast.success("General Ledger created successfully");
    }, 1000);
  };

  // Define columns
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: "accountType",
      header: "ACCOUNT TYPE",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 p-2 text-primary">
            {getAccountIcon(row.original.accountTypeIcon)}
          </span>
          <span>{row.getValue("accountType")}</span>
        </div>
      ),
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "accountName",
      header: "ACCOUNT NAME",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 p-2 text-primary">
            {getAccountIcon(row.original.accountNameIcon)}
          </span>
          <span>{row.getValue("accountName")}</span>
        </div>
      ),
    },
    {
      accessorKey: "accountCode",
      header: "ACCOUNT CODE",
    },
    {
      accessorKey: "subAccount",
      header: "SUB ACCOUNT",
      filterFn: (row, id, value) => {
        return (
          value === "all-sub-accounts" ||
          row.getValue(id) === value ||
          (value === "no-sub-account" && row.getValue(id) === "N/A")
        );
      },
    },
    {
      accessorKey: "subAccountCode",
      header: "SUB ACCOUNT CODE",
    },
    {
      accessorKey: "usage",
      header: "USAGE",
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "currency",
      header: "CURRENCY",
    },
    {
      accessorKey: "branch",
      header: "BRANCH",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => console.log("View", row.original.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log("Edit", row.original.id)}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log("Delete", row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

  // Export to PDF function
  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [
        columns
          .filter((col) => col.id !== "actions") // Exclude actions column
          .map((col) =>
            typeof col.header === "string" ? col.header : col.id || ""
          ),
      ],
      body: data.map((row) =>
        columns
          .filter((col) => col.id !== "actions") // Exclude actions column
          .map((col) => {
            const key =
              "accessorKey" in col
                ? (col.accessorKey as keyof Account)
                : (col.id as keyof Account);
            return row[key] || "";
          })
      ),
    });
    doc.save("accounts.pdf");
  };

  // Prepare CSV data
  const csvData = data.map((row) => {
    const csvRow: Record<string, string> = {};
    columns
      .filter((col) => col.id !== "actions") // Exclude actions column
      .forEach((col) => {
        const key = col.id as keyof Account;
        if (key) {
          csvRow[key] = row[key as keyof Account] as string;
        }
      });
    return csvRow;
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={
              (table.getColumn("accountName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("accountName")?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <div className="flex md:ml-0 ml-2 items-center gap-2">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="bg-primary text-wrap text-white hover:bg-primary">
                <Plus className="md:mr-2 h-4 w-4" />
                <span className="hidden md:block text-nowrap">Create GL</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Create General Ledger</SheetTitle>
              </SheetHeader>
              <Form {...createGLForm}>
                <form
                  onSubmit={createGLForm.handleSubmit(onCreateGL)}
                  className="space-y-4 py-4"
                >
                  <FormField
                    control={createGLForm.control}
                    name="accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch/Office</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch/office" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Expense Account">
                              Expense Account
                            </SelectItem>
                            <SelectItem value="Asset Account">
                              Asset Account
                            </SelectItem>
                            <SelectItem value="Investment Account">
                              Investment Account
                            </SelectItem>
                            <SelectItem value="Equity Account">
                              Equity Account
                            </SelectItem>
                            <SelectItem value="Liability Account">
                              Liability Account
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createGLForm.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Lekki">Lekki</SelectItem>
                            <SelectItem value="Ikeja">Ikeja</SelectItem>
                            <SelectItem value="Victoria Island">
                              Victoria Island
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createGLForm.control}
                    name="subAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Account</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parent account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Expense">Expense</SelectItem>
                            <SelectItem value="Asset">Asset</SelectItem>
                            <SelectItem value="Investment">
                              Investment
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createGLForm.control}
                    name="accountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Asset" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createGLForm.control}
                    name="accountCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account code" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createGLForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="₦">Naira (₦)</SelectItem>
                            <SelectItem value="$">USD ($)</SelectItem>
                            <SelectItem value="€">EUR (€)</SelectItem>
                            <SelectItem value="£">GBP (£)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createGLForm.control}
                    name="subAccountCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefix</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter prefix" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createGLForm.control}
                    name="usage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select usage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Header">Header</SelectItem>
                            <SelectItem value="Details">Details</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-primary text-white hover:bg-primary"
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Download className="md:mr-2 h-4 w-4" />
                <span className="hidden md:block">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <CSVLink data={csvData} filename="accounts.csv">
                <DropdownMenuItem>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Export to CSV</span>
                </DropdownMenuItem>
              </CSVLink>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export to PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Filter Accounts</h4>
                <Form {...filterForm}>
                  <form
                    onSubmit={filterForm.handleSubmit(applyFilters)}
                    className="space-y-4"
                  >
                    <FormField
                      control={filterForm.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all-types">
                                All Types
                              </SelectItem>
                              {accountTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filterForm.control}
                      name="subAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sub Account</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sub account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all-sub-accounts">
                                All Sub Accounts
                              </SelectItem>
                              {subAccounts.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filterForm.control}
                      name="usage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select usage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all-usage-types">
                                All Usage Types
                              </SelectItem>
                              {usageTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear Form
                      </Button>
                      <Button type="submit" size="sm">
                        <Check className="mr-2 h-4 w-4" />
                        Apply Filter
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} account(s)
        </div>
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
