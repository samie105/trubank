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
import { getLedgerTypesAction, type LedgerType } from "@/server/financial-accounting/account-types";
import { AccountTableSkeleton } from "./account-table-skeleton";
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
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

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

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start md:items-center justify-between py-4 gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="flex items-center gap-x-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search account types..."
                value={
                  (table.getColumn("accountType")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn("accountType")
                    ?.setFilterValue(event.target.value)
                }
                className="pl-8 w-full"
              />
            </div>
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
