"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/store/sidebarStore"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { collapsed } = useSidebarStore()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar component */}
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
