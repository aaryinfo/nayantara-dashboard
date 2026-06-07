import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { auth, currentUser } from "@clerk/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { getToken } = await auth()
  const clerkUser = await currentUser()
  
  let dbRole = "operator";
  let branchName = "All Branches";
  if (clerkUser) {
    const token = await getToken({ template: "convex" })
    if (token) {
      let shouldRedirect = false;
      try {
        const dbUser = await fetchQuery(api.users.getCurrentUser, {}, { token })
        
        if (dbUser?.status === 'pending' || dbUser?.status === 'rejected') {
          shouldRedirect = true;
        }
        if (dbUser?.role) {
          dbRole = dbUser.role;
        }
        if (dbUser?.branchId) {
          const branch = await fetchQuery(api.branches.getBranch, { id: dbUser.branchId }, { token });
          if (branch) branchName = branch.name;
        }
      } catch (err) {
        console.error("Error fetching convex user:", err)
      }
      
      if (shouldRedirect) {
        redirect('/pending')
      }
    }
  }

  // Pass basic user info to sidebar
  const user = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    name: clerkUser.fullName,
    imageUrl: clerkUser.imageUrl,
    role: dbRole,
    branchName
  } : null;

  return (
    <SidebarProvider>
      {/* Global Dashboard Background: Animated Tree */}
      <div className="fixed inset-0 z-[-1] bg-black print:hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover object-center opacity-60 mix-blend-screen"
        >
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bg-hero-0BnFGdr81Ifnj3WbBZoNt1KE4D5DMT.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      </div>

      <AppSidebar user={user} />
      <SidebarInset className="bg-transparent relative z-10">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4 bg-transparent">
          <SidebarTrigger className="-ml-1 text-white/70 hover:text-white" />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="font-display tracking-wide text-white">Dashboard</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
