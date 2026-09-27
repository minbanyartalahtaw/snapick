"use client"

import { useTransition } from "react"
import { IconChevronDown } from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { updateOrderStatus } from "./actions"

const statuses = [
  { value: "pending", label: "Pending", dot: "bg-rose-500", badge: "bg-rose-100 text-rose-800" },
  { value: "packing", label: "Packing", dot: "bg-violet-500", badge: "bg-violet-100 text-violet-800" },
  { value: "shipped", label: "Shipped", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-900" },
  { value: "delivered", label: "Delivered", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800" },
  { value: "cancelled", label: "Cancelled", dot: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-600" },
] as const

export function StatusMenu({
  orderId,
  status,
  variant = "menu",
}: {
  orderId: number
  status: string
  variant?: "menu" | "badge"
}) {
  const current = statuses.find((item) => item.value === status) ?? statuses[0]
  const [pending, startTransition] = useTransition()
  const badge = variant === "badge"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        className={cn(
          "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50",
          badge ? current.badge : "border bg-background"
        )}
      >
        <span className={cn("size-1.5 rounded-full", current.dot)} />
        {current.label}
        {!badge && <IconChevronDown className="size-3 text-muted-foreground" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {statuses.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() =>
              startTransition(() => updateOrderStatus(orderId, item.value))
            }
          >
            <span className={cn("size-1.5 rounded-full", item.dot)} />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
