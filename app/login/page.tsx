import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;

  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/dashboard')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <span className="text-xl font-bold text-primary tracking-tighter">N</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-tight">Nayantara Opticals</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Cash Manager</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground" action={signIn}>
            <div className="grid gap-2 mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="admin@nayantara.com"
                required
              />
            </div>
            <div className="grid gap-2 mb-6">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Button className="w-full" type="submit">
              Sign In
            </Button>
            {message && (
              <p className="mt-4 p-3 bg-destructive/10 text-destructive text-center text-sm border border-destructive/20 rounded-md">
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
