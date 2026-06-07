import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DownloadIcon, UploadIcon, MoreHorizontal } from "lucide-react"

export default async function LedgerPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('branch_id, role')
    .eq('id', user.id)
    .single()

  const branchId = profile?.branch_id

  let query = supabase.from('transactions').select('*').order('created_at', { ascending: false })
  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  const { data: transactions } = await query
  const txs = transactions || []

  const totalIn = txs.filter(t => t.type === 'in').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalOut = txs.filter(t => t.type === 'out').reduce((sum, t) => sum + Number(t.amount), 0)
  const net = totalIn - totalOut

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Transaction Ledger</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <UploadIcon className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Type</Label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">Cash In</SelectItem>
                <SelectItem value="out">Cash Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Month</Label>
            <Input type="month" />
          </div>

          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Category</Label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-2">
            <Label>Search</Label>
            <Input type="text" placeholder="Description, notes..." />
          </div>

          <Button variant="secondary" size="sm" className="h-9">
            Clear
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Showing: <strong className="text-foreground">{txs.length}</strong></span>
          <span className="text-border">|</span>
          <span>In: <strong className="text-green-500 font-mono">{formatCurrency(totalIn)}</strong></span>
          <span className="text-border">|</span>
          <span>Out: <strong className="text-red-500 font-mono">{formatCurrency(totalOut)}</strong></span>
          <span className="text-border">|</span>
          <span>Net: <strong className="text-foreground font-mono">{formatCurrency(net)}</strong></span>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category / Source</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              txs.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.date}</TableCell>
                  <TableCell>
                    {tx.type === 'in' ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">IN</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">OUT</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-[200px]">
                      <span className="truncate" title={tx.description}>{tx.description}</span>
                      {tx.notes && <span className="text-xs text-muted-foreground truncate" title={tx.notes}>{tx.notes}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{tx.source_category}</TableCell>
                  <TableCell className="capitalize">{tx.payment_mode}</TableCell>
                  <TableCell className={`text-right font-mono font-medium ${tx.type === 'in' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'in' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
