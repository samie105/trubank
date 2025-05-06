"use client"

import { useState } from "react"
import { ArrowRight, ArrowUpRight, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionItem } from "./transaction-item"
import { MetricCard } from "./metric-card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

// Sample data for charts
const customerData = [
  { name: "Feb", individual: 8000, business: 10000 },
  { name: "Mar", individual: 12000, business: 8000 },
  { name: "Apr", individual: 9000, business: 15000 },
  { name: "May", individual: 18000, business: 12000 },
  { name: "Jun", individual: 23230, business: 10000 },
  { name: "Jul", individual: 16000, business: 18000 },
  { name: "Aug", individual: 21000, business: 22000 },
]

const revenueData = [
  { name: "Revenue", value: 200050200 },
  { name: "Expenses", value: 120023800 },
]

const accountData = [
  { name: "Savings", value: 19000 },
  { name: "Current", value: 11000 },
]

const newAccountData = [
  { name: "Savings", value: 400 },
  { name: "Current", value: 300 },
]

const COLORS = ["#f97316", "#60a5fa"]

export function DashboardOverview() {
  const [timeframe, setTimeframe] = useState("6 months")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* First row - full width on all screens */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <TransactionItem type="received" name="Received from Mary Johnson" amount="+₦3,000,000.00" />
              <TransactionItem type="sent" name="Send to Samuel Ikechukwu" amount="-₦1,500,000.00" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-500">₦</span>
                  </div>
                  <span className="text-muted-foreground">Total Deposit</span>
                </div>
                <span className="font-semibold">₦61,000,000</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-500">₦</span>
                  </div>
                  <span className="text-muted-foreground">Total Withdrawal</span>
                </div>
                <span className="font-semibold">₦43,000,000</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-500">₦</span>
                  </div>
                  <span className="text-muted-foreground">Total Bills Payment</span>
                </div>
                <span className="font-semibold">₦31,000,000</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Financial Metrics</CardTitle>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <MetricCard title="Total Assets" value="₦350,100,000,000" showEye={true} showMore={true} />
          <MetricCard title="Total Liabilities" value="₦205,100,000,000" showEye={true} showMore={true} />
          <MetricCard title="Net Income" value="₦205,100,000,000" showEye={true} showMore={true} />
        </CardContent>
      </Card>

      {/* Customer Growth Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl">Total Customers</CardTitle>
            <Tabs defaultValue="individual" className="w-full max-w-[300px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Select defaultValue={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1 month">1 month</SelectItem>
              <SelectItem value="3 months">3 months</SelectItem>
              <SelectItem value="6 months">6 months</SelectItem>
              <SelectItem value="1 year">1 year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={customerData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value}`, "Customers"]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="individual"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#fef3c7"
                  name="Individual"
                />
                <Area
                  type="monotone"
                  dataKey="business"
                  stackId="1"
                  stroke="#f97316"
                  fill="#ffedd5"
                  name="Business"
                  strokeDasharray="3 3"
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue & Expenses */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Revenue & Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="h-[250px] md:col-span-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#22c55e" : "#f97316"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Total Revenue</span>
                <span className="ml-auto font-semibold">₦200,050,200</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm">Total Expenses</span>
                <span className="ml-auto font-semibold">₦120,023,800</span>
              </div>
              <div className="pt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      { name: "Jan", revenue: 150000000, expenses: 90000000 },
                      { name: "Feb", revenue: 170000000, expenses: 100000000 },
                      { name: "Mar", revenue: 160000000, expenses: 95000000 },
                      { name: "Apr", revenue: 180000000, expenses: 105000000 },
                      { name: "May", revenue: 190000000, expenses: 110000000 },
                      { name: "Jun", revenue: 200050200, expenses: 120023800 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, ""]} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#22c55e" />
                    <Bar dataKey="expenses" name="Expenses" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">User Statistics</CardTitle>
          <Select defaultValue="today">
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-500 text-xs">👤</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Active Users</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">3,000</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    +11.02% <ArrowUpRight className="h-3 w-3 inline" />
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-500 text-xs">👤</span>
                  </div>
                  <span className="text-sm text-muted-foreground">New Users</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">35</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    +4.05% <ArrowUpRight className="h-3 w-3 inline" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Users Pending Verification</h3>
                  <span className="text-xl font-bold">350</span>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Individual", value: 210 },
                          { name: "Business", value: 140 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#f97316" />
                        <Cell fill="#60a5fa" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Users`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Individual</span>
                    <span className="ml-auto font-medium">60%</span>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-sm">Business</span>
                    <span className="ml-auto font-medium">40%</span>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Account Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">Account Metrics</CardTitle>
          <Select defaultValue="today">
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <h3 className="text-sm text-muted-foreground mb-2">Total Active Account</h3>
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accountData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {accountData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Accounts`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mb-2">
                  <span className="text-xl font-bold">30000</span>
                  <span className="text-xs text-muted-foreground block">Accounts</span>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span>Savings</span>
                    </div>
                    <span>19000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span>Current</span>
                    </div>
                    <span>11000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <h3 className="text-sm text-muted-foreground mb-2">New Account Created</h3>
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={newAccountData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {newAccountData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Accounts`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mb-2">
                  <span className="text-xl font-bold">700</span>
                  <span className="text-xs text-muted-foreground block">Accounts</span>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span>Savings</span>
                    </div>
                    <span>400</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span>Current</span>
                    </div>
                    <span>300</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Account Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-[200px] md:col-span-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Blocked", value: 2200 },
                            { name: "Frozen", value: 1250 },
                            { name: "Closed", value: 1500 },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#ef4444" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#8b5cf6" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} Accounts`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <div className="text-center md:text-left">
                      <span className="text-xl font-bold">5000</span>
                      <span className="text-xs text-muted-foreground block">Accounts</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Total Blocked</span>
                      </div>
                      <span>2200</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Total Frozen</span>
                      </div>
                      <span>1250</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>Total Closed</span>
                      </div>
                      <span>1500</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
