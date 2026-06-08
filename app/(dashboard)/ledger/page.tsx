"use client";

import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DownloadIcon, UploadIcon, Printer, Loader2, Edit2, Trash2, Save, X } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

function LedgerRow({ tx, uniqueCategories, formatCurrency }: { tx: any, uniqueCategories: string[], formatCurrency: (amount: number) => string }) {
  const updateTransaction = useMutation(api.transactions.updateTransaction)
  const deleteTransaction = useMutation(api.transactions.deleteTransaction)

  const [isEditing, setIsEditing] = useState(false)
  const [description, setDescription] = useState(tx.description)
  const [amount, setAmount] = useState(tx.amount.toString())
  const [category, setCategory] = useState(tx.sourceCategory)
  const [type, setType] = useState(tx.type)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateTransaction({
        id: tx._id,
        description,
        amount: parseFloat(amount),
        sourceCategory: category,
        type: type,
        date: tx.date,
        paymentMode: tx.paymentMode,
        notes: tx.notes
      })
      toast.success("Transaction updated")
      setIsEditing(false)
    } catch (err: any) {
      toast.error("Failed to update transaction", { description: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    setIsDeleting(true)
    try {
      await deleteTransaction({ id: tx._id })
      toast.success("Transaction deleted")
    } catch (err: any) {
      toast.error("Failed to delete transaction", { description: err.message })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <TableRow className="border-border/10">
        <TableCell className="font-mono text-xs">{tx.date}</TableCell>
        <TableCell>
          <Select value={type} onValueChange={(val: 'in'|'out') => setType(val)}>
            <SelectTrigger className="h-8 w-20 text-[10px] font-mono"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="in">IN</SelectItem>
              <SelectItem value="out">OUT</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell>
          <Input value={description} onChange={e => setDescription(e.target.value)} className="h-8 w-full max-w-[200px]" />
        </TableCell>
        <TableCell>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="capitalize text-xs text-foreground/80">{tx.paymentMode}</TableCell>
        <TableCell className="text-right">
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="h-8 w-24 text-right ml-auto" />
        </TableCell>
        <TableCell className="text-right flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving} className="h-8 w-8">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Save className="h-4 w-4 text-emerald-500" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} disabled={isSaving} className="h-8 w-8">
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className="border-border/10 hover:bg-white/5 transition-colors group print:border-gray-200 print:text-black">
      <TableCell className="font-mono text-xs print:text-black">{tx.date}</TableCell>
      <TableCell>
        {tx.type === 'in' ? (
          <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 font-mono tracking-widest text-[9px] rounded-sm print:bg-transparent print:text-green-700 print:border-green-700">IN</Badge>
        ) : (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 font-mono tracking-widest text-[9px] rounded-sm print:bg-transparent print:text-red-700 print:border-red-700">OUT</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col max-w-[200px]">
          <span className="truncate font-medium text-foreground/90 group-hover:text-foreground transition-colors print:text-black" title={tx.description}>{tx.description}</span>
          {tx.notes && <span className="text-[10px] text-muted-foreground truncate uppercase tracking-wide font-mono mt-0.5 print:text-gray-600" title={tx.notes}>{tx.notes}</span>}
        </div>
      </TableCell>
      <TableCell className="capitalize text-xs font-medium text-foreground/80 print:text-black">{tx.sourceCategory}</TableCell>
      <TableCell className="capitalize text-xs text-foreground/80 print:text-black">{tx.paymentMode}</TableCell>
      <TableCell className={`text-right font-mono font-medium tracking-tight ${tx.type === 'in' ? 'text-emerald-400 print:text-green-700' : 'text-destructive print:text-red-700'}`}>
        {tx.type === 'in' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
      </TableCell>
      <TableCell className="text-right flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function LedgerPage() {
  const transactions = useQuery(api.transactions.getTransactions, {});
  const currentUser = useQuery(api.users.getCurrentUser);
  const branches = useQuery(api.branches.getBranches);
  const bulkAdd = useMutation(api.transactions.bulkAddTransactions);

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)

  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [monthFilter, setMonthFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")

  const filteredTxs = useMemo(() => {
    if (!transactions) return []
    return transactions.filter(tx => {
      // Type Filter
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      // Date Filter
      if (dateFilter && tx.date !== dateFilter) return false;
      // Month Filter
      if (monthFilter && !tx.date.startsWith(monthFilter)) return false;
      // Category Filter
      if (categoryFilter !== "all" && tx.sourceCategory !== categoryFilter) return false;
      // Branch Filter
      if (branchFilter !== "all" && tx.branchId !== branchFilter) return false;
      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchDesc = tx.description.toLowerCase().includes(query)
        const matchNotes = tx.notes?.toLowerCase().includes(query)
        if (!matchDesc && !matchNotes) return false;
      }
      return true;
    })
  }, [transactions, typeFilter, dateFilter, monthFilter, categoryFilter, searchQuery, branchFilter])

  // Compute the date range string from filtered transactions
  const dateRangeStr = useMemo(() => {
    if (!filteredTxs || filteredTxs.length === 0) return 'No transactions'
    const dates = filteredTxs.map(t => t.date).sort()
    return `${dates[0]} to ${dates[dates.length - 1]}`
  }, [filteredTxs])

  // Get unique categories for dropdown
  const uniqueCategories = useMemo(() => {
    if (!transactions) return []
    const cats = new Set(transactions.map(t => t.sourceCategory))
    return Array.from(cats)
  }, [transactions])

  const clearFilters = () => {
    setTypeFilter("all")
    setDateFilter("")
    setMonthFilter("")
    setCategoryFilter("all")
    setSearchQuery("")
    setBranchFilter("all")
  }

  const handleExportCSV = () => {
    if (filteredTxs.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const headers = ['Date', 'Type', 'Description', 'Category', 'Mode', 'Amount', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredTxs.map(t => [
        t.date,
        t.type,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.sourceCategory.replace(/"/g, '""')}"`,
        t.paymentMode,
        t.amount,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split('\n').filter(line => line.trim().length > 0)
        
        if (lines.length <= 1) {
          throw new Error('CSV file is empty or only contains headers')
        }

        const parsedTransactions = lines.slice(1).map((line, index) => {
          const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
          const row = line.split(regex).map(val => val.replace(/^"|"$/g, '').trim())
          
          if (row.length < 6) {
             throw new Error(`Row ${index + 2} is missing required columns`)
          }

          const [date, type, description, category, mode, amountStr, notes] = row
          const amount = parseFloat(amountStr)
          if (isNaN(amount)) throw new Error(`Invalid amount on row ${index + 2}`)
          if (type !== 'in' && type !== 'out') throw new Error(`Invalid type '${type}' on row ${index + 2}`)

          return {
            date: date,
            type: type as 'in' | 'out',
            description,
            sourceCategory: category,
            paymentMode: mode,
            amount,
            notes: notes || undefined
          }
        })

        await bulkAdd({ transactions: parsedTransactions })
        toast.success(`Successfully imported ${parsedTransactions.length} transactions`)
      } catch (error: any) {
        toast.error('Import Failed', { description: error.message })
      } finally {
        setIsImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    
    reader.onerror = () => {
      toast.error('Error reading file')
      setIsImporting(false)
    }
    
    reader.readAsText(file)
  }

  // If transactions is undefined, it's still loading
  if (transactions === undefined || currentUser === undefined || branches === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading ledger data...
        </div>
      </div>
    );
  }

  const currentBranch = branchFilter !== "all" 
    ? branches?.find(b => b._id === branchFilter)
    : branches?.find(b => b._id === currentUser?.branchId)
  const branchName = currentBranch?.name || "All Branches"
  const branchLocation = currentBranch?.location || "Head Office"

  const totalIn = filteredTxs.filter(t => t.type === 'in').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalOut = filteredTxs.filter(t => t.type === 'out').reduce((sum, t) => sum + Number(t.amount), 0)
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
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative z-10 print:m-0 print:p-0 print:bg-white print:text-black">
      
      {/* Print Letterhead */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Nayantara Logo" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-wider text-black">Nayantara Opticals</h1>
              <p className="text-lg font-medium text-gray-700 mt-1">Transaction Ledger</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-black">{branchName}</p>
            <p className="text-sm text-gray-600">{branchLocation}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <p><strong>Timeline:</strong> {dateRangeStr} | <strong>Filters:</strong> Type: {typeFilter}, Date: {dateFilter || 'All'}, Month: {monthFilter || 'All'}, Category: {categoryFilter}</p>
          <p><strong>Generated On:</strong> {format(new Date(), 'dd MMM yyyy, hh:mm a')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <h2 className="text-2xl font-display tracking-wide text-white">Transaction Ledger</h2>
        <div className="flex gap-2">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="bg-background/20 border-border/40 hover:bg-white/10 transition-all hover-lift">
            {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadIcon className="h-4 w-4 mr-2" />}
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="bg-background/20 border-border/40 hover:bg-white/10 transition-all hover-lift">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="bg-background/20 border-border/40 hover:bg-white/10 transition-all hover-lift">
            <Printer className="h-4 w-4 mr-2" />
            Print Ledger
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="print:hidden p-5 bg-transparent border-white/10 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[120px] space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-white/70">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-background/30 border-border/40 focus:border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="in">Cash In</SelectItem>
                <SelectItem value="out">Cash Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {currentUser?.role === 'admin' && (
            <div className="flex-1 min-w-[120px] space-y-2">
              <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-white/70">Branch</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="bg-background/30 border-border/40 focus:border-primary/50">
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
          
          <div className="flex-1 min-w-[120px] space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-white/70">Specific Date</Label>
            <Input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setMonthFilter(""); }} className="bg-background/30 border-border/40 focus:border-primary/50 font-mono" />
          </div>

          <div className="flex-1 min-w-[120px] space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-white/70">Month</Label>
            <Input type="month" value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setDateFilter(""); }} className="bg-background/30 border-border/40 focus:border-primary/50 font-mono" />
          </div>

          <div className="flex-1 min-w-[120px] space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-white/70">Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-background/30 border-border/40 focus:border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-2">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-white/70">Search</Label>
            <Input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Description, notes..." className="bg-background/30 border-border/40 focus:border-primary/50" />
          </div>

          <Button variant="secondary" onClick={clearFilters} size="sm" className="h-10 px-6 border border-border/40 bg-white/5 hover:bg-white/20 transition-colors">
            Clear Filters
          </Button>
        </div>

        <div className="mt-5 pt-4 border-t border-border/20 flex flex-wrap gap-4 text-[11px] font-mono uppercase tracking-widest text-muted-foreground relative z-10 text-white/70">
          <span>Showing: <strong className="text-white font-medium">{filteredTxs.length}</strong></span>
          <span className="text-border/40">|</span>
          <span>In: <strong className="text-emerald-400 font-medium">{formatCurrency(totalIn)}</strong></span>
          <span className="text-border/40">|</span>
          <span>Out: <strong className="text-destructive font-medium">{formatCurrency(totalOut)}</strong></span>
          <span className="text-border/40">|</span>
          <span>Net: <strong className="text-white font-medium">{formatCurrency(net)}</strong></span>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="bg-transparent border-white/10 shadow-xl overflow-hidden print:!border-none print:!shadow-none print:!bg-transparent print:!backdrop-blur-none print:!text-black">
        <Table className="print:!bg-transparent">
          <TableHeader>
            <TableRow className="border-border/20 hover:bg-transparent print:border-gray-300">
              <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground print:text-black">Date</TableHead>
              <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground print:text-black">Type</TableHead>
              <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground print:text-black">Description</TableHead>
              <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground print:text-black">Source</TableHead>
              <TableHead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground print:text-black">Mode</TableHead>
              <TableHead className="text-right text-[10px] font-mono uppercase tracking-widest text-muted-foreground print:text-black">Amount</TableHead>
              <TableHead className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground print:hidden">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTxs.length === 0 ? (
              <TableRow className="hover:bg-transparent print:border-gray-200">
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center p-8 bg-black/10 rounded-xl border border-white/5 mx-4 my-4 text-muted-foreground print:border-none print:bg-transparent print:text-black">
                    <p className="text-sm font-mono uppercase tracking-widest opacity-60">No transactions found.</p>
                  </div>
                </TableCell>
              </TableRow>
              ) : (
                filteredTxs.map((tx) => (
                  <LedgerRow key={tx._id} tx={tx} uniqueCategories={uniqueCategories} formatCurrency={formatCurrency} />
                ))
              )}
            
            {/* Print Only Summary Row */}
            {filteredTxs.length > 0 && (
              <TableRow className="hidden print:table-row font-bold">
                <TableCell colSpan={5} className="text-right text-black uppercase text-xs tracking-wider">
                  Total {typeFilter !== 'all' ? typeFilter : 'Net'} Amount:
                </TableCell>
                <TableCell className={`text-right font-mono text-sm tracking-tight ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(Math.abs(net))}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
