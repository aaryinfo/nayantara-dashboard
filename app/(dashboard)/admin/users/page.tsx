import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users } from "lucide-react"
import { UserRow } from "@/components/admin/user-row"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Fetch all profiles
  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  
  // Fetch branches for assignment dropdown
  const { data: branches } = await supabase.from('branches').select('id, name').order('name')

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
              {profiles?.map(profile => (
                <UserRow key={profile.id} profile={profile} branches={branches || []} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
