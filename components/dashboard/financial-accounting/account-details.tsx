"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGeneralLedgersByCustomerIdAction } from "@/server/financial-accounting/account-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  productTypeId: string;
  currencyCode: string;
  subLedgerId: string;
  branchId: string;
  balance: number;
  balanceDate: string;
  customerId: string;
  subAccounts: string[];
}

interface GeneralLedgerDetails {
  id: string;
  branchId: string;
  ledgerTypeId: string;
  parentAccountId: string;
  ledgerName: string;
  ledgerCode: string;
  currencyCode: string;
  balance: number;
  controlAccount: boolean;
  postingRule: number;
  subAccounts: string[];
  customerAccounts: CustomerAccount[];
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  date: string;
}

interface AccountDetailsPageProps {
  accountId: string;
}

export default function AccountDetailsPage({ accountId }: AccountDetailsPageProps) {
  const router = useRouter();
  const [accountDetails, setAccountDetails] = useState<GeneralLedgerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);

  // Sample transactions data - in real app this would come from API
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      description: "Send to Samuel Ikechukwu",
      amount: -3500.00,
      type: "debit",
      date: "2025-08-12"
    },
    {
      id: "2", 
      description: "Received from Mary Johnson",
      amount: 100000.00,
      type: "credit",
      date: "2025-08-11"
    },
    {
      id: "3",
      description: "Send to Samuel Ikechukwu", 
      amount: -3500.00,
      type: "debit",
      date: "2025-08-10"
    },
    {
      id: "4",
      description: "Send to Samuel Ikechukwu",
      amount: -3500.00, 
      type: "debit",
      date: "2025-08-09"
    },
    {
      id: "5",
      description: "Send to Samuel Ikechukwu",
      amount: -3500.00,
      type: "debit", 
      date: "2025-08-08"
    },
    {
      id: "6",
      description: "Send to Samuel Ikechukwu",
      amount: -3500.00,
      type: "debit",
      date: "2025-08-07"
    }
  ]);

  useEffect(() => {
    const loadAccountDetails = async () => {
      try {
        setIsLoading(true);
        // Note: The API endpoint expects customerId but we're using the accountId from the route
        // In a real scenario, you might need to map accountId to customerId or use a different endpoint
        const result = await getGeneralLedgersByCustomerIdAction({ customerId: accountId });
        
        if (result?.data?.success && result.data.data && result.data.data.length > 0) {
          setAccountDetails(result.data.data[0]);
          if (result.data.data[0].customerAccounts.length > 0) {
            setSelectedAccount(result.data.data[0].customerAccounts[0]);
          }
        } else {
          toast.error("Failed to load account details");
        }
      } catch (error) {
        console.error("Error loading account details:", error);
        toast.error("Failed to load account details");
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountDetails();
  }, [accountId]);

  const formatCurrency = (amount: number, currency: string = "N") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!accountDetails) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/financial-accounting/chart-of-account")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Account Details</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Account not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/financial-accounting/chart-of-account")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Account Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Cards and Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary text-primary-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(accountDetails.balance, accountDetails.currencyCode)}
                </div>
                <p className="text-xs opacity-80 mt-1">Amount</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary text-secondary-foreground">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {formatCurrency(1805000.25, "N")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Amount</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        transaction.type === "credit" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {transaction.type === "credit" ? "+" : "-"}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === "credit" ? "text-primary" : "text-destructive"
                    }`}>
                      {transaction.type === "credit" ? "+" : ""}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Account Info */}
        <div className="space-y-4">
          {selectedAccount && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">
                    $
                  </div>
                  <span className="font-medium">Customer Deposit</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Branch</label>
                  <p className="font-medium">Lekki</p>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Ledger Code</label>
                  <p className="font-medium">{accountDetails.ledgerCode}</p>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Parent Ledger</label>
                  <p className="font-medium">Cash Vault</p>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Ledger Type</label>
                  <p className="font-medium">Asset</p>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Currency</label>
                  <p className="font-medium">{accountDetails.currencyCode}</p>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Current Balance</label>
                  <p className="font-medium">{formatCurrency(0)}</p>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Control</label>
                  <Badge variant={accountDetails.controlAccount ? "default" : "secondary"}>
                    {accountDetails.controlAccount ? "True" : "False"}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Posting Rule</label>
                  <Badge variant="outline">
                    {accountDetails.postingRule === 1 ? "Both" : accountDetails.postingRule === 2 ? "Credit" : "Debit"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
