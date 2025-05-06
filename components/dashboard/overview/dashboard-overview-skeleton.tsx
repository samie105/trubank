import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recent Transactions Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Recent Transactions</CardTitle>
          <Skeleton className="h-9 w-20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TransactionItemSkeleton />
            <TransactionItemSkeleton />
            <TransactionItemSkeleton />
          </div>
        </CardContent>
      </Card>

      {/* Transaction Totals Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Transaction Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransactionTotalSkeleton />
          <TransactionTotalSkeleton />
          <TransactionTotalSkeleton />
        </CardContent>
      </Card>

      {/* Financial Metrics Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Financial Metrics</CardTitle>
          <Skeleton className="h-9 w-9 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </CardContent>
      </Card>

      {/* Customer Growth Chart Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl">Total Customers</CardTitle>
            <Skeleton className="h-10 w-[300px]" />
          </div>
          <Skeleton className="h-10 w-[130px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      {/* Revenue & Expenses Skeleton */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Revenue & Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <Skeleton className="w-[180px] h-[180px] rounded-full" />
          <div className="space-y-4 flex-1 w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24 ml-auto" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24 ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Statistics Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">User Statistics</CardTitle>
          <Skeleton className="h-10 w-[100px]" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Account Metrics Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Account Metrics</CardTitle>
          <Skeleton className="h-10 w-[100px]" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="w-[120px] h-[120px] rounded-full mb-2" />
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="w-[120px] h-[120px] rounded-full mb-2" />
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionItemSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-40 mb-1" />
      </div>
      <Skeleton className="h-5 w-28" />
    </div>
  )
}

function TransactionTotalSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-6 w-28" />
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-48" />
    </div>
  )
}
