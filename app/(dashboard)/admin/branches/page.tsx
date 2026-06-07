'use client'

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Plus, Loader2, Save, Trash2, Edit2, X } from "lucide-react"
import { toast } from "sonner"
import { Id } from "@/convex/_generated/dataModel"

function BranchRow({ branch }: { branch: { _id: Id<"branches">; name: string; location: string } }) {
  const updateBranch = useMutation(api.branches.updateBranch)
  const deleteBranch = useMutation(api.branches.deleteBranch)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(branch.name)
  const [location, setLocation] = useState(branch.location)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateBranch({ id: branch._id, name, location })
      toast.success("Branch updated successfully")
      setIsEditing(false)
    } catch (err: any) {
      toast.error("Failed to update branch", { description: err.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this branch? Users assigned to it might lose their assignment.")) return;
    setIsDeleting(true)
    try {
      await deleteBranch({ id: branch._id })
      toast.success("Branch deleted successfully")
    } catch (err: any) {
      toast.error("Failed to delete branch", { description: err.message })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <TableRow>
        <TableCell>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-full max-w-[200px]" />
        </TableCell>
        <TableCell>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-8 w-full max-w-[200px]" />
        </TableCell>
        <TableCell className="text-right flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving || !name || !location}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Save className="h-4 w-4 text-emerald-500" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} disabled={isSaving}>
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{branch.name}</TableCell>
      <TableCell>{branch.location}</TableCell>
      <TableCell className="text-right flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive" />}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function AdminBranchesPage() {
  const branches = useQuery(api.branches.getBranches)
  const addBranch = useMutation(api.branches.addBranch)

  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !location) return

    setIsSubmitting(true)
    try {
      await addBranch({ name, location })
      toast.success("Branch created successfully")
      setName("")
      setLocation("")
    } catch (err: any) {
      toast.error("Failed to create branch", { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (branches === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                    No branches found.
                  </TableCell>
                </TableRow>
              ) : (
                branches.map(branch => (
                  <BranchRow key={branch._id} branch={branch} />
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
            <form onSubmit={handleAddBranch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MG Road Branch" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location / Address</Label>
                <Input 
                  id="location" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 123 Main St" 
                  required 
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Branch
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
