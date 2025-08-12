"use client";

import { useState, useEffect } from "react";
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
import { getLedgerTypesAction, createLedgerTypeAction, type LedgerType } from "@/server/financial-accounting/account-types";
import { AccountTableSkeleton } from "./account-table-skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Settings,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
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
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/dialog-2";

// Define the Account type based on LedgerType
type Account = {
  id: string;
  accountType: string;
};

export default function AccountTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [open, setOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [filterColumn, setFilterColumn] = useState("accountType");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load ledger types on component mount
  useEffect(() => {
    loadLedgerTypes();
  }, []);

  // Load ledger types function
  const loadLedgerTypes = async () => {
    try {
      setIsLoading(true);
      const result = await getLedgerTypesAction({});
      
      if (result?.data?.success && result.data.data) {
        // Transform LedgerType to Account format
        const transformedAccounts: Account[] = result.data.data.map((ledgerType: LedgerType) => ({
          id: ledgerType.id,
          accountType: ledgerType.name,
        }));
        setAccounts(transformedAccounts);
      } else {
        toast.error("Failed to load ledger types");
      }
    } catch (error) {
      console.error("Error loading ledger types:", error);
      toast.error("Failed to load ledger types");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLedgerTypes();
  };

  // Define columns
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: "accountType",
      header: "ACCOUNT TYPE",
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
          <span>{row.getValue("accountType")}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(row.original.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: accounts,
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

  // Handle creating a new account
  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      toast.error("Account name cannot be empty");
      return;
    }

    try {
      // Show loading toast
      toast.loading("Creating account type...");

      // Call the server action
      const result = await createLedgerTypeAction({ name: newAccountName.trim() });
      
      if (result?.data?.success) {
        // Reload the ledger types to get the updated list
        const updatedResult = await getLedgerTypesAction({});
        
        if (updatedResult?.data?.success && updatedResult.data.data) {
          const transformedAccounts: Account[] = updatedResult.data.data.map((ledgerType: LedgerType) => ({
            id: ledgerType.id,
            accountType: ledgerType.name,
          }));
          setAccounts(transformedAccounts);
        }

        setNewAccountName("");
        setOpen(false);

        // Dismiss loading toast and show success toast
        toast.dismiss();
        toast.success(`Account type "${newAccountName}" created successfully`);
      } else {
        toast.dismiss();
        toast.error(result?.data?.message || "Failed to create account type");
      }
    } catch (error) {
      console.error("Error creating account type:", error);
      toast.dismiss();
      toast.error("Failed to create account type");
    }
  };

  // Handle editing an account
  const handleEdit = (account: Account) => {
    setNewAccountName(account.accountType);
    toast("Edit mode", {
      description: `Editing ${account.accountType}`,
      action: {
        label: "Update",
        onClick: () => {
          toast.success(`${account.accountType} updated successfully`);
        },
      },
    });
  };

  // Handle deleting an account
  const handleDelete = (id: string) => {
    toast("Delete account?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => {
          // Remove account from the table
          setAccounts(accounts.filter((account) => account.id !== id));
          toast.success("Account deleted successfully");
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.info("Deletion cancelled");
        },
      },
    });
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterColumn(value);
    // Clear existing filters
    table.resetColumnFilters();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start md:items-center justify-between py-4 gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center gap-x-2">
            {" "}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={
                  (table.getColumn(filterColumn)?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn(filterColumn)
                    ?.setFilterValue(event.target.value)
                }
                className="pl-8 w-full"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-auto">
                  <Settings className=" h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter by</h4>
                  <Select
                    defaultValue={filterColumn}
                    onValueChange={handleFilterChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accountType">Account Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="ml-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
        <ResponsiveModal open={open} onOpenChange={setOpen}>
          <ResponsiveModalTrigger asChild>
            <Button className="bg-primary hover:bg-primary w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Create Account Type
            </Button>
          </ResponsiveModalTrigger>
          <ResponsiveModalContent className="sm:max-w-md">
            <ResponsiveModalHeader>
              <ResponsiveModalTitle className="text-center text-xl font-semibold">
                Create Account Type
              </ResponsiveModalTitle>
            </ResponsiveModalHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Expense Account"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary"
                onClick={handleCreateAccount}
              >
                Create account type
              </Button>
            </div>
          </ResponsiveModalContent>
        </ResponsiveModal>
      </div>
      <div className="rounded-md border overflow-x-auto">
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
            {isLoading ? (
              <AccountTableSkeleton rows={5} />
            ) : table.getRowModel().rows?.length ? (
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
                  No ledger types found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
