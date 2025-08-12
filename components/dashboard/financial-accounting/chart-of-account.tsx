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
import { getGeneralLedgerAction, getLedgerTypesAction, createGeneralLedgerAction, getCurrenciesAction, type GeneralLedger, type LedgerType, type Currency } from "@/server/financial-accounting/account-types";
import { fetchBranchesAction, type Branch } from "@/server/general/fetch-data";
import { ChartOfAccountSkeleton } from "./chart-of-account-skeleton";
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
import { Switch } from "@/components/ui/switch";
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
  Briefcase,
  RefreshCw,
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
import { Skeleton } from "@/components/ui/skeleton";

// Define the Account type based on GeneralLedger with resolved names
type Account = {
  id: string;
  ledgerName: string;
  ledgerCode: string;
  currencyCode: string;
  balance: number;
  controlAccount: boolean;
  postingRule: number;
  branchId: string;
  branchName: string; // Resolved from branchId
  ledgerTypeId: string;
  ledgerTypeName: string; // Resolved from ledgerTypeId
  parentAccountId: string;
  parentAccountName: string; // Resolved from parentAccountId
  subAccounts: string[];
};

export default function AccountTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [ledgerTypes, setLedgerTypes] = useState<LedgerType[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  
  // Individual loading states for form data
  const [isBranchesLoading, setIsBranchesLoading] = useState(true);
  const [isLedgerTypesLoading, setIsLedgerTypesLoading] = useState(true);
  const [isCurrenciesLoading, setIsCurrenciesLoading] = useState(true);

  // Load general ledger on component mount
  useEffect(() => {
    loadGeneralLedger();
  }, []);

  // Load general ledger function
  const loadGeneralLedger = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all required data in parallel
      const [generalLedgerResult, branchesResult, ledgerTypesResult, currenciesResult] = await Promise.all([
        getGeneralLedgerAction({}),
        fetchBranchesAction(),
        getLedgerTypesAction({}),
        getCurrenciesAction({})
      ]);
      
      if (generalLedgerResult?.data?.success && generalLedgerResult.data.data) {
        // Store branches and ledger types for later use
        if (branchesResult?.data?.success && branchesResult.data.data) {
          setBranches(branchesResult.data.data);
        }
        setIsBranchesLoading(false);
        
        if (ledgerTypesResult?.data?.success && ledgerTypesResult.data.data) {
          setLedgerTypes(ledgerTypesResult.data.data);
        }
        setIsLedgerTypesLoading(false);

        if (currenciesResult?.data?.success && currenciesResult.data.data) {
          setCurrencies(currenciesResult.data.data);
        }
        setIsCurrenciesLoading(false);

        // Create lookup maps for faster resolution - handle different return structures
        const branchData = branchesResult?.data?.success && branchesResult.data.data ? branchesResult.data.data : [];
        const branchMap = new Map(
          branchData.map((branch: Branch) => [branch.id, branch.name])
        );
        
        const ledgerTypeData = ledgerTypesResult?.data?.success && ledgerTypesResult.data.data ? ledgerTypesResult.data.data : [];
        const ledgerTypeMap = new Map(
          ledgerTypeData.map((type: LedgerType) => [type.id, type.name])
        );

        // Transform GeneralLedger to Account format with resolved names
        const transformedAccounts: Account[] = generalLedgerResult.data.data.map((ledger: GeneralLedger) => ({
          id: ledger.id,
          ledgerName: ledger.ledgerName,
          ledgerCode: ledger.ledgerCode,
          currencyCode: ledger.currencyCode,
          balance: ledger.balance,
          controlAccount: ledger.controlAccount,
          postingRule: ledger.postingRule,
          branchId: ledger.branchId,
          branchName: branchMap.get(ledger.branchId) || 'Unknown Branch',
          ledgerTypeId: ledger.ledgerTypeId,
          ledgerTypeName: ledgerTypeMap.get(ledger.ledgerTypeId) || 'Unknown Type',
          parentAccountId: ledger.parentAccountId,
          parentAccountName: '', // Will be resolved in the next step
          subAccounts: ledger.subAccounts,
        }));

        // Create account map for parent account resolution
        const accountMap = new Map(
          transformedAccounts.map((account: Account) => [account.id, account.ledgerName])
        );

        // Resolve parent account names
        transformedAccounts.forEach((account: Account) => {
          if (account.parentAccountId) {
            account.parentAccountName = accountMap.get(account.parentAccountId) || 'Unknown Parent';
          } else {
            account.parentAccountName = '';
          }
        });

        setAccounts(transformedAccounts);
      } else {
        toast.error("Failed to load general ledger");
      }
    } catch (error) {
      console.error("Error loading general ledger:", error);
      toast.error("Failed to load general ledger");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      // Ensure individual loading states are reset even on error
      setIsBranchesLoading(false);
      setIsLedgerTypesLoading(false);
      setIsCurrenciesLoading(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadGeneralLedger();
  };

  // Individual reload functions for form data
  const reloadBranches = async () => {
    try {
      setIsBranchesLoading(true);
      const result = await fetchBranchesAction();
      if (result?.data?.success && result.data.data) {
        setBranches(result.data.data);
        toast.success("Branches refreshed successfully");
      } else {
        toast.error("Failed to refresh branches");
      }
    } catch (error) {
      console.error("Error reloading branches:", error);
      toast.error("Failed to refresh branches");
    } finally {
      setIsBranchesLoading(false);
    }
  };

  const reloadLedgerTypes = async () => {
    try {
      setIsLedgerTypesLoading(true);
      const result = await getLedgerTypesAction({});
      if (result?.data?.success && result.data.data) {
        setLedgerTypes(result.data.data);
        toast.success("Ledger types refreshed successfully");
      } else {
        toast.error("Failed to refresh ledger types");
      }
    } catch (error) {
      console.error("Error reloading ledger types:", error);
      toast.error("Failed to refresh ledger types");
    } finally {
      setIsLedgerTypesLoading(false);
    }
  };

  const reloadCurrencies = async () => {
    try {
      setIsCurrenciesLoading(true);
      const result = await getCurrenciesAction({});
      if (result?.data?.success && result.data.data) {
        setCurrencies(result.data.data);
        toast.success("Currencies refreshed successfully");
      } else {
        toast.error("Failed to refresh currencies");
      }
    } catch (error) {
      console.error("Error reloading currencies:", error);
      toast.error("Failed to refresh currencies");
    } finally {
      setIsCurrenciesLoading(false);
    }
  };

  // Get unique values for filter options (for future use)
  // const currencyCodes = [...new Set(accounts.map((item) => item.currencyCode))];
  // const postingRules = [...new Set(accounts.map((item) => item.postingRule.toString()))];

  // Filter form schema
  const filterFormSchema = z.object({
    ledgerTypeId: z.string().optional(),
    branchId: z.string().optional(),
    controlAccount: z.string().optional(),
    postingRule: z.string().optional(),
  });

  // Create Ledger form schema
  const createLedgerFormSchema = z.object({
    ledgerName: z.string().min(1, { message: "Ledger name is required" }),
    ledgerCode: z.string().min(1, { message: "Ledger code is required" }),
    currencyId: z.string().min(1, { message: "Currency is required" }),
    controlAccount: z.boolean(),
    postingRule: z.string().refine((val) => val === "1" || val === "2", { message: "Posting rule must be 1 (Debit) or 2 (Credit)" }),
    branchId: z.string().min(1, { message: "Branch is required" }),
    ledgerTypeId: z.string().min(1, { message: "Ledger type is required" }),
    parentAccountId: z.string().optional(),
    opening_balance: z.number().default(0),
  });

  // Filter form
  const filterForm = useForm<z.infer<typeof filterFormSchema>>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      ledgerTypeId: "",
      branchId: "",
      controlAccount: "",
      postingRule: "",
    },
  });

  // Create Ledger form
  const createLedgerForm = useForm<z.infer<typeof createLedgerFormSchema>>({
    resolver: zodResolver(createLedgerFormSchema),
    defaultValues: {
      ledgerName: "",
      ledgerCode: "",
      currencyId: "",
      controlAccount: false,
      postingRule: "1",
      branchId: "",
      ledgerTypeId: "",
      parentAccountId: "none",
      opening_balance: 0,
    },
  });

  // Apply filters function
  const applyFilters = (values: z.infer<typeof filterFormSchema>) => {
    if (values.ledgerTypeId && values.ledgerTypeId !== "all-ledger-types") {
      table.getColumn("ledgerTypeName")?.setFilterValue(values.ledgerTypeId);
    } else {
      table.getColumn("ledgerTypeName")?.setFilterValue("");
    }
    if (values.branchId && values.branchId !== "all-branches") {
      table.getColumn("branchName")?.setFilterValue(values.branchId);
    } else {
      table.getColumn("branchName")?.setFilterValue("");
    }
    if (values.controlAccount && values.controlAccount !== "all-control-accounts") {
      table.getColumn("controlAccount")?.setFilterValue(values.controlAccount);
    } else {
      table.getColumn("controlAccount")?.setFilterValue("");
    }
    if (values.postingRule && values.postingRule !== "all-posting-rules") {
      table.getColumn("postingRule")?.setFilterValue(values.postingRule);
    } else {
      table.getColumn("postingRule")?.setFilterValue("");
    }
  };

  // Clear filters function
  const clearFilters = () => {
    filterForm.reset();
    table.resetColumnFilters();
  };

  // Create Ledger function
  const onCreateLedger = async (values: z.infer<typeof createLedgerFormSchema>) => {
    // Show loading toast
    const loadingToast = toast.loading("Creating ledger...", {
      description: "Please wait while we create your new ledger account."
    });

    try {
      setIsCreating(true);
      console.log("Creating ledger with values:", values);

      // Transform the form data to match API expectations
      const apiData = {
        ...values,
        postingRule: parseInt(values.postingRule), // Convert string to number for API
        parentAccountId: values.parentAccountId === "none" ? undefined : values.parentAccountId, // Handle "none" case
      };

      // Call the API
      const result = await createGeneralLedgerAction(apiData);
      
      if (result?.data?.success) {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(`Ledger "${values.ledgerName}" created successfully!`, {
          description: `Ledger code: ${values.ledgerCode}`,
          duration: 4000,
        });
        
        createLedgerForm.reset();
        setIsSheetOpen(false);
        // Refresh the data
        loadGeneralLedger();
      } else {
        // Dismiss loading toast and show error
        toast.dismiss(loadingToast);
        toast.error("Failed to create ledger", {
          description: result?.data?.message || "An unexpected error occurred. Please try again.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error creating ledger:", error);
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      toast.error("Failed to create ledger", {
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle sheet open/close with informational toast
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (open) {
      toast.info("Create New Ledger", {
        description: "Fill in the required information to create a new ledger account.",
        duration: 3000,
      });
    }
  };

  // Define columns
  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: "ledgerTypeName",
      header: "LEDGER TYPE",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 p-2 text-primary">
            <Briefcase className="h-4 w-4" />
          </span>
          <span>{row.getValue("ledgerTypeName")}</span>
        </div>
      ),
    },
    {
      accessorKey: "ledgerName",
      header: "LEDGER NAME",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("ledgerName")}</span>
        </div>
      ),
    },
    {
      accessorKey: "ledgerCode",
      header: "LEDGER CODE",
    },
    {
      accessorKey: "branchName",
      header: "BRANCH",
    },
    {
      accessorKey: "currencyCode",
      header: "CURRENCY",
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "balance",
      header: "BALANCE",
      cell: ({ row }) => {
        const balance = row.getValue("balance") as number;
        const currency = row.original.currencyCode;
        return `${currency} ${balance.toLocaleString()}`;
      },
    },
    {
      accessorKey: "controlAccount",
      header: "CONTROL ACCOUNT",
      cell: ({ row }) => {
        const isControl = row.getValue("controlAccount") as boolean;
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isControl 
              ? "bg-primary/10 text-primary" 
              : "bg-muted text-muted-foreground"
          }`}>
            {isControl ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
            {isControl ? "Yes" : "No"}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === (value === "true");
      },
    },
    {
      accessorKey: "postingRule",
      header: "POSTING RULE",
      cell: ({ row }) => {
        const rule = row.getValue("postingRule") as number;
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            rule === 1 
              ? "bg-secondary text-secondary-foreground" 
              : "bg-accent text-accent-foreground"
          }`}>
            {rule === 1 ? "Debit" : "Credit"}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        const postingRule = row.getValue(id) as number;
        return value === "" || postingRule.toString() === value;
      },
    },
    {
      accessorKey: "parentAccountName",
      header: "PARENT ACCOUNT",
      cell: ({ row }) => {
        const parentName = row.getValue("parentAccountName") as string;
        return parentName || <span className="text-muted-foreground italic">None</span>;
      },
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
      body: accounts.map((row) =>
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
  const csvData = accounts.map((row) => {
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
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={
                (table.getColumn("ledgerName")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("ledgerName")?.setFilterValue(event.target.value)
              }
              className="pl-8"
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
        <div className="flex md:ml-0 ml-2 items-center gap-2">
                      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
              <Button className="bg-primary text-wrap text-white hover:bg-primary">
                <Plus className="md:mr-2 h-4 w-4" />
                <span className="hidden md:block text-nowrap">Create Ledger</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Create Ledger</SheetTitle>
              </SheetHeader>
              <Form {...createLedgerForm}>
                <form
                  onSubmit={createLedgerForm.handleSubmit(onCreateLedger)}
                  className="space-y-4 py-4"
                >
                  <FormField
                    control={createLedgerForm.control}
                    name="ledgerTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          Ledger Type
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={reloadLedgerTypes}
                            disabled={isLedgerTypesLoading}
                            className="h-6 w-6 p-0"
                          >
                            <RefreshCw className={`h-3 w-3 ${isLedgerTypesLoading ? "animate-spin" : ""}`} />
                          </Button>
                        </FormLabel>
                        {isLedgerTypesLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ledger type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ledgerTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createLedgerForm.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          Branch
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={reloadBranches}
                            disabled={isBranchesLoading}
                            className="h-6 w-6 p-0"
                          >
                            <RefreshCw className={`h-3 w-3 ${isBranchesLoading ? "animate-spin" : ""}`} />
                          </Button>
                        </FormLabel>
                        {isBranchesLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
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
                              {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id.toString()}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createLedgerForm.control}
                    name="parentAccountId"
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
                            <SelectItem value="none">None</SelectItem>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.ledgerName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createLedgerForm.control}
                    name="ledgerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ledger Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ledger name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createLedgerForm.control}
                    name="ledgerCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ledger Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter ledger code" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createLedgerForm.control}
                    name="currencyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between">
                          Currency
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={reloadCurrencies}
                            disabled={isCurrenciesLoading}
                            className="h-6 w-6 p-0"
                          >
                            <RefreshCw className={`h-3 w-3 ${isCurrenciesLoading ? "animate-spin" : ""}`} />
                          </Button>
                        </FormLabel>
                        {isCurrenciesLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
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
                              {currencies.map((currency) => (
                                <SelectItem key={currency.id} value={currency.id}>
                                  {currency.name} ({currency.currencyCode})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createLedgerForm.control}
                    name="postingRule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posting Rule</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select posting rule" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Debit</SelectItem>
                            <SelectItem value="2">Credit</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createLedgerForm.control}
                    name="opening_balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Balance</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createLedgerForm.control}
                    name="controlAccount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Control Account</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Mark this as a control account
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-primary text-white hover:bg-primary"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Creating Ledger...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Ledger
                        </>
                      )}
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
                      name="ledgerTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ledger Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ledger type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all-ledger-types">
                                All Ledger Types
                              </SelectItem>
                              {ledgerTypes.map((type) => (
                                <SelectItem key={type.id} value={type.name}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filterForm.control}
                      name="branchId"
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
                              <SelectItem value="all-branches">
                                All Branches
                              </SelectItem>
                              {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.name}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filterForm.control}
                      name="controlAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Control Account</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select control account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all-control-accounts">
                                All Accounts
                              </SelectItem>
                              <SelectItem value="true">
                                Control Accounts Only
                              </SelectItem>
                              <SelectItem value="false">
                                Non-Control Accounts Only
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={filterForm.control}
                      name="postingRule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posting Rule</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select posting rule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all-posting-rules">
                                All Rules
                              </SelectItem>
                              <SelectItem value="1">
                                Debit Only
                              </SelectItem>
                              <SelectItem value="2">
                                Credit Only
                              </SelectItem>
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
            {isLoading ? (
              <ChartOfAccountSkeleton rows={5} />
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
                  No general ledger accounts found.
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
