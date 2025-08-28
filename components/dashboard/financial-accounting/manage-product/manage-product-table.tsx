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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Define the Table Product type (simplified for display)
type TableProduct = {
  id: string;
  productName: string;
  accountType: string;
  interestType: string;
  interestRate: string;
  feeType: string;
  feeAmount: string;
  overdraftLimit: string;
  status: "Active" | "Inactive";
};

// Sample data
const data: TableProduct[] = [
  {
    id: "1",
    productName: "Shield & Crow",
    accountType: "Savings",
    interestType: "Fixed",
    interestRate: "2% (per annum)",
    feeType: "Fixed",
    feeAmount: "₦10 (per transaction)",
    overdraftLimit: "₦40,000",
    status: "Active",
  },
  {
    id: "2",
    productName: "Fee Flex",
    accountType: "Savings",
    interestType: "Fixed",
    interestRate: "2% (per annum)",
    feeType: "Fixed",
    feeAmount: "₦10 (per transaction)",
    overdraftLimit: "₦40,000",
    status: "Active",
  },
  {
    id: "3",
    productName: "Savings Boost",
    accountType: "Savings",
    interestType: "Fixed",
    interestRate: "2% (per annum)",
    feeType: "Fixed",
    feeAmount: "₦10 (per transaction)",
    overdraftLimit: "₦40,000",
    status: "Inactive",
  },
  {
    id: "4",
    productName: "Secure Earn",
    accountType: "Savings",
    interestType: "Fixed",
    interestRate: "2% (per annum)",
    feeType: "Fixed",
    feeAmount: "₦10 (per transaction)",
    overdraftLimit: "₦40,000",
    status: "Inactive",
  },
  {
    id: "5",
    productName: "CommerceCare Plus",
    accountType: "Savings",
    interestType: "Fixed",
    interestRate: "2% (per annum)",
    feeType: "Fixed",
    feeAmount: "₦10 (per transaction)",
    overdraftLimit: "₦40,000",
    status: "Active",
  },
  {
    id: "6",
    productName: "Shield & Crow",
    accountType: "Savings",
    interestType: "Fixed",
    interestRate: "2% (per annum)",
    feeType: "Fixed",
    feeAmount: "₦10 (per transaction)",
    overdraftLimit: "₦40,000",
    status: "Inactive",
  },
];

export default function ProductTable() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [statusFilter] = useState<string | null>(null);
  
  // Edit state management
  const [editingProduct, setEditingProduct] = useState<TableProduct | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit handlers
  const handleEdit = (product: TableProduct) => {
    setEditingProduct(product);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setIsEditing(false);
  };

  // Define columns
  const columns: ColumnDef<TableProduct>[] = [
    {
      accessorKey: "productName",
      header: "PRODUCT NAME",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 p-2 text-primary">
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
          </span>
          <span>{row.getValue("productName")}</span>
        </div>
      ),
    },
    {
      accessorKey: "accountType",
      header: "ACCOUNT TYPE",
    },
    {
      accessorKey: "interestType",
      header: "INTEREST TYPE",
    },
    {
      accessorKey: "interestRate",
      header: "INTEREST RATE",
    },
    {
      accessorKey: "feeType",
      header: "FEE TYPE",
    },
    {
      accessorKey: "feeAmount",
      header: "FEE AMOUNT/RATE",
    },
    {
      accessorKey: "overdraftLimit",
      header: "OVERDRAFT LIMIT",
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={
              status === "Active"
                ? "bg-green-100 dark:bg-green-500/10 dark:text-green-500 dark:hover:bg-green-500/10 text-green-800 hover:bg-green-100"
                : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/10"
            }
          >
            {status}
          </Badge>
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
                onClick={() => router.push(`manage-product/${row.original.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEdit(row.original)}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => console.log("Delete", row.original.id)}
                className="text-red-600"
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

  // Apply status filter if set
  const filteredData = statusFilter
    ? data.filter((product) => product.status === statusFilter)
    : data;

  const table = useReactTable({
    data: filteredData,
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="relative w-72 flex items-center">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={
              (table.getColumn("productName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("productName")?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
          <Button className="bg-primary hover:bg-primary" asChild>
            <Link href={"manage-product/create-product"}>
              <div className="flex items-center">
                <Plus className="md:mr-2 h-4 w-4" />
                <span className="hidden md:block">Create New Product</span>
              </div>
            </Link>
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
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
          {table.getFilteredRowModel().rows.length} product(s)
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information below.
            </DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    defaultValue={editingProduct.productName}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Input
                    id="accountType"
                    defaultValue={editingProduct.accountType}
                    placeholder="Enter account type"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate</Label>
                  <Input
                    id="interestRate"
                    defaultValue={editingProduct.interestRate}
                    placeholder="Enter interest rate"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feeAmount">Fee Amount</Label>
                  <Input
                    id="feeAmount"
                    defaultValue={editingProduct.feeAmount}
                    placeholder="Enter fee amount"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="overdraftLimit">Overdraft Limit</Label>
                  <Input
                    id="overdraftLimit"
                    defaultValue={editingProduct.overdraftLimit}
                    placeholder="Enter overdraft limit"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    defaultValue={editingProduct.status}
                    placeholder="Active/Inactive"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseEdit}>
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    // For now, just show a placeholder with loading state
                    setIsUpdating(true);
                    try {
                      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
                      toast.success("Edit functionality will be implemented when we get the get-products endpoint");
                      handleCloseEdit();
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Product"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
