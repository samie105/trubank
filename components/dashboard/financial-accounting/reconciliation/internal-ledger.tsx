"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronsUpDown, Check, ArrowLeftRight, CheckCircle, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { 
  getGeneralLedgerAction, 
  reconcileLedgersAction,
  getLedgerTypesAction,
  type GeneralLedger,
  type LedgerType,
  type ReconciliationTransaction
} from "@/server/financial-accounting/account-types";
import { fetchBranchesAction, type Branch } from "@/server/general/fetch-data";
import { Skeleton } from "@/components/ui/skeleton";

// Types - Use imported GeneralLedger from server
interface LedgerEntry {
  id: string;
  ledgerType: string;
  ledgerName: string;
  ledgerCode: string;
  branch: string;
  currency: string;
  balance: number;
  controlAccount: string;
  postingRule: string;
  parentAccount: string;
}

// Simple skeleton components
const ComboboxSkeleton = () => (
  <Skeleton className="h-10 w-full" />
);

const LedgerTableSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
);

// Simple empty state component
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EmptyState = ({ title, description, icon }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-8 space-y-3">
    {icon && <div className="text-muted-foreground">{icon}</div>}
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
  </div>
);

const EmptyLedgerState = () => (
  <EmptyState
    title="No Ledgers Available"
    description="No general ledgers found. Please ensure ledgers are configured in the system."
    icon={<ArrowLeftRight className="h-8 w-8 text-muted-foreground" />}
  />
);

