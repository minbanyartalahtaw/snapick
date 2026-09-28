"use client"

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type StatusCount = { status: string; count: number }

const chartConfig = {
  count: { label: "Orders" },
  pending: { label: "Pending", color: "var(--color-rose-500)" },
  packing: { label: "Packing", color: "var(--color-violet-500)" },
  shipped: { label: "Shipped", color: "var(--color-amber-500)" },
  delivered: { label: "Delivered", color: "var(--color-emerald-500)" },
  cancelled: { label: "Cancelled", color: "var(--color-zinc-400)" },
} satisfies ChartConfig

export function StatusChart({ data }: { data: StatusCount[] }) {
  const rows = data.map((row) => ({
    ...row,
    fill: `var(--color-${row.status})`,
  }))

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 32 }}>
        <YAxis
          dataKey="status"
          type="category"
          width={72}
          tickLine={false}
          axisLine={false}
          tickFormatter={(status: string) =>
            String(
              chartConfig[status as keyof typeof chartConfig]?.label ?? status
            )
          }
        />
        <XAxis dataKey="count" type="number" hide allowDecimals={false} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent nameKey="status" hideLabel />}
        />
        <Bar dataKey="count" radius={4} barSize={20}>
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            className="fill-foreground tabular-nums"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
