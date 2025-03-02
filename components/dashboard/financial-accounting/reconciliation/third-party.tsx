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
  Plus,
  Upload,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Settings,
  Info,
  ChevronDown,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

// Define the Transaction type
type Transaction = {
  id: string;
  reference: string;
  date: string;
  time: string;
  amount: string;
  type: "Credit" | "Debit";
  sender?: string;
  senderAccount?: string;
  receiver?: string;
  receiverAccount?: string;
  status?: "Reconciled" | "Not Reconciled" | "Flagged";
  comments?: string;
  isFlagged?: boolean;
};

// Define the Account type
type Account = {
  id: string;
  name: string;
  number: string;
};

// Sample GL accounts
const glAccounts: Account[] = [
  { id: "1", name: "Cash", number: "2903090290" },
  { id: "2", name: "Cash", number: "0190290190" },
  { id: "3", name: "Cash", number: "0190290192" },
  { id: "4", name: "Cash", number: "1797918029" },
];

// Sample third-party accounts
const thirdPartyAccounts: Account[] = [
  { id: "1", name: "Customer's account", number: "2903090290" },
  { id: "2", name: "Vendor's account", number: "0190290190" },
  { id: "3", name: "Partner's account", number: "0190290192" },
];

// Sample data for third-party transactions
const thirdPartyData: Transaction[] = [
  {
    id: "1",
    reference: "#951532232",
    date: "21 August 2024",
    time: "10:25 AM",
    amount: "₦20,000.00",
    type: "Credit",
    sender: "Golden Sachs(Nig) Inc",
    senderAccount: "4867018225",
    receiver: "Kaleb Ayo Oluwi",
    receiverAccount: "8235502793",
    status: "Reconciled",
    comments: "",
  },
  {
    id: "2",
    reference: "#951532233",
    date: "21 August 2024",
    time: "10:26 AM",
    amount: "₦20,000.00",
    type: "Credit",
    sender: "Golden Sachs(Nig) Inc",
    senderAccount: "4867018225",
    receiver: "Kaleb Ayo Oluwi",
    receiverAccount: "8235502793",
    status: "Flagged",
    comments:
      "Amount doesn't match with the invoice #INV-2024-08-21. Please verify with the customer.",
  },
  {
    id: "3",
    reference: "#951532234",
    date: "21 August 2024",
    time: "10:27 AM",
    amount: "₦40,000.00",
    type: "Credit",
    sender: "Golden Sachs(Nig) Inc",
    senderAccount: "4867018225",
    receiver: "Kaleb Ayo Oluwi",
    receiverAccount: "8235502793",
    status: "Reconciled",
    comments: "",
  },
  {
    id: "4",
    reference: "#951532235",
    date: "21 August 2024",
    time: "10:28 AM",
    amount: "₦40,000.00",
    type: "Credit",
    sender: "Golden Sachs(Nig) Inc",
    senderAccount: "4867018225",
    receiver: "Kaleb Ayo Oluwi",
    receiverAccount: "8235502793",
    status: "Not Reconciled",
    comments: "",
  },
  {
    id: "5",
    reference: "#951532236",
    date: "21 August 2024",
    time: "10:29 AM",
    amount: "₦40,000.00",
    type: "Credit",
    sender: "Golden Sachs(Nig) Inc",
    senderAccount: "4867018225",
    receiver: "Kaleb Ayo Oluwi",
    receiverAccount: "8235502793",
    status: "Not Reconciled",
    comments: "",
  },
];

// Sample data for GL transactions
const glData: Transaction[] = [
  {
    id: "1",
    reference: "#951532232",
    date: "21 August 2024",
    time: "10:25 AM",
    amount: "₦20,000.00",
    type: "Credit",
    status: "Reconciled",
    comments: "",
  },
  {
    id: "2",
    reference: "#951532233",
    date: "21 August 2024",
    time: "10:26 AM",
    amount: "₦20,000.00",
    type: "Debit",
    status: "Flagged",
    comments:
      "Amount doesn't match with the invoice #INV-2024-08-21. Please verify with the customer.",
  },
  {
    id: "3",
    reference: "#951532234",
    date: "21 August 2024",
    time: "10:27 AM",
    amount: "₦20,000.00",
    type: "Debit",
    status: "Reconciled",
    comments: "",
  },
  {
    id: "4",
    reference: "#951532235",
    date: "21 August 2024",
    time: "10:28 AM",
    amount: "₦20,000.00",
    type: "Credit",
    status: "Not Reconciled",
    comments: "",
  },
  {
    id: "5",
    reference: "#951532236",
    date: "21 August 2024",
    time: "10:29 AM",
    amount: "₦20,000.00",
    type: "Credit",
    status: "Not Reconciled",
    comments: "",
  },
];

