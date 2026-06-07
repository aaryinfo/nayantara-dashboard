import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Plus } from "lucide-react"

export default async function AdminBranchesPage() {
  const supabase = await createClient()

  const { data: branches } = await supabase.from('branches').select('*').order('name')

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-teal-500" />
          Branch Management
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                    No branches found.
                  </TableCell>
                </TableRow>
              ) : (
                branches?.map(branch => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.location}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Add</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Turn this into a client component to handle the addBranch server action properly. 
                For now, just a stub form. */}
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input id="name" name="name" placeholder="e.g. MG Road Branch" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location / Address</Label>
                <Input id="location" name="location" placeholder="e.g. 123 Main St" />
              </div>
              <Button type="button" className="w-full">Create Branch</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
