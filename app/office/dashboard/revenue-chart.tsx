"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatKyats } from "@/lib/format"

export type RevenueDay = { date: string; revenue: number; orders: number }

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--primary)" },
} satisfies ChartConfig

const dayLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
})

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

function formatDay(date: string) {
  return dayLabel.format(new Date(`${date}T00:00:00Z`))
}

export function RevenueChart({ data }: { data: RevenueDay[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ left: 0, right: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={formatDay}
        />
        <YAxis
          width={40}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => compact.format(value)}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(label) => formatDay(String(label))}
              formatter={(value, _name, item) => (
                <div className="grid w-full gap-1">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium tabular-nums">
                      {formatKyats(Number(value))}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Orders</span>
                    <span className="font-medium tabular-nums">
                      {(item.payload as RevenueDay).orders}
                    </span>
                  </div>
                </div>
              )}
            />
          }
        />
        <Bar
          dataKey="revenue"
          fill="var(--color-revenue)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
