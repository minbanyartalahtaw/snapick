"use client"

import { useState } from "react"
import {
  IconChevronRight,
  IconLayoutList,
  IconTable,
} from "@tabler/icons-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Product } from "@/lib/generated/prisma/client"
import { SearchHighlight } from "@/components/search-highlight"
import { formatKyats } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ProductSheet } from "./product-sheet"

export type ProductsViewMode = "list" | "table"

function units(stock: number) {
  return stock === 1 ? "unit" : "units"
}

function groupByLetter(products: Product[]) {
  const groups = new Map<string, Product[]>()
  for (const product of products) {
    const first = product.name.charAt(0).toUpperCase()
    const letter = /[A-Z]/.test(first) ? first : "#"
    groups.set(letter, [...(groups.get(letter) ?? []), product])
  }
  return [...groups.entries()]
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-muted-foreground/40"
        )}
      />
      {active ? "Active" : "Hidden"}
    </span>
  )
}

function StockText({ stock }: { stock: number }) {
  return (
    <span className={cn(stock === 0 && "text-destructive")}>
      <span
        className={cn(
          "font-medium tabular-nums",
          stock === 0 ? "text-destructive" : "text-foreground"
        )}
      >
        {stock}
      </span>{" "}
      {units(stock)}
    </span>
  )
}

function ProductList({
  products,
  query,
  onSelect,
}: {
  products: Product[]
  query: string
  onSelect: (product: Product) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      {groupByLetter(products).map(([letter, items]) => (
        <section key={letter}>
          <h2 className="bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            {letter}
          </h2>
          <ul className="divide-y">
            {items.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => onSelect(product)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate text-sm font-medium">
                        <SearchHighlight text={product.name} query={query} />
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        <SearchHighlight text={product.sku} query={query} />
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <StockText stock={product.stock} />
                      <span aria-hidden>·</span>
                      <span className="font-medium text-foreground tabular-nums">
                        {formatKyats(product.price)}
                      </span>
                      <span aria-hidden>·</span>
                      <StatusDot active={product.isActive} />
                    </div>
                  </div>
                  <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function ProductTable({
  products,
  query,
  onSelect,
}: {
  products: Product[]
  query: string
  onSelect: (product: Product) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="pl-4">Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="pr-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              tabIndex={0}
              onClick={() => onSelect(product)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onSelect(product)
                }
              }}
              className="cursor-pointer outline-none focus-visible:bg-muted/50"
            >
              <TableCell className="pl-4 font-medium">
                <SearchHighlight text={product.name} query={query} />
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                <SearchHighlight text={product.sku} query={query} />
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  product.stock === 0 && "text-destructive"
                )}
              >
                {product.stock}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatKyats(product.price)}
              </TableCell>
              <TableCell className="pr-4">
                <StatusDot active={product.isActive} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function ProductsView({
  products,
  view: initialView,
}: {
  products: Product[]
  view: ProductsViewMode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [view, setView] = useState(initialView)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const query = searchParams.get("q")?.trim() ?? ""
  const selected = products.find((product) => product.id === selectedId) ?? null

  function changeView(next: ProductsViewMode) {
    setView(next)
    const params = new URLSearchParams(searchParams)
    if (next === "table") params.set("view", "table")
    else params.delete("view")
    const nextQuery = params.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
  }

  function select(product: Product) {
    setSelectedId(product.id)
    setFormKey((key) => key + 1)
    setOpen(true)
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          value={[view]}
          onValueChange={(value) => {
            const next = value[0] as ProductsViewMode | undefined
            if (next) changeView(next)
          }}
        >
          <ToggleGroupItem value="list" aria-label="List view">
            <IconLayoutList />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <IconTable />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {products.length > 0 &&
        (view === "table" ? (
          <ProductTable products={products} query={query} onSelect={select} />
        ) : (
          <ProductList products={products} query={query} onSelect={select} />
        ))}

      <ProductSheet
        product={selected}
        formKey={formKey}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
