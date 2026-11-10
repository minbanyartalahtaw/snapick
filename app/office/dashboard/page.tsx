import type { Metadata } from "next"
import Link from "next/link"
import { IconChevronRight, IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

import {
  OverviewPanel,
  type OverviewDay,
  type OverviewMetric,
} from "./overview-panel"

export const metadata: Metadata = {
  title: "Dashboard | Snapick",
}

const RANGE_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000
const TOP_PRODUCTS = 5
const STATUSES = [
  "pending",
  "packing",
  "shipped",
  "delivered",
  "cancelled",
] as const

const STATUS_STYLES: Record<
  (typeof STATUSES)[number],
  { label: string; dot: string }
> = {
  pending: { label: "Pending", dot: "bg-rose-500" },
  packing: { label: "Packing", dot: "bg-violet-500" },
  shipped: { label: "Shipped", dot: "bg-amber-500" },
  delivered: { label: "Delivered", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", dot: "bg-zinc-400" },
}

const amount = new Intl.NumberFormat("en-US")

const rangeDay = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Yangon",
  month: "short",
  day: "numeric",
})

const yangonDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Yangon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

// Orders that brought in money: not cancelled and not refunded.
function countsAsSale(order: { status: string; paymentMethod: string }) {
  return order.status !== "cancelled" && order.paymentMethod !== "refunded"
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export default async function DashboardPage() {
  const todayStart = new Date(`${yangonDay.format(new Date())}T00:00:00+06:30`)
  const rangeStart = new Date(todayStart.getTime() - (RANGE_DAYS - 1) * DAY_MS)
  const previousStart = new Date(rangeStart.getTime() - RANGE_DAYS * DAY_MS)

  const [orders, openOrders, items] = await Promise.all([
    prisma.order.findMany({
      where: { placedAt: { gte: previousStart } },
      select: {
        placedAt: true,
        total: true,
        status: true,
        paymentMethod: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { status: { in: ["pending", "packing"] } },
      _count: true,
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          placedAt: { gte: rangeStart },
          status: { not: "cancelled" },
          paymentMethod: { not: "refunded" },
        },
      },
      select: { name: true, quantity: true },
    }),
  ])

  const current = orders.filter((order) => order.placedAt >= rangeStart)
  const previous = orders.filter((order) => order.placedAt < rangeStart)
  const currentSales = current.filter(countsAsSale)
  const previousSales = previous.filter(countsAsSale)

  const revenue = currentSales.reduce((sum, order) => sum + order.total, 0)
  const previousRevenue = previousSales.reduce(
    (sum, order) => sum + order.total,
    0
  )
  const averageOrder = currentSales.length
    ? Math.round(revenue / currentSales.length)
    : 0

  const days = new Map<string, Omit<OverviewDay, "average">>()
  for (let i = 0; i < RANGE_DAYS; i++) {
    const date = yangonDay.format(new Date(rangeStart.getTime() + i * DAY_MS))
    days.set(date, { date, revenue: 0, orders: 0 })
  }
  for (const order of currentSales) {
    const day = days.get(yangonDay.format(order.placedAt))
    if (!day) continue
    day.revenue += order.total
    day.orders += 1
  }

  const statusCounts = STATUSES.map((status) => ({
    status,
    count: current.filter((order) => order.status === status).length,
  }))

  const sold = new Map<string, number>()
  for (const item of items) {
    sold.set(item.name, (sold.get(item.name) ?? 0) + item.quantity)
  }
  const bestSellers = [...sold]
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
  const topProducts = bestSellers.slice(0, TOP_PRODUCTS)

  const previousAverage = previousSales.length
    ? Math.round(previousRevenue / previousSales.length)
    : 0

  const daily: OverviewDay[] = [...days.values()].map((day) => ({
    ...day,
    average: day.orders ? Math.round(day.revenue / day.orders) : null,
  }))
  const pending =
    openOrders.find((row) => row.status === "pending")?._count ?? 0
  const packing =
    openOrders.find((row) => row.status === "packing")?._count ?? 0
  const toFulfil = pending + packing
  const rangeLabel = `${rangeDay.format(rangeStart)} – ${rangeDay.format(todayStart)}`
  const topQuantity = topProducts[0]?.quantity ?? 0

  const metrics: OverviewMetric[] = [
    {
      key: "revenue",
      label: "Revenue",
      value: amount.format(revenue),
      unit: "Ks",
      change: percentChange(revenue, previousRevenue),
    },
    {
      key: "orders",
      label: "Orders",
      value: amount.format(currentSales.length),
      change: percentChange(currentSales.length, previousSales.length),
    },
    {
      key: "average",
      label: "Avg. order",
      value: amount.format(averageOrder),
      unit: "Ks",
      change: percentChange(averageOrder, previousAverage),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-sm text-muted-foreground">
          {toFulfil > 0 ? (
            <>
              <span className="font-semibold text-foreground tabular-nums">
                {toFulfil}
              </span>{" "}
              {toFulfil === 1 ? "order" : "orders"} to fulfil
            </>
          ) : (
            "Nothing waiting to ship"
          )}
        </p>
        {toFulfil > 0 && (
          <div className="order-last flex w-full items-center gap-1.5 sm:order-none sm:w-auto">
            <FulfilLink status="pending" count={pending} />
            <FulfilLink status="packing" count={packing} />
          </div>
        )}
        <Button
          className="ml-auto shrink-0"
          nativeButton={false}
          render={<Link href="/office/orders/new" />}
        >
          <IconPlus />
          New order
        </Button>
      </div>

      <OverviewPanel
        metrics={metrics}
        data={daily}
        rangeDays={RANGE_DAYS}
        rangeLabel={rangeLabel}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Orders by status"
          note={`${current.length} placed · last ${RANGE_DAYS} days`}
        >
          <div className="px-4 pb-4 sm:px-5">
            <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
              {statusCounts.map(
                (row) =>
                  row.count > 0 && (
                    <div
                      key={row.status}
                      className={STATUS_STYLES[row.status].dot}
                      style={{ flexGrow: row.count }}
                    />
                  )
              )}
            </div>
          </div>
          <ul className="divide-y border-t">
            {statusCounts.map((row) => (
              <li
                key={row.status}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm sm:px-5"
              >
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    STATUS_STYLES[row.status].dot
                  )}
                />
                <span className="min-w-0 flex-1 truncate">
                  {STATUS_STYLES[row.status].label}
                </span>
                <span className="font-medium tabular-nums">{row.count}</span>
                <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                  {current.length
                    ? Math.round((row.count / current.length) * 100)
                    : 0}
                  %
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Best sellers"
          note={`Pieces sold · last ${RANGE_DAYS} days`}
        >
          {topProducts.length === 0 ? (
            <p className="border-t px-4 py-6 text-center text-sm text-muted-foreground sm:px-5">
              No sales yet.
            </p>
          ) : (
            <>
              <ol className="divide-y border-t">
                {topProducts.map((product, index) => (
                  <li
                    key={product.name}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm sm:px-5"
                  >
                    <span className="w-4 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {product.name}
                    </span>
                    <span className="hidden h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-muted sm:block xl:w-40">
                      <span
                        className="block h-full rounded-full bg-foreground/60"
                        style={{
                          width: `${(product.quantity / topQuantity) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right font-medium tabular-nums">
                      {product.quantity}
                    </span>
                  </li>
                ))}
              </ol>
              {bestSellers.length > TOP_PRODUCTS && (
                <p className="border-t px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
                  Top {TOP_PRODUCTS} of {bestSellers.length} products sold
                </p>
              )}
            </>
          )}
        </Panel>
      </div>
    </div>
  )
}

function FulfilLink({
  status,
  count,
}: {
  status: "pending" | "packing"
  count: number
}) {
  return (
    <Link
      href={`/office/orders?status=${status}`}
      className="inline-flex h-7 items-center gap-1.5 rounded-full border pr-1.5 pl-2.5 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30"
    >
      <span
        className={cn("size-1.5 rounded-full", STATUS_STYLES[status].dot)}
      />
      {STATUS_STYLES[status].label}
      <span className="font-medium tabular-nums">{count}</span>
      <IconChevronRight className="size-3.5 text-muted-foreground" />
    </Link>
  )
}

function Panel({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 pt-4 pb-3.5 sm:px-5">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
      {children}
    </section>
  )
}
