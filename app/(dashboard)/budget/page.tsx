'use client'

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Loader2, Plus, AlertCircle, TrendingDown } from "lucide-react"
import { toast } from "sonner"

const EXPENSE_CATEGORIES = [
  "General Expense", "Salary / Wages", "Utilities", "Other"
];

export default function BudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [newCategory, setNewCategory] = useState("General Expense")
  const [newAmount, setNewAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const transactions = useQuery(api.transactions.getTransactions, {})
  const budgets = useQuery(api.budgets.getBudgets, { month: selectedMonth })
  const setBudget = useMutation(api.budgets.setBudget)

  // Calculate actual spending per category for the selected month
  const categorySpending = useMemo(() => {
    if (!transactions) return {}
    const spending: Record<string, number> = {}
    
    transactions.forEach(t => {
      const tMonth = format(parseISO(t.date), 'yyyy-MM')
      if (t.type === 'out' && tMonth === selectedMonth) {
        spending[t.sourceCategory] = (spending[t.sourceCategory] || 0) + t.amount
      }
    })
    return spending
  }, [transactions, selectedMonth])

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAmount || isNaN(Number(newAmount))) return

    setIsSubmitting(true)
    try {
      await setBudget({
        category: newCategory,
        amount: Number(newAmount),
        month: selectedMonth
      })
      toast.success("Budget limit updated")
      setNewAmount("")
    } catch (err: any) {
      toast.error("Failed to set budget", { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (transactions === undefined || budgets === undefined) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-semibold tracking-tight">Budget Management</h2>
          <p className="text-muted-foreground">Set and track monthly spending limits by category.</p>
        </div>
        <Input 
          type="month" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-auto bg-background/50 border-border/40 focus:border-primary/50" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Set Budget Form */}
        <Card className="md:col-span-1 h-fit bg-transparent border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Set Budget Limit
            </CardTitle>
            <CardDescription>Allocate funds for a specific expense category.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetBudget} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="bg-background/50 border-border/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Monthly Limit (₹)</Label>
                <Input 
                  type="number" 
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 50000" 
                  min="0"
                  className="bg-background/50 border-border/40 font-mono"
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Save Limit
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Budget Progress Bars */}
        <Card className="md:col-span-2 bg-transparent border-white/10">
          <CardHeader>
            <CardTitle>Budget Status: {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}</CardTitle>
            <CardDescription>Visual tracker of your allocated spending.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgets.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border/40 rounded-xl text-muted-foreground">
                No budgets set for this month. Use the panel on the left to allocate funds.
              </div>
            ) : (
              budgets.map(budget => {
                const spent = categorySpending[budget.category] || 0
                const percent = Math.min((spent / budget.amount) * 100, 100)
                const isWarning = percent >= 80 && percent < 100
                const isOver = percent >= 100

                let progressColor = "bg-primary"
                if (isOver) progressColor = "bg-destructive"
                else if (isWarning) progressColor = "bg-amber-500"

                return (
                  <div key={budget._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{budget.category}</span>
                        {isOver && <AlertCircle className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="text-sm font-mono">
                        <span className={isOver ? "text-destructive font-bold" : ""}>
                          ₹{spent.toLocaleString('en-IN')}
                        </span>
                        <span className="text-muted-foreground"> / ₹{budget.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <Progress value={percent} className="h-2.5" indicatorClassName={progressColor} />
                    {isOver && (
                      <p className="text-xs text-destructive flex items-center justify-end">
                        Over budget by ₹{(spent - budget.amount).toLocaleString('en-IN')}
                      </p>
                    )}
                    {isWarning && !isOver && (
                      <p className="text-xs text-amber-500 flex items-center justify-end">
                        Approaching limit! ({(100 - percent).toFixed(1)}% remaining)
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
