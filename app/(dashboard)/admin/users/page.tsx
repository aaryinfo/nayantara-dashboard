'use client'

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { Users, Loader2 } from "lucide-react"
import { UserRow } from "@/components/admin/user-row"

export default function AdminUsersPage() {
  const users = useQuery(api.users.getAllUsers)
  const branches = useQuery(api.branches.getBranches)

  if (users === undefined || branches === undefined) {
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
          <Users className="h-5 w-5 text-teal-500" />
          User Management
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Approve pending users and assign them to branches.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Branch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(profile => (
                  <UserRow key={profile._id} profile={profile} branches={branches || []} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
