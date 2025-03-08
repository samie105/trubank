"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample product data - in a real app, you would fetch this based on the ID
const productDetails = {
  id: "1",
  productName: "Shield & Grow",
  accountType: "Savings",
  status: "Active",
  interest: {
    type: "Fixed",
    rate: "2% (per annum)",
    calculationPeriod: "Monthly",
    compoundingFrequency: "Daily",
    effectiveDate: "01, September 2024",
    endDate: "None",
    triggerCondition: "≥ ₦5000",
    customerType: "All",
    specificCustomers: "None",
  },
  fee: {
    type: "Fixed",
    amount: "₦10 (per transaction)",
    applicationFrequency: "Per transaction",
    transactionType: "Deposit",
    effectiveDate: "01, September 2024",
    endDate: "None",
    triggerCondition: "Transaction Type: Deposit",
    customerType: "All",
    specificCustomers: "None",
  },
  overdraft: {
    name: "Overdraft Protection",
    limit: "₦40,000",
    customerType: "All",
    specificCustomer: "None",
  },
};

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const productId = params.id;
  console.log(productId);

  return (
    <div className="container mx-auto py-6 px-5">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="flex items-center gap-2"
          onClick={() =>
            router.push("/dashboard/financial-accounting/manage-product")
          }
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Product</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <svg
              width="24"
              height="24"
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
          <div className="flex flex-col">
            <CardTitle className="text-xl">
              {productDetails.productName}
            </CardTitle>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Account Type
                </span>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/30"
                >
                  {productDetails.accountType}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  className={
                    productDetails.status === "Active"
                      ? "bg-green-100 dark:bg-green-500/10 dark:text-green-500 dark:hover:bg-green-500/10 text-green-800 hover:bg-green-100 "
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/10                                                                                       "
                  }
                >
                  {productDetails.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-primary">Interest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Interest Type</p>
              <p className="font-medium">{productDetails.interest.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest Rate</p>
              <p className="font-medium">{productDetails.interest.rate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Interest Calculation Period
              </p>
              <p className="font-medium">
                {productDetails.interest.calculationPeriod}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Interest Compounding Frequency
              </p>
              <p className="font-medium">
                {productDetails.interest.compoundingFrequency}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Effective Date</p>
              <p className="font-medium">
                {productDetails.interest.effectiveDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{productDetails.interest.endDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trigger Condition</p>
              <p className="font-medium">
                {productDetails.interest.triggerCondition}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer type</p>
              <p className="font-medium">
                {productDetails.interest.customerType}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Specific Customers
              </p>
              <p className="font-medium">
                {productDetails.interest.specificCustomers}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-primary">Fee</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Fee Type</p>
              <p className="font-medium">{productDetails.fee.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fee Amount/Rate</p>
              <p className="font-medium">{productDetails.fee.amount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Fee Application Frequency
              </p>
              <p className="font-medium">
                {productDetails.fee.applicationFrequency}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaction Type</p>
              <p className="font-medium">
                {productDetails.fee.transactionType}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Effective Date</p>
              <p className="font-medium">{productDetails.fee.effectiveDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{productDetails.fee.endDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trigger Condition</p>
              <p className="font-medium">
                {productDetails.fee.triggerCondition}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer type</p>
              <p className="font-medium">{productDetails.fee.customerType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Specific Customers
              </p>
              <p className="font-medium">
                {productDetails.fee.specificCustomers}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Overdraft</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Overdraft Name</p>
              <p className="font-medium">{productDetails.overdraft.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdraft Limit</p>
              <p className="font-medium">{productDetails.overdraft.limit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Type</p>
              <p className="font-medium">
                {productDetails.overdraft.customerType}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Specific Customer</p>
              <p className="font-medium">
                {productDetails.overdraft.specificCustomer}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
