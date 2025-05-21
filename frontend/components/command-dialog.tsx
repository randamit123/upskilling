"use client"

import { useEffect } from "react"
import {
  CommandDialog as CommandDialogPrimitive,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
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
  Settings,
  User,
  HelpCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface CommandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandDialog({ open, onOpenChange }: CommandDialogProps) {
  const router = useRouter()

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(true)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [onOpenChange])

  const runCommand = (command: () => void) => {
    onOpenChange(false)
    command()
  }

  return (
    <CommandDialogPrimitive open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Modules">
          <CommandItem onSelect={() => runCommand(() => router.push("/courses"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Course Development</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/microlearning"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Microlearning Modules</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/survey"))}>
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>Evaluation Survey Builder</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/learning-path"))}>
            <Route className="mr-2 h-4 w-4" />
            <span>Skills-Based Learning Paths</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/roles"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Role-Specific Paths</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/assessments"))}>
            <FileCheck className="mr-2 h-4 w-4" />
            <span>Assessment Generation</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/knowledge"))}>
            <Database className="mr-2 h-4 w-4" />
            <span>Knowledge Extraction</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/tagging"))}>
            <Tags className="mr-2 h-4 w-4" />
            <span>Content Tagging</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/comms"))}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Learner Communications</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/impact"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Training Impact</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => router.push("/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Help">
          <CommandItem onSelect={() => runCommand(() => window.open("https://help.upskilling.com", "_blank"))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Documentation</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialogPrimitive>
  )
}