export default function ReconciliationTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedThirdParty, setSelectedThirdParty] = useState<Account | null>(
    thirdPartyAccounts[0]
  );
  const [selectedGL, setSelectedGL] = useState<Account | null>(glAccounts[0]);
  const [thirdPartyOpen, setThirdPartyOpen] = useState(false);
  const [glOpen, setGLOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentComment, setCurrentComment] = useState("");
  const [, setCurrentTransactionId] = useState("");

  // Define columns for third-party transactions
  const thirdPartyColumns: ColumnDef<Transaction>[] = [
    {
      id: "reference",
      accessorFn: (row) => row.reference,
      header: "REFERENCE",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Checkbox className="mr-2 size-4" />
          <span>{row.getValue("reference")}</span>
        </div>
      ),
    },
    {
      id: "date",
      accessorFn: (row) => row.date,
      header: "DATE",
      cell: ({ row }) => (
        <div>
          <div>{row.getValue("date")}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.time}
          </div>
        </div>
      ),
    },
    {
      id: "amount",
      accessorFn: (row) => row.amount,
      header: "AMOUNT",
    },
    {
      id: "type",
      accessorFn: (row) => row.type,
      header: "TYPE",
    },
    {
      id: "sender",
      accessorFn: (row) => row.sender,
      header: "SENDER",
      cell: ({ row }) => (
        <div>
          <div>{row.getValue("sender")}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.senderAccount}
          </div>
        </div>
      ),
    },
    {
      id: "receiver",
      accessorFn: (row) => row.receiver,
      header: "RECEIVER",
      cell: ({ row }) => (
        <div>
          <div>{row.getValue("receiver")}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.receiverAccount}
          </div>
        </div>
      ),
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
                className="text-green-500 font-medium"
                onClick={() => handleReconcile(row.original.id)}
              >
                Reconcile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 font-medium"
                onClick={() => handleFlag(row.original.id)}
              >
                Flag
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Define columns for GL transactions
  const glColumns: ColumnDef<Transaction>[] = [
    {
      id: "reference",
      accessorKey: "reference",
      header: "REFERENCE",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Checkbox className="mr-2 size-4" />
          <span>{row.getValue("reference")}</span>
        </div>
      ),
    },
    {
      id: "date",
      accessorKey: "date",
      header: "DATE",
      cell: ({ row }) => (
        <div>
          <div>{row.getValue("date")}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.time}
          </div>
        </div>
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: "AMOUNT",
    },
    {
      id: "type",
      accessorKey: "type",
      header: "TYPE",
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "px-2 py-1 text-xs rounded-md font-medium",
                status === "Reconciled"
                  ? "bg-green-600/20 text-green-600"
                  : status === "Flagged"
                  ? "bg-red-600/20 text-red-600"
                  : "bg-primary/20 text-primary"
              )}
            >
              {status}
            </div>
            {row.original.comments && row.original.comments.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
                onClick={() => {
                  setCurrentComment(row.original.comments || "");
                  setCurrentTransactionId(row.original.id);
                  setCommentDialogOpen(true);
                }}
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        );
      },
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
                className="text-green-500 font-medium"
                onClick={() => handleReconcile(row.original.id)}
              >
                Reconcile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 font-medium"
                onClick={() => handleFlag(row.original.id)}
              >
                Flag
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const thirdPartyTable = useReactTable({
    data: thirdPartyData,
    columns: thirdPartyColumns,
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

  const glTable = useReactTable({
    data: glData,
    columns: glColumns,
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
        thirdPartyColumns.map((col) =>
          typeof col.header === "string" ? col.header : col.id || ""
        ),
      ],
      body: thirdPartyData.map((row) =>
        thirdPartyColumns.map((col) => {
          if ("accessorKey" in col && typeof col.accessorKey === "string") {
            return row[col.accessorKey as keyof Transaction] || "";
          }
          return "";
        })
      ),
    });
    doc.save("reconciliation.pdf");

    toast.success("Export successful", {
      description: "The reconciliation data has been exported to PDF",
    });
  };

  // Prepare CSV data
  const csvData = thirdPartyData.map((row) => {
    const csvRow: Record<string, string> = {};
    thirdPartyColumns.forEach((col) => {
      if ("accessorKey" in col && typeof col.accessorKey === "string") {
        csvRow[col.accessorKey] = String(
          row[col.accessorKey as keyof Transaction]
        );
      }
    });
    return csvRow;
  });

  // Handle reconcile action
  const handleReconcile = (id: string) => {
    // In a real app, you would update the status in your database
    console.log("Reconciling transaction:", id);

    toast.success("Transaction reconciled", {
      description: `Transaction ${id} has been marked as reconciled.`,
    });
  };

  // Handle flag action
  const handleFlag = (id: string) => {
    // In a real app, you would update the status in your database
    console.log("Flagging transaction:", id);

    toast("Transaction flagged", {
      description:
        "Please add a comment to explain why this transaction is flagged.",
      action: {
        label: "Add Comment",
        onClick: () => console.log("Add comment action"),
      },
    });
  };

  // Update the GL selection function to use selectedGL
  const handleGLSelection = (account: Account) => {
    setSelectedGL(account);
    setGLOpen(false);
    toast.success("GL account selected", {
      description: `${account.name} (${account.number}) has been selected.`,
    });
    // Here you would typically fetch or filter data based on the selected GL
    // For demonstration, let's just log it
    console.log("Selected GL:", account);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Popover open={thirdPartyOpen} onOpenChange={setThirdPartyOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={thirdPartyOpen}
                className="w-[200px] justify-between"
              >
                {selectedThirdParty
                  ? `Select Third-Party`
                  : "Select Third-Party"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search account..." />
                <CommandList>
                  <CommandEmpty>No account found.</CommandEmpty>
                  <CommandGroup>
                    {thirdPartyAccounts.map((account) => (
                      <CommandItem
                        key={account.id}
                        value={account.id}
                        onSelect={() => {
                          setSelectedThirdParty(account);
                          setThirdPartyOpen(false);
                          toast.success("Third-party account selected", {
                            description: `${account.name} (${account.number}) has been selected.`,
                          });
                        }}
                      >
                        {account.name} ({account.number})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>

          <Popover open={glOpen} onOpenChange={setGLOpen}>
            <PopoverTrigger asChild>
              <Button className="bg-primary hover:bg-primary flex items-center gap-2">
                <span className="hidden md:block">Select GL</span>
                <Plus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <div className="p-4 font-medium">Select General Ledger</div>
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList className="max-h-[200px]">
                  <CommandEmpty>No account found.</CommandEmpty>
                  <CommandGroup>
                    {glAccounts.map((account) => (
                      <CommandItem
                        key={account.id}
                        value={account.id}
                        onSelect={() => handleGLSelection(account)}
                      >
                        {account.name} ({account.number})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                <div className="flex items-center justify-between p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedGL(null);
                      setGLOpen(false);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary"
                    size="sm"
                    onClick={() => {
                      if (selectedGL) {
                        handleGLSelection(selectedGL);
                      }
                      setGLOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className=" p-4 rounded-lg border">
          <h3 className="font-medium mb-2">Third-Party</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10/ p-3 rounded-lg flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Total Credit
                </div>
                <div className="font-medium text-sm">₦100,805,000.25</div>
              </div>
            </div>
            <div className="bg-primary/10/ p-3 rounded-lg flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Debit</div>
                <div className="font-medium text-sm">₦78,805,000.00</div>
              </div>
            </div>
          </div>
        </div>

        <div className=" p-4 rounded-lg border">
          <h3 className="font-medium mb-2">General Ledger</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10/ p-3 rounded-lg flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Total Credit
                </div>
                <div className="font-medium text-sm">₦100,000,000</div>
              </div>
            </div>
            <div className="bg-primary/10/ p-3 rounded-lg flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Debit</div>
                <div className="font-medium text-sm">₦100,200,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className=" p-4 rounded-lg border mb-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-sm font-medium mb-1">
              Reconciliation Status:
            </div>
            <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded-md text-sm inline-block">
              Not Reconciled
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Difference Amount:</div>
            <div className="font-medium">₦200,000.00</div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Report:</div>
            <div className="font-medium">GL</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="relative w-72 mr-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={
              (thirdPartyTable
                .getColumn("reference")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              thirdPartyTable
                .getColumn("reference")
                ?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <CSVLink data={csvData} filename="reconciliation.csv">
                <DropdownMenuItem>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Export to CSV</span>
                </DropdownMenuItem>
              </CSVLink>
              <DropdownMenuItem onClick={exportToPDF}>
                <FilePdf className="mr-2 h-4 w-4" />
                <span>Export to PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2">
          Third-Party - Customer&apos;s account (2903090290)
        </h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {thirdPartyTable.getHeaderGroups().map((headerGroup) => (
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
              {thirdPartyTable.getRowModel().rows?.length ? (
                thirdPartyTable.getRowModel().rows.map((row) => (
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
                    colSpan={thirdPartyColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">General Ledger - Cash (2903090290)</h3>
        {selectedGL && (
          <div className="my-2 text-sm text-muted-foreground">
            Selected: {selectedGL.name} ({selectedGL.number})
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {glTable.getHeaderGroups().map((headerGroup) => (
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
              {glTable.getRowModel().rows?.length ? (
                glTable.getRowModel().rows.map((row) => (
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
                    colSpan={glColumns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Comment</DialogTitle>
            <DialogDescription>
              This transaction has been flagged with the following comment:
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-md">{currentComment}</div>
          <div className="flex justify-end">
            <Button onClick={() => setCommentDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
