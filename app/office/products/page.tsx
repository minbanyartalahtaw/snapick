import type { Metadata } from "next"
import Link from "next/link"
import { IconPackageOff, IconPlus, IconSearch } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import type { Product } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

import { ProductsView } from "./products-view"

export const metadata: Metadata = {
  title: "Products | Snapick",
}

function matchesSearch(product: Product, query: string) {
  const q = query.toLowerCase()
  return (
    product.name.toLowerCase().includes(q) ||
    product.sku.toLowerCase().includes(q)
  )
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() ?? ""
  const view = params.view === "table" ? "table" : "list"

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  })
  const visible = query
    ? products.filter((product) => matchesSearch(product, query))
    : products

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <form
          action="/office/products"
          className="relative min-w-0 flex-1 sm:max-w-xs"
        >
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products"
            aria-label="Search products"
            className="pl-9"
          />
          {view === "table" && (
            <input type="hidden" name="view" value="table" />
          )}
        </form>
        <Button
          className="ml-auto shrink-0"
          nativeButton={false}
          render={<Link href="/office/products/new" />}
        >
          <IconPlus />
          New
        </Button>
      </div>

      <ProductsView products={visible} view={view} />

      {visible.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconPackageOff />
            </EmptyMedia>
            <EmptyTitle>No products found</EmptyTitle>
            <EmptyDescription>
              {query ? "Try a different search." : "Your catalog is empty."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
