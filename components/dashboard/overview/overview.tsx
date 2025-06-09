"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Eye } from "lucide-react"

export default function DashboardOverview() {
  // Chart data
  const verificationData = [
    { name: "Individual", value: 60, count: 210 },
    { name: "Business", value: 40, count: 140 },
  ]

  const totalActiveAccountData = [
    { name: "Savings", value: 19000, color: "#f59e0b" },
    { name: "Current", value: 11000, color: "#8b5cf6" },
  ]

  const newAccountData = [
    { name: "Savings", value: 400, color: "#f59e0b" },
    { name: "Current", value: 300, color: "#8b5cf6" },
  ]

  const accountStatusData = [
    { name: "Total Blocked", value: 2200, color: "#ef4444" },
    { name: "Total Frozen", value: 1250, color: "#06b6d4" },
    { name: "Total Closed", value: 1500, color: "#8b5cf6" },
  ]

  const revenueExpenseData = [
    { name: "Total Revenue", value: 200050200, color: "#10b981" },
    { name: "Total Expenses", value: 120023800, color: "#f59e0b" },
  ]

  const customerGrowthData = [
    { month: "Feb", individual: 8000, business: 5000, total: 13000 },
    { month: "Mar", individual: 12000, business: 7000, total: 19000 },
    { month: "Apr", individual: 15000, business: 8500, total: 23500 },
    { month: "May", individual: 18000, business: 6000, total: 24000 },
    { month: "Jun", individual: 23230, business: 9000, total: 32230 },
    { month: "Jul", individual: 20000, business: 8000, total: 28000 },
    { month: "Aug", individual: 22000, business: 9500, total: 31500 },
  ]

  const transactions = [
    { type: "Send", recipient: "Samuel ikechukwu", amount: -13000000, icon: "↗" },
    { type: "Received", recipient: "Mary Johnson", amount: 8000000, icon: "↙" },
    { type: "Received", recipient: "Mary Johnson", amount: 6000000, icon: "↙" },
    { type: "Received", recipient: "Mary Johnson", amount: 3000000, icon: "↙" },
    { type: "Send", recipient: "Samuel ikechukwu", amount: -1500000, icon: "↗" },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // const formatNumber = (num: number) => {
  //   return new Intl.NumberFormat().format(num)
  // }

  return (
    <div className="">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* User Statistics & Pending Verification Combined */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">User Statistics</CardTitle>
              <Select defaultValue="today">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Users and New Users Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">Active Users</span>
                    </div>
                    <div className="text-3xl font-bold">3,000</div>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +11.02%
                    </div>
                  </CardContent>
                </Card>

                <Card className="">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">New Users</span>
                    </div>
                    <div className="text-3xl font-bold">35</div>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      +4.05%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Pending Verification */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Users Pending Verification</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <ChartContainer
                      config={{
                        individual: { label: "Individual", color: "#f59e0b" },
                        business: { label: "Business", color: "#8b5cf6" },
                      }}
                      className="h-48 w-48"
                    >
                      <PieChart>
                        <Pie
                          data={verificationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                        >
                          <Cell fill="#f59e0b" />
                          <Cell fill="#8b5cf6" />
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Users className="w-6 h-6 text-muted-foreground mb-1" />
                      <div className="text-2xl font-bold">350</div>
                      <div className="text-sm text-muted-foreground">Users</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm">Individual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">60%</span>
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Business</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">40%</span>
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
              <Button variant="outline" size="sm" className="text-primary hover:bg-background ">
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary text-sm">{transaction.icon}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {transaction.type} {transaction.type === "Send" ? "to" : "from"} {transaction.recipient}
                        </div>
                      </div>
                    </div>
                    <div className={`font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount > 0 ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 gap-4">
            <Card className="bg-background">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Total Assets</span>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">₦350,100,000,000</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-primary hover:bg-background ">
                    Show more
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Total Liabilities</span>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">₦205,100,000,000</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-primary hover:bg-background ">
                    Show more
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Net Income</span>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">₦205,100,000,000</div>
                  </div>
                  <Button variant="outline" size="sm" className="text-primary hover:bg-background ">
                    Show more
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue & Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Revenue & Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <ChartContainer
                  config={{
                    revenue: { label: "Total Revenue", color: "#10b981" },
                    expenses: { label: "Total Expenses", color: "#f59e0b" },
                  }}
                  className="h-48 w-48"
                >
                  <PieChart>
                    <Pie data={revenueExpenseData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {revenueExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Total Revenue</span>
                  </div>
                  <span className="font-medium">₦200,050,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm">Total Expenses</span>
                  </div>
                  <span className="font-medium">₦120,023,800</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Metrics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Account Metrics</CardTitle>
              <Select defaultValue="today">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-2">Total Active Account</div>
                    <div className="relative mx-auto w-32 h-32 mb-2">
                      <ChartContainer
                        config={{
                          savings: { label: "Savings", color: "#f59e0b" },
                          current: { label: "Current", color: "#8b5cf6" },
                        }}
                        className="h-32 w-32"
                      >
                        <PieChart>
                          <Pie
                            data={totalActiveAccountData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            dataKey="value"
                          >
                            {totalActiveAccountData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold">30000</div>
                        <div className="text-xs text-muted-foreground">Accounts</div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>Savings</span>
                        </div>
                        <span>19000</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Current</span>
                        </div>
                        <span>11000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-2">New Account Created</div>
                    <div className="relative mx-auto w-32 h-32 mb-2">
                      <ChartContainer
                        config={{
                          savings: { label: "Savings", color: "#f59e0b" },
                          current: { label: "Current", color: "#8b5cf6" },
                        }}
                        className="h-32 w-32"
                      >
                        <PieChart>
                          <Pie
                            data={newAccountData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={55}
                            dataKey="value"
                          >
                            {newAccountData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold">700</div>
                        <div className="text-xs text-muted-foreground">Accounts</div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>Savings</span>
                        </div>
                        <span>400</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Current</span>
                        </div>
                        <span>300</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <ChartContainer
                    config={{
                      blocked: { label: "Total Blocked", color: "#ef4444" },
                      frozen: { label: "Total Frozen", color: "#06b6d4" },
                      closed: { label: "Total Closed", color: "#8b5cf6" },
                    }}
                    className="h-32 w-32"
                  >
                    <PieChart>
                      <Pie data={accountStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value">
                        {accountStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold">5000</div>
                    <div className="text-xs text-muted-foreground">Accounts</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Total Blocked</span>
                  </div>
                  <span className="font-medium">2200</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span>Total Frozen</span>
                  </div>
                  <span className="font-medium">1250</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Total Closed</span>
                  </div>
                  <span className="font-medium">1500</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Total Transactions</CardTitle>
              <Select defaultValue="today">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">₦135,000,000</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs">₦</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Total Deposit</span>
                  </div>
                  <span className="font-medium">₦61,000,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs">₦</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Total Withdrawal</span>
                  </div>
                  <span className="font-medium">₦43,000,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs">₦</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Total Bills Payment</span>
                  </div>
                  <span className="font-medium">₦31,000,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Customers Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-lg font-medium text-primary">Total Customers</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Individual
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Business
                  </Button>
                </div>
              </div>
              <Select defaultValue="6months">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">6 months</SelectItem>
                  <SelectItem value="1year">1 year</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  individual: { label: "Individual", color: "#f59e0b" },
                  business: { label: "Business", color: "#8b5cf6" },
                }}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={customerGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                      tickFormatter={(value) => `${value / 1000}K`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="individual"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#f59e0b" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="business"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
