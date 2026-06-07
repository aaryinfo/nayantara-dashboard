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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('type', type)

    const result = await addTransaction(formData)

    setIsLoading(false)

    if (result.error) {
      toast.error('Failed to add transaction', { description: result.error })
    } else {
      toast.success('Transaction added successfully')
      // Reset form
      e.currentTarget.reset()
      router.push('/dashboard')
    }
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${type === 'in' ? 'bg-green-500' : 'bg-red-500'}`} />
            <CardTitle>New Transaction</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-1 bg-muted/50">
              <div 
                onClick={() => setType('in')}
                className={`flex items-center justify-center p-2 rounded-md font-medium cursor-pointer transition-colors ${type === 'in' ? 'bg-green-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-background'}`}
              >
                💰 Cash In (Received)
              </div>
              <div 
                onClick={() => setType('out')}
                className={`flex items-center justify-center p-2 rounded-md font-medium cursor-pointer transition-colors ${type === 'out' ? 'bg-red-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-background'}`}
              >
                💸 Cash Out (Expense)
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input type="date" id="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input type="number" id="amount" name="amount" required placeholder="0.00" min="0" step="0.01" className="font-mono text-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source *</Label>
                <div className="flex gap-2">
                  <Select name="source" required defaultValue="sales">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales / Revenue</SelectItem>
                      <SelectItem value="customer">Customer Payment</SelectItem>
                      <SelectItem value="advance">Advance Received</SelectItem>
                      <SelectItem value="loan">Loan Received</SelectItem>
                      <SelectItem value="investment">Investment / Capital</SelectItem>
                      <SelectItem value="refund">Refund Received</SelectItem>
                      <SelectItem value="expense">General Expense</SelectItem>
                      <SelectItem value="salary">Salary / Wages</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Payment Mode</Label>
                <Select name="mode" required defaultValue="cash">
                  <SelectTrigger className="w-full">
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
                <Label htmlFor="description">Description *</Label>
                <Input type="text" id="description" name="description" required placeholder="Brief description..." />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Invoice no., party name, remarks..." className="min-h-[80px]" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t">
              <Button type="submit" disabled={isLoading} className={type === 'in' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {type === 'in' ? '💰 Save Cash In' : '💸 Save Cash Out'}
              </Button>
              <Button variant="outline" type="reset">
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
