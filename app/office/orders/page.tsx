import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { IconNote, IconPlus, IconReceipt } from "@tabler/icons-react"

import { LiveSearch } from "@/components/live-search"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SearchHighlight } from "@/components/search-highlight"
import type { DeliveryStatus } from "@/lib/generated/prisma/client"
import { formatDate, formatKyats } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

import { OrdersTable } from "./orders-table"
import { OrdersViewToggle, type OrdersViewMode } from "./orders-view-toggle"
import { StatusMenu } from "./status-menu"

export const metadata: Metadata = {
  title: "Orders | Snapick",
}

const PAGE_SIZE = 12

const filters = [
  { value: "pending", label: "Pending", dot: "bg-rose-500" },
  { value: "packing", label: "Packing", dot: "bg-violet-500" },
  { value: "shipped", label: "Shipped", dot: "bg-amber-500" },
  { value: "delivered", label: "Delivered", dot: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", dot: "bg-muted-foreground" },
] as const

function isStatus(value: string | undefined): value is DeliveryStatus {
  return filters.some((filter) => filter.value === value)
}

function ordersHref({
  q,
  status,
  page,
  view,
}: {
  q: string
  status?: string
  page?: number
  view?: OrdersViewMode
}) {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (status) params.set("status", status)
  if (view === "table") params.set("view", "table")
  if (page && page > 1) params.set("page", String(page))
  const search = params.toString()
  return search ? `/office/orders?${search}` : "/office/orders"
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; view?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() ?? ""
  const view: OrdersViewMode = params.view === "table" ? "table" : "card"
  const phoneQuery = query.replace(/[\s-]/g, "")
  const status = isStatus(params.status) ? params.status : undefined
  const requested = Number(params.page)
  const requestedPage =
    Number.isInteger(requested) && requested > 0 ? requested : 1

  const searchWhere = query
    ? {
        OR: [
          { code: { contains: query, mode: "insensitive" as const } },
          { customerName: { contains: query, mode: "insensitive" as const } },
          { address: { contains: query, mode: "insensitive" as const } },
          ...(phoneQuery ? [{ phone: { contains: phoneQuery } }] : []),
        ],
      }
    : undefined

  const where = { ...searchWhere, ...(status ? { status } : {}) }

  const [grouped, total] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: searchWhere,
      _count: { _all: true },
    }),
    prisma.order.count({ where }),
  ])

  const counts = Object.fromEntries(
    grouped.map((group) => [group.status, group._count._all])
  ) as Partial<Record<DeliveryStatus, number>>
  const allCount = Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0)
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(requestedPage, pageCount)

  const orders = await prisma.order.findMany({
    where,
    orderBy: { placedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { items: { select: { quantity: true } } },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <LiveSearch
          placeholder="Code, name or phone"
          label="Search orders"
          className="sm:max-w-xs"
        />
        <Button
          className="ml-auto shrink-0"
          nativeButton={false}
          render={<Link href="/office/orders/new" />}
        >
          <IconPlus />
          New order
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          <FilterLink
            href={ordersHref({ q: query, view })}
            active={!status}
            label="All"
            count={allCount}
          />
          {filters.map((filter) => (
            <FilterLink
              key={filter.value}
              href={ordersHref({ q: query, status: filter.value, view })}
              active={status === filter.value}
              label={filter.label}
              count={counts[filter.value] ?? 0}
              dot={filter.dot}
            />
          ))}
        </div>
        <Suspense fallback={null}>
          <OrdersViewToggle initialView={view} />
        </Suspense>
      </div>

      {orders.length > 0 ? (
        view === "table" ? (
          <OrdersTable
            query={query}
            orders={orders.map((order) => ({
              id: order.id,
              code: order.code,
              customerName: order.customerName,
              phone: order.phone,
              placedAt: formatDate(order.placedAt),
              itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
              total: order.total,
              status: order.status,
              note: order.note.length > 0,
            }))}
          />
        ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            )
            return (
              <li key={order.id} className="relative rounded-2xl border p-4 transition-colors hover:bg-muted/50">
                <Link
                  href={`/office/orders/${order.code}`}
                  aria-label={`${order.code}, ${order.customerName}`}
                  className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                />
                <div className="pointer-events-none flex h-full gap-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="flex items-center gap-1.5 font-mono text-sm font-medium">
                      <SearchHighlight text={order.code} query={query} />
                      {order.note && (
                        <IconNote
                          className="size-3.5 text-muted-foreground"
                          title={order.note}
                        />
                      )}
                    </p>
                    <p className="mt-2 truncate text-sm font-medium">
                      <SearchHighlight text={order.customerName} query={query} />
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {order.city}
                    </p>
                    <p className="mt-auto pt-3 text-xs text-muted-foreground">
                      Total {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="pointer-events-auto relative z-10 flex shrink-0 flex-col items-end gap-2 text-right">
                    <StatusMenu orderId={order.id} status={order.status} />
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.placedAt)}
                    </p>
                    <p className="font-mono text-sm whitespace-nowrap">
                      <SearchHighlight text={order.phone} query={query} />
                    </p>
                    <p className="mt-auto text-sm font-semibold tabular-nums">
                      {formatKyats(order.total)}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        )
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconReceipt />
            </EmptyMedia>
            <EmptyTitle>No orders found</EmptyTitle>
            <EmptyDescription>
              {query || status ? "Try a different search." : "No orders yet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Page {page} of {pageCount}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            nativeButton={page <= 1}
            render={
              page > 1 ? (
                <Link
                  href={ordersHref({ q: query, status, page: page - 1, view })}
                />
              ) : undefined
            }
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            nativeButton={page >= pageCount}
            render={
              page < pageCount ? (
                <Link
                  href={ordersHref({ q: query, status, page: page + 1, view })}
                />
              ) : undefined
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function FilterLink({
  href,
  active,
  label,
  count,
  dot,
}: {
  href: string
  active: boolean
  label: string
  count: number
  dot?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm",
        active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dot)} />}
      {label}
      <span className="tabular-nums">{count}</span>
    </Link>
  )
}
