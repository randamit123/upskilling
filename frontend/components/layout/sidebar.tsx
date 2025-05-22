"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/store/sidebarStore"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CommandDialog } from "@/components/command-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  FileText,
  ClipboardList,
  Route,
  Users,
  FileCheck,
  Database,
  Tags,
  Mail,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Building2,
  ChevronsUpDown,
} from "lucide-react"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed, toggleCollapsed, setCollapsed } = useSidebarStore()
  const { toast } = useToast()
  const [commandOpen, setCommandOpen] = useState(false)
  
  // Handle keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Primary navigation routes
  const primaryRoutes = [
    {
      title: "Course Development",
      href: "/courses",
      icon: BookOpen,
      active: pathname.startsWith("/courses"),
    },
    {
      title: "Microlearning",
      href: "/microlearning",
      icon: FileText,
      active: pathname.startsWith("/microlearning"),
    },
    {
      title: "Survey Builder",
      href: "/survey",
      icon: ClipboardList,
      active: pathname.startsWith("/survey"),
    },
    {
      title: "Learning Paths",
      href: "/learning-path",
      icon: Route,
      active: pathname.startsWith("/learning-path"),
    },
    {
      title: "Role Paths",
      href: "/roles",
      icon: Users,
      active: pathname.startsWith("/roles"),
    },
    {
      title: "Assessments",
      href: "/assessments",
      icon: FileCheck,
      active: pathname.startsWith("/assessments"),
    },
    {
      title: "Knowledge",
      href: "/knowledge",
      icon: Database,
      active: pathname.startsWith("/knowledge"),
    },
    {
      title: "Content Tagging",
      href: "/tagging",
      icon: Tags,
      active: pathname.startsWith("/tagging"),
    },
    {
      title: "Communications",
      href: "/comms",
      icon: Mail,
      active: pathname.startsWith("/comms"),
    },
    {
      title: "Impact",
      href: "/impact",
      icon: BarChart3,
      active: pathname.startsWith("/impact"),
    },
  ]
  
  // Utility navigation items (from former TopBar)
  const utilityItems = [
    {
      title: "Search",
      icon: Search,
      onClick: () => setCommandOpen(true),
      shortcut: "⌘K",
    },
    {
      title: "Notifications",
      icon: Bell,
      onClick: () => {
        toast({
          title: "Notifications",
          description: "You have no new notifications",
        })
      },
    },
  ]

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    return (
      <div className="flex h-full flex-col">
        {/* Section 1: Brand & Collapse Toggle */}
        <div className={cn(
          "flex h-14 items-center border-b px-4", 
          collapsed && !mobile ? "justify-center" : "justify-between"
        )}>
          {(!collapsed || mobile) && (
            <Link href="/" className="flex items-center gap-2" aria-label="Home">
              <div className="h-8 w-8 rounded-md bg-[#582873] flex items-center justify-center"></div>
              <span className="font-semibold text-lg">Upskilling Hub</span>
            </Link>
          )}
          {collapsed && !mobile && (
            <Link href="/" className="flex items-center justify-center" aria-label="Home">
              <div className="h-8 w-8 rounded-md bg-[#582873] flex items-center justify-center"></div>
            </Link>
          )}
          {!mobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleCollapsed} 
              className="hidden lg:flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
          {mobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Section 2: Primary Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="grid gap-1 px-2 mb-6">
            {primaryRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "sidebar-item focus:outline-none focus:ring-2 focus:ring-primary", 
                  route.active && "active bg-accent", 
                  collapsed && !mobile && "justify-center px-0"
                )}
                aria-label={collapsed && !mobile ? route.title : undefined}
                tabIndex={0}
              >
                <route.icon className="sidebar-item-icon" />
                {(!collapsed || mobile) && <span>{route.title}</span>}
              </Link>
            ))}
          </nav>
          
          {/* Section 3: Utilities (from former TopBar) */}
          <div className="px-2 mb-6">
            <Separator className="my-2" />
            
            {/* Organization Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 focus:outline-none focus:ring-2 focus:ring-primary",
                    collapsed && !mobile && "justify-center px-0"
                  )}
                  aria-label="Organization settings"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  {(!collapsed || mobile) && (
                    <>
                      <span className="flex-1 text-left">Organization</span>
                      <ChevronsUpDown className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Upskilling Hub</DropdownMenuItem>
                <DropdownMenuItem>Training Division</DropdownMenuItem>
                <DropdownMenuItem>Learning Center</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Utility Items (Search, Notifications) */}
            {utilityItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start mb-1 focus:outline-none focus:ring-2 focus:ring-primary",
                  collapsed && !mobile && "justify-center px-0"
                )}
                onClick={item.onClick}
                aria-label={item.title}
                tabIndex={0}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {(!collapsed || mobile) && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.shortcut && (
                      <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
        
        {/* Section 4: User Menu (at bottom) */}
        <div className="mt-auto border-t pt-2 px-2 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start focus:outline-none focus:ring-2 focus:ring-primary",
                  collapsed && !mobile && "justify-center px-0"
                )}
                aria-label="User menu"
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
                </Avatar>
                {(!collapsed || mobile) && <span className="flex-1 text-left">John Doe</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile" passHref legacyBehavior>
                <DropdownMenuItem asChild>
                  <a className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </a>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings" passHref legacyBehavior>
                <DropdownMenuItem asChild>
                  <a className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </DropdownMenuItem>
              </Link>
              <Link href="/help" passHref legacyBehavior>
                <DropdownMenuItem asChild>
                  <a className="w-full cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </a>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile sidebar (Sheet/Drawer) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent mobile={true} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar (fixed) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col border-r bg-background transition-width duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent />
      </aside>
      
      {/* Command Dialog for search */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
