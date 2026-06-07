'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useClerk } from "@clerk/nextjs"
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  BarChart3, 
  PieChart, 
  Settings,
  Building2,
  Users,
  LogOut
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar"

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Add Entry", url: "/entry", icon: PlusCircle },
  { title: "Ledger", url: "/ledger", icon: ClipboardList },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Budget", url: "/budget", icon: PieChart },
]

const adminNavItems = [
  { title: "Overview", url: "/admin", icon: BarChart3 },
  { title: "Branches", url: "/admin/branches", icon: Building2 },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const isAdmin = user?.role === 'admin'
  const { signOut } = useClerk()

  return (
    <Sidebar variant="inset" className="border-r border-white/10 bg-transparent">
      <SidebarHeader className="px-6 py-6 flex flex-col gap-2">
        <Link href="/dashboard" className="flex items-center gap-3 w-full group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-sm transition-all duration-300">
            <img src="/logo.png" alt="Nayantara Logo" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-lg leading-tight tracking-wide">Nayantara</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono">Cash Manager</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-4 mt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/60 font-mono mb-2">Menu</SidebarGroupLabel>
          <SidebarMenu className="gap-1.5">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="rounded-lg h-10 px-3 hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-foreground transition-all">
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={`size-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium tracking-wide text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/60 font-mono mb-2">Administration</SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="rounded-lg h-10 px-3 hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-foreground transition-all">
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`size-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium tracking-wide text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "size-9 border border-primary/20",
                }
              }} 
            />
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium truncate text-white/90">{user?.name || user?.email?.split('@')[0]}</span>
              <span className="text-[10px] text-primary uppercase tracking-widest font-mono truncate">
                {isAdmin ? 'Admin' : 'Operator'} • {user?.branchName}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            className="flex items-center justify-center gap-2 w-full rounded-lg py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
