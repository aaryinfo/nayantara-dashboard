'use client'

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { format, parseISO, subMonths } from "date-fns"
import { Loader2, TrendingUp, TrendingDown, ArrowRightLeft, Printer } from "lucide-react"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ReportsPage() {
  const transactions = useQuery(api.transactions.getTransactions, {})
  const currentUser = useQuery(api.users.getCurrentUser)
  const branches = useQuery(api.branches.getBranches)

  const [dateFilter, setDateFilter] = useState("")
  const [monthFilter, setMonthFilter] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")

  const { monthlyData, categoryData, totals, dateRange } = useMemo(() => {
    if (!transactions || transactions.length === 0) return { monthlyData: [], categoryData: [], totals: { in: 0, out: 0 }, dateRange: '' }

    const filteredTxs = transactions.filter(tx => {
      if (dateFilter && tx.date !== dateFilter) return false;
      if (monthFilter && !tx.date.startsWith(monthFilter)) return false;
      if (branchFilter !== "all" && tx.branchId !== branchFilter) return false;
      return true;
    });

    if (filteredTxs.length === 0) return { monthlyData: [], categoryData: [], totals: { in: 0, out: 0 }, dateRange: 'No transactions' };

    // Aggregate monthly cash in vs cash out
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      return format(subMonths(new Date(), i), 'MMM yyyy')
    }).reverse()

    const monthlyMap: Record<string, { name: string, in: number, out: number }> = {}
    last6Months.forEach(m => monthlyMap[m] = { name: m, in: 0, out: 0 })

    const catMap: Record<string, number> = {}
    let totalIn = 0;
    let totalOut = 0;
    
    let minDate = new Date()
    let maxDate = new Date(0)

    filteredTxs.forEach(t => {
      const amt = t.amount
      const d = parseISO(t.date)
      if (d < minDate) minDate = d
      if (d > maxDate) maxDate = d

      const monthStr = format(d, 'MMM yyyy')
      
      if (t.type === 'in') {
        if (monthlyMap[monthStr]) monthlyMap[monthStr].in += amt
        totalIn += amt
      } else {
        if (monthlyMap[monthStr]) monthlyMap[monthStr].out += amt
        catMap[t.sourceCategory] = (catMap[t.sourceCategory] || 0) + amt
        totalOut += amt
      }
    })

    const monthlyData = Object.values(monthlyMap)
    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
    
    const dateRangeStr = minDate <= maxDate 
      ? `${format(minDate, 'dd MMM yyyy')} to ${format(maxDate, 'dd MMM yyyy')}`
      : 'No data'

    return { monthlyData, categoryData, totals: { in: totalIn, out: totalOut }, dateRange: dateRangeStr }
  }, [transactions, dateFilter, monthFilter, branchFilter])

  const clearFilters = () => {
    setDateFilter("")
    setMonthFilter("")
    setBranchFilter("all")
  }

  if (transactions === undefined || currentUser === undefined || branches === undefined) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentBranch = branchFilter !== "all"
    ? branches?.find(b => b._id === branchFilter)
    : branches?.find(b => b._id === currentUser?.branchId)
  const branchName = currentBranch?.name || "All Branches"
  const branchLocation = currentBranch?.location || "Head Office"

  return (
    <div className="space-y-6 w-full pb-10 print:m-0 print:p-0 print:bg-white print:text-black">
      
      {/* Print Letterhead (Hidden on screen, shown on print) */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Nayantara Logo" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-wider text-black">Nayantara Opticals</h1>
              <p className="text-lg font-medium text-gray-700 mt-1">Financial Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-black">{branchName}</p>
            <p className="text-sm text-gray-600">{branchLocation}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <p><strong>Timeline:</strong> {dateRange}</p>
          <p><strong>Generated On:</strong> {format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-display font-semibold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">Comprehensive overview of cash flow and expenses.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 hover:bg-white/10 transition-colors">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-white/70 whitespace-nowrap m-0">Date:</Label>
            <Input 
              type="date" 
              value={dateFilter} 
              onChange={e => { setDateFilter(e.target.value); setMonthFilter(""); }} 
              className="h-6 w-auto bg-transparent border-0 focus-visible:ring-0 p-0 text-white font-mono text-xs cursor-pointer" 
            />
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 hover:bg-white/10 transition-colors">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-white/70 whitespace-nowrap m-0">Month:</Label>
            <Input 
              type="month" 
              value={monthFilter} 
              onChange={e => { setMonthFilter(e.target.value); setDateFilter(""); }} 
              className="h-6 w-auto bg-transparent border-0 focus-visible:ring-0 p-0 text-white font-mono text-xs cursor-pointer" 
            />
          </div>
          {currentUser?.role === 'admin' && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1.5 hover:bg-white/10 transition-colors h-[38px]">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-white/70 whitespace-nowrap m-0">Branch:</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="h-6 w-[120px] bg-transparent border-0 focus:ring-0 focus:ring-offset-0 p-0 text-white font-mono text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches?.map(b => (
                    <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {(dateFilter || monthFilter || branchFilter !== "all") && (
            <Button variant="ghost" onClick={clearFilters} size="sm" className="h-9 px-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium">
              Clear Filters
            </Button>
          )}
          <Button onClick={() => window.print()} className="h-9 gap-2 ml-auto">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print:mb-8">
        <Card className="bg-transparent border-white/10 print:!border-gray-300 print:!bg-transparent print:!backdrop-blur-none print:!shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-500 print:text-gray-600 mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                  ₹{totals.in.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-full print:hidden">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-white/10 print:!border-gray-300 print:!bg-transparent print:!backdrop-blur-none print:!shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-500 print:text-gray-600 mb-1">Total Expenses</p>
                <h3 className="text-3xl font-bold text-rose-600 dark:text-rose-400 print:text-black">
                  ₹{totals.out.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 bg-rose-500/20 rounded-full print:hidden">
                <TrendingDown className="h-6 w-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-white/10 print:!border-gray-300 print:!bg-transparent print:!backdrop-blur-none print:!shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary print:text-gray-600 mb-1">Net Cash Flow</p>
                <h3 className="text-3xl font-bold text-foreground print:text-black">
                  ₹{(totals.in - totals.out).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full print:hidden">
                <ArrowRightLeft className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        {/* 6-Month Cash Flow Bar Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="print:px-0">
            <CardTitle className="print:text-black">Cash Flow Trend (Last 6 Months)</CardTitle>
            <CardDescription className="print:text-gray-600">Monthly comparison of Cash In vs Cash Out.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] print:px-0 print:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '14px' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="in" name="Cash In" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="out" name="Cash Out" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category Pie Chart */}
        <Card className="col-span-1 lg:col-span-2 print:break-inside-avoid print:border-none print:shadow-none">
          <CardHeader className="print:px-0">
            <CardTitle className="print:text-black">Expenses Breakdown</CardTitle>
            <CardDescription className="print:text-gray-600">Distribution of expenses across all categories.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center print:px-0 print:h-[300px]">
            {categoryData.length === 0 ? (
              <div className="text-muted-foreground">No expense data to display</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
