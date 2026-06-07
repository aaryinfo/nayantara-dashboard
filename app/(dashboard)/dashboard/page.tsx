import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get current user and branch
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('branch_id, role')
    .eq('id', user.id)
    .single()

  const branchId = profile?.branch_id

  // If no branch assigned and not admin, show warning
  if (!branchId && profile?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-muted-foreground">
        You are not assigned to any branch. Please contact an administrator.
      </div>
    )
  }

  // Fetch transactions for the dashboard
  // Admins see all by default, or we can filter by branch if needed later
  let query = supabase.from('transactions').select('*')
  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  const { data: transactions } = await query

  const txs = transactions || []

  // Calculate stats
  const totalIn = txs.filter(t => t.type === 'in').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalOut = txs.filter(t => t.type === 'out').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIn - totalOut

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
  const recentTxs = [...txs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

  // Top expenses this month
  const expensesByCategory = monthTxs
    .filter(t => t.type === 'out')
    .reduce((acc, t) => {
      acc[t.source_category] = (acc[t.source_category] || 0) + Number(t.amount)
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
    <div className="space-y-6">
      {/* Hero Balance Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-green-500/20 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            Total Cash Balance
          </div>
          
          <div className="mt-4 mb-8 text-5xl sm:text-6xl font-bold tracking-tight font-mono text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,118,0.4)]">
            {formatCurrency(balance)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Cash In</div>
              <div className="mt-1 text-xl font-bold font-mono text-emerald-300">{formatCurrency(totalIn)}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Cash Out</div>
              <div className="mt-1 text-xl font-bold font-mono text-red-300">{formatCurrency(totalOut)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today In</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(todayIn)}</div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today Out</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(todayOut)}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Month Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(monthBalance)}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Entries</CardTitle>
            <span className="h-4 w-4 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold">#</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{txs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Top Categories */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-500" />
              <CardTitle className="text-sm">Recent Transactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentTxs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p className="text-sm">No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTxs.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.source_category} • {tx.date}</p>
                    </div>
                    <div className={`font-mono font-medium ${tx.type === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'in' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-500" />
              <CardTitle className="text-sm">Top Expenses This Month</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topExpenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <p className="text-sm">No expenses this month.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topExpenses.map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="capitalize text-sm font-medium">{category}</span>
                    <span className="font-mono text-sm">{formatCurrency(amount)}</span>
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
