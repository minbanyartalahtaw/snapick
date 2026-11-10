"use client"

import { useState } from "react"
import { Tabs } from "@base-ui/react/tabs"
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatKyats } from "@/lib/format"
import { cn } from "@/lib/utils"

export type OverviewMetricKey = "revenue" | "orders" | "average"

export type OverviewDay = {
  date: string
  revenue: number
  orders: number
  average: number | null
}

export type OverviewMetric = {
  key: OverviewMetricKey
  label: string
  value: string
  unit?: string
  change: number | null
}

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--primary)" },
  orders: { label: "Orders", color: "var(--primary)" },
  average: { label: "Average order", color: "var(--primary)" },
} satisfies ChartConfig

const chartTitles: Record<OverviewMetricKey, string> = {
  revenue: "Daily revenue",
  orders: "Daily orders",
  average: "Average order by day",
}

const tickLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
})

const tooltipLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
})

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

function toDate(date: string) {
  return new Date(`${date}T00:00:00Z`)
}

export function OverviewPanel({
  metrics,
  data,
  rangeDays,
  rangeLabel,
}: {
  metrics: OverviewMetric[]
  data: OverviewDay[]
  rangeDays: number
  rangeLabel: string
}) {
  const [metric, setMetric] = useState<OverviewMetricKey>("revenue")

  return (
    <Tabs.Root
      value={metric}
      onValueChange={(value) => setMetric(value as OverviewMetricKey)}
      className="overflow-hidden rounded-2xl border bg-card"
    >
      <Tabs.List className="grid grid-cols-3 divide-x border-b">
        {metrics.map((item) => (
          <Tabs.Tab
            key={item.key}
            value={item.key}
            className="relative flex min-w-0 flex-col items-start gap-1.5 bg-muted/40 px-3 py-3.5 text-left transition-colors outline-none after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-primary after:opacity-0 after:transition-opacity hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset sm:px-5 sm:py-4 dark:bg-background/50 dark:hover:bg-background/20 data-active:bg-card data-active:after:opacity-100 data-active:hover:bg-card dark:data-active:bg-card dark:data-active:hover:bg-card"
          >
            <span className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              {item.label}
            </span>
            <span className="flex max-w-full flex-wrap items-baseline gap-x-1 text-base font-semibold tracking-tight tabular-nums sm:text-2xl">
              <span>{item.value}</span>
              {item.unit && (
                <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {item.unit}
                </span>
              )}
            </span>
            <ChangeNote change={item.change} rangeDays={rangeDays} />
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value={metric} className="outline-none">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 pt-4 sm:px-5">
          <h2 className="text-sm font-medium">{chartTitles[metric]}</h2>
          <p className="text-xs text-muted-foreground">
            {rangeLabel} · excludes cancelled and refunded
          </p>
        </div>
        <div className="px-2 pt-4 pb-3 sm:px-4">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-56 w-full sm:h-72"
          >
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(date: string) => tickLabel.format(toDate(date))}
              />
              <YAxis
                width={40}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tickFormatter={(value: number) => compact.format(value)}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)" }}
                content={
                  <ChartTooltipContent
                    hideIndicator
                    labelFormatter={(label) =>
                      tooltipLabel.format(toDate(String(label)))
                    }
                    formatter={(_value, _name, item) => {
                      const day = item.payload as OverviewDay
                      return (
                        <div className="grid w-full gap-1">
                          <TooltipRow
                            label="Revenue"
                            value={formatKyats(day.revenue)}
                          />
                          <TooltipRow
                            label="Orders"
                            value={String(day.orders)}
                          />
                          {day.average !== null && (
                            <TooltipRow
                              label="Average"
                              value={formatKyats(day.average)}
                            />
                          )}
                        </div>
                      )
                    }}
                  />
                }
              />
              <Bar
                dataKey={metric}
                fill={`var(--color-${metric})`}
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </Tabs.Panel>
    </Tabs.Root>
  )
}

function TooltipRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

function ChangeNote({
  change,
  rangeDays,
}: {
  change: number | null
  rangeDays: number
}) {
  if (change === null) {
    return (
      <span className="text-xs text-muted-foreground">No earlier data</span>
    )
  }
  const up = change >= 0
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium tabular-nums",
          up
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        )}
      >
        {up ? (
          <IconArrowUpRight className="size-3.5" />
        ) : (
          <IconArrowDownRight className="size-3.5" />
        )}
        {Math.abs(change)}%
      </span>
      <span className="hidden sm:inline">vs previous {rangeDays} days</span>
    </span>
  )
}
