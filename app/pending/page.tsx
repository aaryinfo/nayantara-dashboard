import { auth } from '@clerk/nextjs/server'
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { redirect } from 'next/navigation'
import { SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from 'lucide-react'

export default async function PendingPage() {
  const { userId, getToken } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const token = await getToken({ template: "convex" })
  if (token) {
    try {
      const dbUser = await fetchQuery(api.users.getCurrentUser, {}, { token })
      if (dbUser?.status === 'approved') {
        redirect('/dashboard')
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background elements */}
      <div className="absolute inset-0 noise-overlay opacity-30" />
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-6 relative z-10">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative py-8">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <CardHeader className="space-y-4">
            <div className="flex justify-center mb-4 relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full" />
              <div className="relative h-20 w-20 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Clock className="h-10 w-10 text-amber-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display tracking-tight text-center text-white">Pending Approval</CardTitle>
            <CardDescription className="text-center text-base px-4 font-mono text-xs uppercase tracking-widest leading-relaxed text-white/70">
              Your account has been created successfully, but it is currently pending approval by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 mt-4">
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-center">
              <p className="text-sm text-white/60 leading-relaxed">
                You will be able to access the dashboard once your account is approved and assigned to a branch.
              </p>
            </div>
            <div className="flex justify-center w-full">
              <SignOutButton redirectUrl="/">
                <Button variant="outline" className="w-full h-11 border-white/20 bg-transparent hover:bg-white/10 text-white/70 hover:text-white transition-colors hover-lift">
                  Sign Out
                </Button>
              </SignOutButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
