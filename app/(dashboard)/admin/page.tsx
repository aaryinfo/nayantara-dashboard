'use client'

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, parseISO } from "date-fns"
import { 
  Building2, Users, Banknote, Clock, ArrowUpRight, ArrowDownRight, Activity 
} from "lucide-react"

export default function AdminOverview() {
  const transactions = useQuery(api.transactions.getTransactions, {})
  const branches = useQuery(api.branches.getBranches)
  const users = useQuery(api.users.getAllUsers)

  if (transactions === undefined || branches === undefined || users === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    )
  }

  const totalIn = transactions.filter(t => t.type === 'in').reduce((acc, curr) => acc + curr.amount, 0)
  const totalOut = transactions.filter(t => t.type === 'out').reduce((acc, curr) => acc + curr.amount, 0)
  const pendingUsers = users.filter(u => u.status === 'pending').length

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-display font-semibold tracking-tight">Admin Overview</h2>
        <p className="text-muted-foreground">High-level insights across all branches and users.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-background/50 border-border/40 hover:bg-white/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Cash In</p>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-500">₹{totalIn.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-background/50 border-border/40 hover:bg-white/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Cash Out</p>
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-500">₹{totalOut.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/40 hover:bg-white/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Active Branches</p>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold font-mono">{branches.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border/40 hover:bg-white/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Registered Users</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold font-mono">{users.length}</div>
              {pendingUsers > 0 && (
                <div className="text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
                  {pendingUsers} Pending
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Global Activity */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Global Activity
          </CardTitle>
          <CardDescription>Latest transactions across all active branches.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 8).map(tx => {
              const branchName = branches.find(b => b._id === tx.branchId)?.name || 'Unknown Branch'
              const userName = users.find(u => u._id === tx.createdBy)?.fullName || 'Unknown User'
              
              return (
                <div key={tx._id} className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-background/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'in' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                      {tx.type === 'in' ? <ArrowUpRight className="h-4 w-4 text-emerald-500" /> : <ArrowDownRight className="h-4 w-4 text-rose-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(parseISO(tx.date), 'dd MMM yyyy')}</span>
                        <span>•</span>
                        <span>{branchName}</span>
                        <span>•</span>
                        <span>{userName}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono font-medium ${tx.type === 'in' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'in' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              )
            })}
            
            {transactions.length === 0 && (
              <div className="text-center p-8 text-muted-foreground border border-dashed border-border/20 rounded-lg">
                No activity yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
