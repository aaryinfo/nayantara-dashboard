'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircleIcon, Loader2 } from "lucide-react"
import { addTransaction } from '@/app/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function AddEntryPage() {
  const router = useRouter()
  const [type, setType] = useState<'in' | 'out'>('in')
  const [isLoading, setIsLoading] = useState(false)

  const [source, setSource] = useState('Sales / Revenue')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsLoading(true)

    const formData = new FormData(form)
    formData.append('type', type)

    const result = await addTransaction(formData)

    setIsLoading(false)

    if (result.error) {
      toast.error('Failed to add transaction', { description: result.error })
    } else {
      toast.success('Transaction added successfully')
      form.reset()
      setSource('Sales / Revenue')
      router.push('/dashboard')
    }
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <Card className="bg-transparent border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardHeader className="border-b border-border/20 pb-6">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${type === 'in' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,118,0.5)]' : 'bg-destructive shadow-[0_0_10px_rgba(248,113,113,0.5)]'}`} />
            <CardTitle className="font-display tracking-wide text-2xl">New Transaction</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/40 p-1.5 bg-background/50 backdrop-blur-sm">
              <div 
                onClick={() => setType('in')}
                className={`flex items-center justify-center p-3 rounded-lg font-medium cursor-pointer transition-all duration-300 ${type === 'in' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'}`}
              >
                💰 Cash In (Received)
              </div>
              <div 
                onClick={() => setType('out')}
                className={`flex items-center justify-center p-3 rounded-lg font-medium cursor-pointer transition-all duration-300 ${type === 'out' ? 'bg-destructive/20 text-destructive border border-destructive/30 shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'}`}
              >
                💸 Cash Out (Expense)
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Date *</Label>
                <Input type="date" id="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="bg-background/50 border-border/40 focus:border-primary/50" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Amount (₹) *</Label>
                <Input type="number" id="amount" name="amount" required placeholder="0.00" min="0" step="0.01" className="bg-background/50 border-border/40 focus:border-primary/50 font-mono text-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Source *</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="w-full bg-background/50 border-border/40 focus:border-primary/50">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales / Revenue">Sales / Revenue</SelectItem>
                    <SelectItem value="Customer Payment">Customer Payment</SelectItem>
                    <SelectItem value="Advance Received">Advance Received</SelectItem>
                    <SelectItem value="Loan Received">Loan Received</SelectItem>
                    <SelectItem value="Investment / Capital">Investment / Capital</SelectItem>
                    <SelectItem value="Refund Received">Refund Received</SelectItem>
                    <SelectItem value="General Expense">General Expense</SelectItem>
                    <SelectItem value="Salary / Wages">Salary / Wages</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Other">Other (Custom)</SelectItem>
                  </SelectContent>
                </Select>
                {source === 'Other' ? (
                  <Input type="text" id="custom_source" name="source" required placeholder="Enter custom source..." className="mt-2 bg-background/50 border-border/40 focus:border-primary/50" />
                ) : (
                  <input type="hidden" name="source" value={source} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Payment Mode</Label>
                <Select name="mode" required defaultValue="cash">
                  <SelectTrigger className="w-full bg-background/50 border-border/40 focus:border-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI / Online</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Description *</Label>
                <Input type="text" id="description" name="description" required placeholder="Brief description..." className="bg-background/50 border-border/40 focus:border-primary/50" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Notes (optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Invoice no., party name, remarks..." className="min-h-[80px] bg-background/50 border-border/40 focus:border-primary/50" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-border/20">
              <Button type="submit" disabled={isLoading} className={`px-8 transition-all hover-lift ${type === 'in' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30' : 'bg-destructive/20 text-destructive border border-destructive/50 hover:bg-destructive/30'}`}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {type === 'in' ? 'Save Cash In' : 'Save Cash Out'}
              </Button>
              <Button variant="outline" type="reset" className="border-border/40 bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground">
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
