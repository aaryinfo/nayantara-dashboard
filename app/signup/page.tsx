import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams;

  const signUp = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      return redirect('/signup?message=Could not sign up user')
    }

    return redirect('/pending')
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
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Sign up for access. An admin will need to approve your account before you can log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground" action={signUp}>
            <div className="grid gap-2 mb-4">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2 mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="operator@nayantara.com"
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
              Sign Up
            </Button>
            {message && (
              <p className="mt-4 p-3 bg-destructive/10 text-destructive text-center text-sm border border-destructive/20 rounded-md">
                {message}
              </p>
            )}
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
