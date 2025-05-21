import { cn } from "@/lib/utils"

interface TagBadgeProps {
  label: string
  color?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "danger" | "info"
  className?: string
}

export function TagBadge({ label, color = "default", className }: TagBadgeProps) {
  const colorClasses = {
    default: "bg-secondary text-secondary-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses[color],
        className,
      )}
    >
      {label}
    </span>
  )
}
