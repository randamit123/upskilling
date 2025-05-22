"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { HTMLAttributes } from "react"

interface SortableItemProps extends HTMLAttributes<HTMLDivElement> {
  id: string
}

export function SortableItem({ id, children, ...props }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} {...props}>
      {children}
    </div>
  )
}
