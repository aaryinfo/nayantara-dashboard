'use client'

import { useRef, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const transactions = useQuery(api.transactions.getTransactions, {})
  const bulkAdd = useMutation(api.transactions.bulkAddTransactions)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error('No transactions to export')
      return
    }

    const headers = ['Date', 'Type', 'Description', 'Category', 'Mode', 'Amount', 'Notes']
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
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
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`)
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
          // Simple regex to split by comma but respect quotes
          const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
          const row = line.split(regex).map(val => val.replace(/^"|"$/g, '').trim())
          
          if (row.length < 6) {
             throw new Error(`Row ${index + 2} is missing required columns`)
          }

          const [date, type, description, category, mode, amountStr, notes] = row
          
          const amount = parseFloat(amountStr)
          if (isNaN(amount)) throw new Error(`Invalid amount on row ${index + 2}`)
          
          if (type !== 'in' && type !== 'out') {
             throw new Error(`Invalid type '${type}' on row ${index + 2}. Must be 'in' or 'out'.`)
          }

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

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <h2 className="text-lg font-semibold">Settings & Data</h2>
      
      <Card>
        <CardHeader>
          <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2 mb-2">
            💾 Data Management
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <strong className="block text-sm">Import CSV</strong>
              <p className="text-xs text-muted-foreground">Import transactions from a CSV file.</p>
              <p className="text-[10px] text-muted-foreground mt-1">Expected columns: Date, Type (in/out), Description, Category, Mode, Amount, Notes</p>
            </div>
            <div>
              <input 
                type="file" 
                accept=".csv" 
                ref={fileInputRef} 
                onChange={handleImportCSV} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isImporting}
                className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-accent disabled:opacity-50 flex items-center"
              >
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : '📥 '}
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <strong className="block text-sm">Export All Transactions (CSV)</strong>
              <p className="text-xs text-muted-foreground">Download all active transactions as CSV.</p>
            </div>
            <button 
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-accent"
            >
              📤 Export CSV
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="text-sm font-bold uppercase tracking-wider text-destructive border-b border-destructive/20 pb-2 mb-2">
            ⚠️ Danger Zone
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-destructive/10">
            <div>
              <strong className="block text-sm text-foreground">Clear All Transactions</strong>
              <p className="text-xs text-muted-foreground">Delete active ledger for this branch.</p>
            </div>
            <button 
              className="px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 opacity-50 cursor-not-allowed"
              title="Disabled for safety during preview"
            >
              🗑️ Clear Ledger
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
