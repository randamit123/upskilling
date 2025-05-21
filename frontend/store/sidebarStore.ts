"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarState {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    {
      name: "sidebar-storage",
    }
  )
)
