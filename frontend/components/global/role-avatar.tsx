import { cn } from "@/lib/utils"

interface RoleAvatarProps {
  name: string
  role?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RoleAvatar({ name, role, size = "md", className }: RoleAvatarProps) {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  // Generate a deterministic color based on the name
  const colors = [
    "bg-red-100 text-red-800",
    "bg-green-100 text-green-800",
    "bg-blue-100 text-blue-800",
    "bg-yellow-100 text-yellow-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
    "bg-teal-100 text-teal-800",
  ]

  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-medium",
          colors[colorIndex],
          sizeClasses[size],
          className,
        )}
      >
        {initials}
      </div>
      {role && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{role}</span>
        </div>
      )}
    </div>
  )
}
