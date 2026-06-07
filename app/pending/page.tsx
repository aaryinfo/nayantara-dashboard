import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from 'lucide-react'

export default async function PendingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()

  if (profile?.status === 'approved') {
    redirect('/dashboard')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
      <Card className="w-full text-center py-8">
        <CardHeader className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
              <Clock className="h-10 w-10 text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Pending Approval</CardTitle>
          <CardDescription className="text-center text-base px-4">
            Your account has been created successfully, but it is currently pending approval by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            You will be able to access the dashboard once your account is approved and assigned to a branch.
          </p>
          <form action="/api/auth/signout" method="post">
            <Button variant="outline" className="w-full" type="submit">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
