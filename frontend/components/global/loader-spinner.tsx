import { cn } from "@/lib/utils"

interface LoaderSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoaderSpinner({ className, size = "md" }: LoaderSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-primary border-t-transparent",
          sizeClasses[size],
          className,
        )}
      />
    </div>
  )
}
