"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
  const pathname = usePathname()

  if (pathname === "/") {
    return null
  }

  // Split the pathname and remove empty strings
  const pathSegments = pathname.split("/").filter(Boolean)

  // Create breadcrumb items
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Build the URL for this breadcrumb
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`

    // Format the segment for display (capitalize, replace hyphens with spaces)
    const label = segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

    return { href, label }
  })

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-foreground">
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="mx-1 h-4 w-4" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">{breadcrumb.label}</span>
          ) : (
            <Link href={breadcrumb.href} className="hover:text-foreground">
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