export function InternalLedgerReconciliation() {
  // State for ledger data
  const [ledgers, setLedgers] = useState<GeneralLedger[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [ledgerTypes, setLedgerTypes] = useState<LedgerType[]>([]);
  const [isLoadingLedgers, setIsLoadingLedgers] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for selected ledgers
  const [selectedLedger1, setSelectedLedger1] = useState("");
  const [selectedLedger2, setSelectedLedger2] = useState("");
  
  // State for combobox controls
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  
  // State for ledger transaction data
  const [ledgerOneData, setLedgerOneData] = useState<LedgerEntry[]>([]);
  const [ledgerTwoData, setLedgerTwoData] = useState<LedgerEntry[]>([]);
  const [isLoadingLedger1, setIsLoadingLedger1] = useState(false);
  const [isLoadingLedger2, setIsLoadingLedger2] = useState(false);
  
  // State for reconciliation results
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationTransaction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Load all necessary data on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoadingLedgers(true);
        
        // Fetch all required data in parallel
        const [generalLedgerResult, branchesResult, ledgerTypesResult] = await Promise.all([
          getGeneralLedgerAction({}),
          fetchBranchesAction(),
          getLedgerTypesAction({})
        ]);

        // Store branches, ledger types, and currencies
        if (branchesResult?.data?.success && branchesResult.data.data) {
          setBranches(branchesResult.data.data);
        }
        
        if (ledgerTypesResult?.data?.success && ledgerTypesResult.data.data) {
          setLedgerTypes(ledgerTypesResult.data.data);
        }

        // Store the general ledger data
        if (generalLedgerResult?.data?.success && generalLedgerResult.data.data) {
          setLedgers(generalLedgerResult.data.data);
        } else {
          console.error("Failed to load general ledger");
          toast.error("Failed to load ledger data");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load ledger data");
      } finally {
        setIsLoadingLedgers(false);
      }
    };

    loadAllData();
  }, []);

  // Helper function to get names instead of IDs
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  const getLedgerTypeName = (ledgerTypeId: string) => {
    const ledgerType = ledgerTypes.find(lt => lt.id === ledgerTypeId);
    return ledgerType?.name || ledgerTypeId;
  };

  const getParentAccountName = (parentAccountId: string) => {
    const parentAccount = ledgers.find(l => l.id === parentAccountId);
    return parentAccount?.ledgerName || parentAccountId;
  };

  // Load ledger data when selected
  useEffect(() => {
    if (selectedLedger1) {
      setIsLoadingLedger1(true);
      // Create ledger data from the selected ledger
      const selectedLedger = ledgers.find(l => l.id === selectedLedger1);
      if (selectedLedger) {
        const ledgerData: LedgerEntry[] = [{
          id: selectedLedger.id,
          ledgerType: getLedgerTypeName(selectedLedger.ledgerTypeId),
          ledgerName: selectedLedger.ledgerName,
          ledgerCode: selectedLedger.ledgerCode,
          branch: getBranchName(selectedLedger.branchId),
          currency: selectedLedger.currencyCode,
          balance: selectedLedger.balance,
          controlAccount: selectedLedger.controlAccount ? "Yes" : "No",
          postingRule: selectedLedger.postingRule === 1 ? "Debit" : "Credit",
          parentAccount: getParentAccountName(selectedLedger.parentAccountId || selectedLedger.id)
        }];
        setLedgerOneData(ledgerData);
      }
      setIsLoadingLedger1(false);
    } else {
      setLedgerOneData([]);
    }
  }, [selectedLedger1, ledgers, branches, ledgerTypes]);

  useEffect(() => {
    if (selectedLedger2) {
      setIsLoadingLedger2(true);
      // Create ledger data from the selected ledger
      const selectedLedger = ledgers.find(l => l.id === selectedLedger2);
      if (selectedLedger) {
        const ledgerData: LedgerEntry[] = [{
          id: selectedLedger.id,
          ledgerType: getLedgerTypeName(selectedLedger.ledgerTypeId),
          ledgerName: selectedLedger.ledgerName,
          ledgerCode: selectedLedger.ledgerCode,
          branch: getBranchName(selectedLedger.branchId),
          currency: selectedLedger.currencyCode,
          balance: selectedLedger.balance,
          controlAccount: selectedLedger.controlAccount ? "Yes" : "No",
          postingRule: selectedLedger.postingRule === 1 ? "Debit" : "Credit",
          parentAccount: getParentAccountName(selectedLedger.parentAccountId || selectedLedger.id)
        }];
        setLedgerTwoData(ledgerData);
      }
      setIsLoadingLedger2(false);
    } else {
      setLedgerTwoData([]);
    }
  }, [selectedLedger2, ledgers, branches, ledgerTypes]);

  // Handle data reload
  const handleReloadData = async () => {
    try {
      setIsLoading(true);
      
      // Clear current data
      setLedgers([]);
      setBranches([]);
      setLedgerTypes([]);
      setLedgerOneData([]);
      setLedgerTwoData([]);
      setReconciliationResults([]);
      setShowResults(false);
      
      // Fetch all required data in parallel
      const [generalLedgerResult, branchesResult, ledgerTypesResult] = await Promise.all([
        getGeneralLedgerAction({}),
        fetchBranchesAction(),
        getLedgerTypesAction({})
      ]);

      // Store branches, ledger types, and currencies
      if (branchesResult?.data?.success && branchesResult.data.data) {
        setBranches(branchesResult.data.data);
      }
      
      if (ledgerTypesResult?.data?.success && ledgerTypesResult.data.data) {
        setLedgerTypes(ledgerTypesResult.data.data);
      }

      // Store the general ledger data
      if (generalLedgerResult?.data?.success && generalLedgerResult.data.data) {
        setLedgers(generalLedgerResult.data.data);
        toast.success("Ledger data reloaded successfully");
      } else {
        console.error("Failed to reload general ledger");
        toast.error("Failed to reload ledger data");
      }
    } catch (error) {
      console.error("Error reloading data:", error);
      toast.error("Failed to reload ledger data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reconciliation
  const handleReconcile = async () => {
    if (!selectedLedger1 || !selectedLedger2) {
      toast.error("Please select both ledgers before reconciling");
      return;
    }

    if (selectedLedger1 === selectedLedger2) {
      toast.error("Please select two different ledgers for reconciliation");
      return;
    }

    const ledger1 = ledgers.find(l => l.id === selectedLedger1);
    const ledger2 = ledgers.find(l => l.id === selectedLedger2);

    if (!ledger1 || !ledger2) {
      toast.error("Selected ledgers not found. Please refresh and try again.");
      return;
    }

    // Show loading toast
    const loadingToast = toast.loading(`Reconciling ${ledger1.ledgerName} with ${ledger2.ledgerName}...`);

    try {
      setIsReconciling(true);
      
      // Call the actual reconciliation API
      const result = await reconcileLedgersAction({
        firstAccount: ledger1.ledgerCode,
        secondAccount: ledger2.ledgerCode
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (result?.data?.success) {
        const transactions = result.data.data || [];
        const backendMessage = result.data.message || "Reconciliation completed";
        
        setReconciliationResults(transactions);
        setShowResults(true);
        
        // Use the backend message directly
        toast.success(backendMessage);
      } else {
        throw new Error(result?.data?.message || "Reconciliation failed");
      }

    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during reconciliation. Please try again.";
      toast.error(`Reconciliation Failed: ${errorMessage}`);
    } finally {
      setIsReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Internal Ledger Reconciliation</CardTitle>
              {/* <CardDescription className="text-sm">
                Compare and reconcile transactions between internal ledgers to ensure data consistency.
              </CardDescription> */}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReloadData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Responsive Ledger Selection with Reconcile Button */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            
            {/* First Ledger Combobox */}
            <div className="space-y-2">
              <label className="text-sm font-medium">First Ledger</label>
              {isLoadingLedgers ? (
                <ComboboxSkeleton />
              ) : (
                <Popover open={open1} onOpenChange={setOpen1}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open1}
                      className="w-full justify-between"
                      disabled={ledgers.length === 0}
                    >
                      {selectedLedger1
                        ? ledgers.find((ledger) => ledger.id === selectedLedger1)?.ledgerName
                        : ledgers.length === 0 
                          ? "No ledgers available"
                          : "Select first ledger..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search ledgers..." />
                      <CommandList>
                        {ledgers.length === 0 ? (
                          <div className="p-6 text-center">
                            <EmptyLedgerState />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No ledgers found.</CommandEmpty>
                            <CommandGroup>
                              {ledgers
                                .filter((ledger) => ledger.id !== selectedLedger2)
                                .map((ledger) => (
                                <CommandItem
                                  key={ledger.id}
                                  value={ledger.id}
                                  onSelect={(currentValue) => {
                                    setSelectedLedger1(currentValue === selectedLedger1 ? "" : currentValue);
                                    setOpen1(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedLedger1 === ledger.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {ledger.ledgerName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Second Ledger Combobox */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Second Ledger</label>
              {isLoadingLedgers ? (
                <ComboboxSkeleton />
              ) : (
                <Popover open={open2} onOpenChange={setOpen2}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open2}
                      className="w-full justify-between"
                      disabled={ledgers.length === 0}
                    >
                      {selectedLedger2
                        ? ledgers.find((ledger) => ledger.id === selectedLedger2)?.ledgerName
                        : ledgers.length === 0 
                          ? "No ledgers available"
                          : "Select second ledger..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search ledgers..." />
                      <CommandList>
                        {ledgers.length === 0 ? (
                          <div className="p-6 text-center">
                            <EmptyLedgerState />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No ledgers found.</CommandEmpty>
                            <CommandGroup>
                              {ledgers
                                .filter((ledger) => ledger.id !== selectedLedger1)
                                .map((ledger) => (
                                <CommandItem
                                  key={ledger.id}
                                  value={ledger.id}
                                  onSelect={(currentValue) => {
                                    setSelectedLedger2(currentValue === selectedLedger2 ? "" : currentValue);
                                    setOpen2(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedLedger2 === ledger.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {ledger.ledgerName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Reconcile Button - Aligned with Comboboxes */}
            <div className="lg:mt-0 mt-4">
              <Button
                onClick={handleReconcile}
                disabled={!selectedLedger1 || !selectedLedger2 || isReconciling}
                className="w-full flex items-center justify-center space-x-2"
                size="lg"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>{isReconciling ? "Reconciling..." : "Reconcile Ledgers"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Results Section - Only shows when there are actual results */}
      {showResults && reconciliationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Reconciliation Results</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Found {reconciliationResults.length} reconciliation transaction(s) between the selected ledgers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap text-sm">TRANSACTION REF</TableHead>
                    <TableHead className="whitespace-nowrap text-sm">DATE</TableHead>
                    <TableHead className="whitespace-nowrap text-sm">DESCRIPTION</TableHead>
                    <TableHead className="whitespace-nowrap text-sm">TYPE</TableHead>
                    <TableHead className="text-right whitespace-nowrap text-sm">AMOUNT</TableHead>
                    <TableHead className="whitespace-nowrap text-sm">STATUS</TableHead>
                    <TableHead className="whitespace-nowrap text-sm">FIRST ACCOUNT</TableHead>
                    <TableHead className="whitespace-nowrap text-sm">SECOND ACCOUNT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliationResults.map((transaction, index) => (
                    <TableRow key={`${transaction.transactionRef}-${index}`}>
                      <TableCell className="font-medium">{transaction.transactionRef}</TableCell>
                      <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {transaction.transactionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{transaction.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status.toLowerCase() === "success" ? "default" :
                            transaction.status.toLowerCase() === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.firstAccount}</TableCell>
                      <TableCell>{transaction.secondAccount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowResults(false)}
              >
                Close Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple No Results Message - No Borders, Clean Display */}
      {showResults && reconciliationResults.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Reconciliation Complete</h3>
          <p className="text-muted-foreground mb-4">
            No reconciliation transactions were found between the selected ledgers.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setShowResults(false)}
          >
            Close
          </Button>
        </div>
      )}

      {/* Ledger Data Tables - Show selected ledger information */}
      {(selectedLedger1 || selectedLedger2) && (
        <div className="space-y-6">
          {/* First Ledger Table */}
          {selectedLedger1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{ledgers.find(l => l.id === selectedLedger1)?.ledgerName || "First Ledger"}</span>
                  <Badge variant="outline">
                    {ledgerOneData.length} entry
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  Ledger details and current balance information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLedger1 ? (
                  <LedgerTableSkeleton />
                ) : ledgerOneData.length === 0 ? (
                  <div className="text-center py-8">
                    <EmptyState
                      title="No Ledger Data"
                      description="No data found for this ledger."
                      icon={<ArrowLeftRight className="h-8 w-8 text-muted-foreground" />}
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap text-sm">LEDGER TYPE</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">LEDGER NAME</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">LEDGER CODE</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">BRANCH</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">CURRENCY</TableHead>
                          <TableHead className="text-right whitespace-nowrap text-sm">BALANCE</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">CONTROL ACCOUNT</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">POSTING RULE</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">PARENT ACCOUNT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerOneData.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.ledgerType}</TableCell>
                            <TableCell>{entry.ledgerName}</TableCell>
                            <TableCell>{entry.ledgerCode}</TableCell>
                            <TableCell>{entry.branch}</TableCell>
                            <TableCell>{entry.currency}</TableCell>
                            <TableCell className="text-right">{entry.balance.toLocaleString()}</TableCell>
                            <TableCell>{entry.controlAccount}</TableCell>
                            <TableCell>
                              <Badge
                                variant={entry.postingRule === "Debit" ? "secondary" : "default"}
                              >
                                {entry.postingRule}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.parentAccount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Second Ledger Table */}
          {selectedLedger2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{ledgers.find(l => l.id === selectedLedger2)?.ledgerName || "Second Ledger"}</span>
                  <Badge variant="outline">
                    {ledgerTwoData.length} entry
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  Ledger details and current balance information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLedger2 ? (
                  <LedgerTableSkeleton />
                ) : ledgerTwoData.length === 0 ? (
                  <div className="text-center py-8">
                    <EmptyState
                      title="No Ledger Data"
                      description="No data found for this ledger."
                      icon={<ArrowLeftRight className="h-8 w-8 text-muted-foreground" />}
                    />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap text-sm">LEDGER TYPE</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">LEDGER NAME</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">LEDGER CODE</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">BRANCH</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">CURRENCY</TableHead>
                          <TableHead className="text-right whitespace-nowrap text-sm">BALANCE</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">CONTROL ACCOUNT</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">POSTING RULE</TableHead>
                          <TableHead className="whitespace-nowrap text-sm">PARENT ACCOUNT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerTwoData.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.ledgerType}</TableCell>
                            <TableCell>{entry.ledgerName}</TableCell>
                            <TableCell>{entry.ledgerCode}</TableCell>
                            <TableCell>{entry.branch}</TableCell>
                            <TableCell>{entry.currency}</TableCell>
                            <TableCell className="text-right">{entry.balance.toLocaleString()}</TableCell>
                            <TableCell>{entry.controlAccount}</TableCell>
                            <TableCell>
                              <Badge
                                variant={entry.postingRule === "Debit" ? "secondary" : "default"}
                              >
                                {entry.postingRule}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.parentAccount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default InternalLedgerReconciliation;
