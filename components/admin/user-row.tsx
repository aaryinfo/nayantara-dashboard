'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export function UserRow({ profile, branches }: { profile: any, branches: any[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState(profile.status)
  const [role, setRole] = useState(profile.role)
  const [branchId, setBranchId] = useState(profile.branchId || 'none')

  const updateUser = useMutation(api.users.updateUser)

  const handleSave = async () => {
    setIsLoading(true)

    try {
      await updateUser({
        userId: profile._id as Id<"users">,
        status: status as any,
        role: role as any,
        branchId: branchId === 'none' ? undefined : (branchId as Id<"branches">)
      })
      toast.success('User updated successfully')
    } catch (err: any) {
      toast.error('Failed to update user', { description: err.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{profile.fullName || 'Unnamed User'}</span>
          <span className="text-xs text-muted-foreground">{profile.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger className="w-40 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Branch</SelectItem>
            {branches.map(b => (
              <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <Button 
          size="sm" 
          onClick={handleSave} 
          disabled={isLoading || (status === profile.status && role === profile.role && branchId === (profile.branchId || 'none'))}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </TableCell>
    </TableRow>
  )
}
