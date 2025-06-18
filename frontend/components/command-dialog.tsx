"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog as UICommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  BookOpen,
  Route,
  FileCheck,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Search,
} from "lucide-react"

interface CommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandDialog({ open, onOpenChange }: CommandDialogProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const runCommand = (command: () => void) => {
    onOpenChange(false)
    command()
  }

  if (!mounted) {
    return null
  }

  return (
    <UICommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Core Modules">
          <CommandItem onSelect={() => runCommand(() => router.push("/courses"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Course Development</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/learning-path"))}>
            <Route className="mr-2 h-4 w-4" />
            <span>Learning Paths</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/assessments"))}>
            <FileCheck className="mr-2 h-4 w-4" />
            <span>Assessments</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/impact"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Impact Analytics</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/help"))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help</span>
            <CommandShortcut>⌘H</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Search">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search All Content</span>
            <CommandShortcut>⌘⇧F</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </UICommandDialog>
  )
}
