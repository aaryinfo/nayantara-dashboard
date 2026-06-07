"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon, CalendarDays } from "lucide-react"

export default function DashboardPage() {
  const transactions = useQuery(api.transactions.getTransactions, {});

  // If transactions is undefined, it's still loading
  if (transactions === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading dashboard data...
        </div>
      </div>
    );
  }

  const txs = transactions || []

  // Calculate stats
  const totalIn = txs.filter(t => t.type === 'in').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalOut = txs.filter(t => t.type === 'out').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIn - totalOut

  // Compute overall date range of transactions
  const dateRange = txs.length > 0
    ? (() => {
        const dates = txs.map(t => t.date).sort()
        return `${dates[0]} to ${dates[dates.length - 1]}`
      })()
    : 'No transactions yet'

  // Today's stats
  const today = new Date().toISOString().split('T')[0]
  const todayTxs = txs.filter(t => t.date === today)
  const todayIn = todayTxs.filter(t => t.type === 'in').reduce((sum, t) => sum + Number(t.amount), 0)
  const todayOut = todayTxs.filter(t => t.type === 'out').reduce((sum, t) => sum + Number(t.amount), 0)

  // Current month stats
  const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const monthTxs = txs.filter(t => t.date.startsWith(thisMonth))
  const monthIn = monthTxs.filter(t => t.type === 'in').reduce((sum, t) => sum + Number(t.amount), 0)
  const monthOut = monthTxs.filter(t => t.type === 'out').reduce((sum, t) => sum + Number(t.amount), 0)
  const monthBalance = monthIn - monthOut

  // Recent transactions
  const recentTxs = [...txs].slice(0, 5) // It's already sorted by desc in Convex

  // Top expenses this month
  const expensesByCategory = monthTxs
    .filter(t => t.type === 'out')
    .reduce((acc, t) => {
      acc[t.sourceCategory] = (acc[t.sourceCategory] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)

  const topExpenses = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative z-10">
      {/* Hero Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-transparent border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-8">
          <div className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground/80">
            <span className="w-8 h-px bg-primary/30" />
            Total Cash Balance
            <span className="relative flex h-2 w-2 ml-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          
          <div className="text-[clamp(3rem,6vw,5rem)] font-display leading-[0.92] tracking-tight">
            <span className={balance >= 0 ? "word-gradient" : "text-destructive"}>
              {formatCurrency(balance)}
            </span>
          </div>

          {/* Timeline / Date Range */}
          <div className="flex items-center gap-2 text-sm font-mono text-white/60">
            <CalendarDays className="h-4 w-4 text-primary/60" />
            <span className="uppercase tracking-widest text-[10px]">Timeline:</span>
            <span className="text-white/80 text-xs">{dateRange}</span>
            <span className="text-white/30 mx-2">|</span>
            <span className="uppercase tracking-widest text-[10px]">Today:</span>
            <span className="text-white/80 text-xs">{today}</span>
            <span className="text-white/30 mx-2">|</span>
            <span className="uppercase tracking-widest text-[10px]">Month:</span>
            <span className="text-white/80 text-xs">{thisMonth}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:max-w-md">
            <div className="rounded-xl border border-white/10 bg-transparent p-4 transition-all hover:bg-white/5 hover-lift">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-mono mb-2">Total Cash In</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{formatCurrency(totalIn)}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-transparent p-4 transition-all hover:bg-white/5 hover-lift">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground font-mono mb-2">Total Cash Out</div>
              <div className="text-xl font-bold font-mono text-destructive">{formatCurrency(totalOut)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-transparent border-white/10 hover:bg-white/5 transition-colors hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Today In</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{formatCurrency(todayIn)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-transparent border-white/10 hover:bg-white/5 transition-colors hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Today Out</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{formatCurrency(todayOut)}</div>
          </CardContent>
        </Card>

        <Card className="bg-transparent border-white/10 hover:bg-white/5 transition-colors hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Month Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{formatCurrency(monthBalance)}</div>
          </CardContent>
        </Card>

        <Card className="bg-transparent border-white/10 hover:bg-white/5 transition-colors hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Total Entries</CardTitle>
            <span className="h-4 w-4 flex items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold border border-primary/30">#</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">{txs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Top Categories */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-transparent border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <CardTitle className="text-sm font-display tracking-wide text-foreground">Recent Transactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {recentTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-black/10 rounded-xl border border-white/5">
                <p className="text-sm font-mono uppercase tracking-widest opacity-60">No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentTxs.map(tx => (
                  <div key={tx._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                    <div>
                      <p className="font-medium text-sm text-foreground/90 group-hover:text-foreground transition-colors">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mt-0.5">{tx.sourceCategory} • {tx.date}</p>
                    </div>
                    <div className={`font-mono font-medium tracking-tight ${tx.type === 'in' ? 'text-emerald-400' : 'text-destructive'}`}>
                      {tx.type === 'in' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-transparent border-white/10 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 p-32 bg-secondary/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-secondary" />
              <CardTitle className="text-sm font-display tracking-wide text-foreground">Top Expenses This Month</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {topExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-black/10 rounded-xl border border-white/5">
                <p className="text-sm font-mono uppercase tracking-widest opacity-60">No expenses this month.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {topExpenses.map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                    <span className="capitalize text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">{category}</span>
                    <span className="font-mono text-sm tracking-tight text-foreground">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
