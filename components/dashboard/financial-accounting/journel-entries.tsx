"use client";

import type React from "react";

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
  FileSpreadsheet,
  FileIcon,
  Settings,
  Calendar,
  Printer,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/dialog-2";

// Define the JournalEntry type
type JournalEntry = {
  id: string;
  entryId: string;
  type: string;
  reference: string;
  transactionDate: string;
  debitAccount: string;
  creditAccount: string;
  amount: string;
  submittedDate: string;
  submittedBy: string;
  branch: string;
  description?: string;
};

// Sample data
const data: JournalEntry[] = [
  {
    id: "1",
    entryId: "#JE51532332",
    type: "Money Transfer",
    reference: "REF1234AABC",
    transactionDate: "Sept 25, 2024, 2:17 pm",
    debitAccount: "231****4794",
    creditAccount: "231****4794",
    amount: "N30,000.00",
    submittedDate: "Oct 10, 2024, 2:17 pm",
    submittedBy: "Samuel Ikenna",
    branch: "Lekki",
    description: "Credit entry for incoming wire transfer (REF1234AABC)",
  },
  {
    id: "2",
    entryId: "#JE51532332",
    type: "Adjustment",
    reference: "REF1234AABC",
    transactionDate: "Sept 23, 2024, 2:17 pm",
    debitAccount: "231****4794",
    creditAccount: "231****4794",
    amount: "N30,000.00",
    submittedDate: "Oct 07, 2024, 2:17 pm",
    submittedBy: "Victor Ayomide",
    branch: "Lekki",
  },
  {
    id: "3",
    entryId: "#JE51532332",
    type: "Money Transfer",
    reference: "REF1234AABC",
    transactionDate: "Sept 20, 2024, 2:17 pm",
    debitAccount: "231****4794",
    creditAccount: "231****4794",
    amount: "N30,000.00",
    submittedDate: "Oct 05, 2024, 2:17 pm",
    submittedBy: "Samuel Ikenna",
    branch: "Lekki",
  },
  {
    id: "4",
    entryId: "#JE51532332",
    type: "Adjustment",
    reference: "REF1234AABC",
    transactionDate: "Sept 18, 2024, 2:17 pm",
    debitAccount: "231****4794",
    creditAccount: "231****4794",
    amount: "N30,000.00",
    submittedDate: "Oct 02, 2024, 2:17 pm",
    submittedBy: "Samuel Ikenna",
    branch: "Lekki",
  },
  {
    id: "5",
    entryId: "#JE51532332",
    type: "Money Transfer",
    reference: "REF1234AABC",
    transactionDate: "Sept 15, 2024, 2:17 pm",
    debitAccount: "231****4794",
    creditAccount: "231****4794",
    amount: "N30,000.00",
    submittedDate: "Sept 25, 2024, 2:17 pm",
    submittedBy: "Esther Daniels",
    branch: "Lekki",
  },
];

