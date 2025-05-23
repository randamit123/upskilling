"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/store/sidebarStore"
import { useAuthStore } from "@/store/authStore"

// Public paths that should not show the sidebar
const publicPaths = ['/', '/auth'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed } = useSidebarStore();
  const { user, isLoading } = useAuthStore();
  const pathname = usePathname();
  
  // Determine if we should show the app shell (sidebar, breadcrumbs, etc)
  const isPublicPath = publicPaths.includes(pathname);
  const showAppShell = !isPublicPath || (user && !isLoading);
  
  // If on a public path or user is not authenticated, just show the content
  if (!showAppShell) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }
  
  // Otherwise, show the full app layout with sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar component - only shown when authenticated */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content area */}
      <main
        className={cn(
          "flex-1 overflow-auto transition-margin duration-300",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <Breadcrumbs />
            <ThemeToggle />
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </main>
    </div>
  )
}
