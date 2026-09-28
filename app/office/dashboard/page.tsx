import type { Metadata } from "next"
import Link from "next/link"
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatKyats } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

import { BestSellersChart } from "./best-sellers-chart"
import { RevenueChart, type RevenueDay } from "./revenue-chart"
import { Sparkline, type SparkPoint } from "./sparkline"
import { StatusChart } from "./status-chart"

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

  const days = new Map<string, RevenueDay>()
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

  const daily = [...days.values()]
  const pending =
    openOrders.find((row) => row.status === "pending")?._count ?? 0
  const packing =
    openOrders.find((row) => row.status === "packing")?._count ?? 0

  const stats: {
    label: string
    value: string
    change: number | null
    spark: SparkPoint[]
    unit: "kyats" | "count"
  }[] = [
    {
      label: "Revenue",
      value: formatKyats(revenue),
      change: percentChange(revenue, previousRevenue),
      spark: daily.map((day) => ({ date: day.date, value: day.revenue })),
      unit: "kyats",
    },
    {
      label: "Orders",
      value: String(currentSales.length),
      change: percentChange(currentSales.length, previousSales.length),
      spark: daily.map((day) => ({ date: day.date, value: day.orders })),
      unit: "count",
    },
    {
      label: "Average order",
      value: formatKyats(averageOrder),
      change: percentChange(averageOrder, previousAverage),
      // Days without orders have no average, so leave a gap instead of a dip to 0.
      spark: daily.map((day) => ({
        date: day.date,
        value: day.orders ? Math.round(day.revenue / day.orders) : null,
      })),
      unit: "kyats",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm" className="pb-0">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl">
                {stat.value}
              </CardTitle>
              <ChangeNote change={stat.change} />
            </CardHeader>
            <div className="mt-auto">
              <Sparkline
                data={stat.spark}
                label={stat.label}
                unit={stat.unit}
              />
            </div>
          </Card>
        ))}

        <Card size="sm">
          <CardHeader>
            <CardDescription>
              <Link
                href="/office/orders?status=pending"
                className="hover:text-foreground"
              >
                To fulfil
              </Link>
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl">
              {pending + packing}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Waiting to ship</p>
          </CardHeader>
          <CardContent className="mt-auto flex flex-col gap-2.5">
            <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
              {pending > 0 && (
                <div className="bg-rose-500" style={{ flexGrow: pending }} />
              )}
              {packing > 0 && (
                <div className="bg-violet-500" style={{ flexGrow: packing }} />
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-500" />
                <span className="text-foreground tabular-nums">
                  {pending}
                </span>{" "}
                pending
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-violet-500" />
                <span className="text-foreground tabular-nums">
                  {packing}
                </span>{" "}
                packing
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily revenue</CardTitle>
          <CardDescription>
            Last {RANGE_DAYS} days · excludes cancelled and refunded
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-(--card-spacing)">
          <RevenueChart data={[...days.values()]} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
            <CardDescription>{current.length} orders placed</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart data={statusCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best sellers</CardTitle>
            <CardDescription>
              Pieces sold in the last {RANGE_DAYS} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <>
                <BestSellersChart data={topProducts} />
                {bestSellers.length > TOP_PRODUCTS && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Top {TOP_PRODUCTS} of {bestSellers.length} products sold
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChangeNote({ change }: { change: number | null }) {
  if (change === null) {
    return (
      <p className="text-xs text-muted-foreground">Last {RANGE_DAYS} days</p>
    )
  }
  const up = change >= 0
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium tabular-nums",
          up
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        )}
      >
        {up ? (
          <IconArrowUpRight className="size-3" />
        ) : (
          <IconArrowDownRight className="size-3" />
        )}
        {up ? "+" : ""}
        {change}%
      </span>
      vs prev. {RANGE_DAYS}d
    </p>
  )
}
