"use client"

import { useState } from "react"
import { IconLayoutGrid, IconTable } from "@tabler/icons-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type OrdersViewMode = "card" | "table"

export function OrdersViewToggle({ initialView }: { initialView: OrdersViewMode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [view, setView] = useState(initialView)

  function changeView(next: OrdersViewMode) {
    setView(next)
    const params = new URLSearchParams(searchParams)
    if (next === "table") params.set("view", "table")
    else params.delete("view")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      spacing={0}
      value={[view]}
      onValueChange={(value) => {
        const next = value[0] as OrdersViewMode | undefined
        if (next) changeView(next)
      }}
    >
      <ToggleGroupItem value="card" aria-label="Card view">
        <IconLayoutGrid />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <IconTable />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
