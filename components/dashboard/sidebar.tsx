'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  BarChart3, 
  PieChart, 
  Settings,
  Building2,
  Users
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
} from "@/components/ui/sidebar"

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Add Entry", url: "/dashboard/entry", icon: PlusCircle },
  { title: "Ledger", url: "/dashboard/ledger", icon: ClipboardList },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
  { title: "Budget", url: "/dashboard/budget", icon: PieChart },
]

const adminNavItems = [
  { title: "Overview", url: "/admin", icon: BarChart3 },
  { title: "Branches", url: "/admin/branches", icon: Building2 },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
]

export function AppSidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const isAdmin = user?.user_metadata?.role === 'admin'

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 w-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            N
          </div>
          <div className="flex flex-col gap-0">
            <span className="font-semibold text-sm leading-tight text-sidebar-foreground">Nayantara</span>
            <span className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-mono">Cash Manager</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-accent-foreground border border-sidebar-border">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium truncate text-sidebar-foreground">{user?.email}</span>
            <span className="text-xs text-sidebar-foreground/70 truncate capitalize">{user?.user_metadata?.role || 'Operator'}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors p-1">
              Logout
            </button>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
