import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const supabase = await createClient()

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
            </div>
            <button className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-accent">
              📥 Import
            </button>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <strong className="block text-sm">Export All Transactions (CSV)</strong>
              <p className="text-xs text-muted-foreground">Download all active transactions as CSV.</p>
            </div>
            <button className="px-3 py-1.5 text-xs font-medium border rounded-md hover:bg-accent">
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
            <button className="px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
              🗑️ Clear Ledger
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