export default function JournalEntries() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define columns
  const columns: ColumnDef<JournalEntry>[] = [
    {
      accessorKey: "entryId",
      header: "ENTRY ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-amber-500">□</span>
          <span>{row.getValue("entryId")}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "TYPE",
    },
    {
      accessorKey: "reference",
      header: "REFERENCE",
    },
    {
      accessorKey: "transactionDate",
      header: "TRANSACTION DATE",
    },
    {
      accessorKey: "debitAccount",
      header: "DEBIT ACCT",
    },
    {
      accessorKey: "creditAccount",
      header: "CREDIT ACCT",
    },
    {
      accessorKey: "amount",
      header: "AMOUNT",
    },
    {
      accessorKey: "submittedDate",
      header: "SUBMITTED DATE",
    },
    {
      accessorKey: "submittedBy",
      header: "SUBMITTED BY",
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
                onClick={() => {
                  setSelectedEntry(row.original);
                  setIsDialogOpen(true);
                }}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success("Entry copied to clipboard");
                }}
              >
                Copy Entry ID
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
        columns.map((col) =>
          typeof col.header === "string" ? col.header : col.id || ""
        ),
      ],
      body: data.map((row) =>
        columns.map((col) => {
          const accessorKey = col.id as keyof JournalEntry | undefined;
          const columnId = col.id;
          let value = "";

          if (accessorKey) {
            value = (row[accessorKey] as string) || "";
          } else if (columnId && typeof columnId === "string") {
            value = (row[columnId as keyof JournalEntry] as string) || "";
          }
          return value;
        })
      ),
    });
    doc.save("journal-entries.pdf");
    toast.success("PDF exported successfully");
  };

  // Prepare CSV data
  const csvData = data.map((row) => {
    const csvRow: Record<string, string> = {};
    columns.forEach((col) => {
      if (col.id) {
        csvRow[col.id as string] = row[col.id as keyof JournalEntry] as string;
      }
    });
    return csvRow;
  });

  // Print receipt function
  const printReceipt = () => {
    if (!selectedEntry) return;

    const doc = new jsPDF();

    // Add company logo/header
    doc.setFontSize(20);
    doc.text("TruBank Receipt", 105, 20, { align: "center" });

    // Add entry details
    doc.setFontSize(12);
    doc.text(`Amount: ${selectedEntry.amount}`, 20, 40);
    doc.text(`Date: ${selectedEntry.submittedDate}`, 20, 50);
    doc.text(`Reference: ${selectedEntry.reference}`, 20, 60);
    doc.text(`Entry ID: ${selectedEntry.entryId}`, 20, 70);
    doc.text(`Type: ${selectedEntry.type}`, 20, 80);
    doc.text(`Debit Account: ${selectedEntry.debitAccount}`, 20, 90);
    doc.text(`Credit Account: ${selectedEntry.creditAccount}`, 20, 100);
    doc.text(`Submitted By: ${selectedEntry.submittedBy}`, 20, 110);
    doc.text(`Branch: ${selectedEntry.branch}`, 20, 120);

    if (selectedEntry.description) {
      doc.text(`Description: ${selectedEntry.description}`, 20, 130);
    }

    // Add footer
    doc.setFontSize(10);
    doc.text("Thank you for banking with TruBank", 105, 150, {
      align: "center",
    });

    doc.save("receipt.pdf");
    toast.success("Receipt printed successfully");
  };

  // Handle form submission
  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Journal entry created successfully");
  };

  return (
    <div className="w-full">
      {/* Table header with search and actions */}
      <div className="flex items-center justify-between py-4">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={
              (table.getColumn("entryId")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("entryId")?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-primary text-white ml-2 md:ml-0 hover:bg-primary/90">
                <Plus className="md:mr-2 h-4 w-4" />{" "}
                <span className="hidden md:block">Create Journal Entry</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Create Journal Entry</SheetTitle>
                <SheetDescription>
                  Fill in the details to create a new journal entry.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleCreateEntry} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select defaultValue="lekki">
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lekki">Lekki</SelectItem>
                      <SelectItem value="ikeja">Ikeja</SelectItem>
                      <SelectItem value="victoria-island">
                        Victoria Island
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="money-transfer">
                        Money Transfer
                      </SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionDate">Transaction Date</Label>
                  <div className="relative">
                    <Input
                      id="transactionDate"
                      type="date"
                      defaultValue="2024-09-21"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input id="reference" placeholder="Enter reference number" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter description" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debitAccount">Debit Account</Label>
                  <Input id="debitAccount" placeholder="Account Number/Name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditAccount">Credit Account</Label>
                  <Input id="creditAccount" placeholder="Account Number/Name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5">₦</span>
                    <Input
                      id="amount"
                      placeholder="Enter amount"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea id="note" placeholder="Enter note" />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Create Journal Entry
                </Button>
              </form>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Download className="md:mr-2 h-4 w-4" />{" "}
                <span className="hidden md:block">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <CSVLink data={csvData} filename="journal-entries.csv">
                <DropdownMenuItem
                  onClick={() => toast.success("CSV exported successfully")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Export to CSV</span>
                </DropdownMenuItem>
              </CSVLink>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileIcon className="mr-2 h-4 w-4" />
                <span>Export to PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main table */}
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
                  onClick={() => {
                    setSelectedEntry(row.original);
                    setIsDialogOpen(true);
                  }}
                  className="cursor-pointer"
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

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} entries
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

      {/* Entry details dialog */}
      <ResponsiveModal open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ResponsiveModalContent className="sm:max-w-md">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle className="flex justify-between items-center">
              <span className="text-green-500 text-xl font-bold">
                +{selectedEntry?.amount}
              </span>
              <div className="bg-primary/10 rounded-full p-2 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </ResponsiveModalTitle>
            <ResponsiveModalDescription>
              <Button
                variant="outline"
                className="flex items-center gap-2 mt-2 border-primary/10 hover:bg-transparent hover:border-primary/10 hover:text-primary/60 text-primary"
                onClick={printReceipt}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          {selectedEntry && (
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEntry.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Entry ID</h3>
                  <p className="text-sm">{selectedEntry.entryId}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Type</h3>
                  <p className="text-sm">{selectedEntry.type}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Reference</h3>
                  <p className="text-sm">{selectedEntry.reference}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Transaction Date</h3>
                  <p className="text-sm">{selectedEntry.transactionDate}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Debit Account</h3>
                  <p className="text-sm">{selectedEntry.debitAccount}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Credit Account</h3>
                  <p className="text-sm">{selectedEntry.creditAccount}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Amount</h3>
                  <p className="text-sm">{selectedEntry.amount}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Submitted Date</h3>
                  <p className="text-sm">{selectedEntry.submittedDate}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Submitted By</h3>
                  <p className="text-sm">{selectedEntry.submittedBy}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Branch</h3>
                  <p className="text-sm">{selectedEntry.branch}</p>
                </div>
              </div>
            </div>
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
