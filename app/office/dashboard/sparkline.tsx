"use client"

import { useId } from "react"
import { Area, AreaChart, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatKyats } from "@/lib/format"

export type SparkPoint = { date: string; value: number | null }

const dayLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
})

export function Sparkline({
  data,
  label,
  unit = "count",
}: {
  data: SparkPoint[]
  label: string
  unit?: "kyats" | "count"
}) {
  const gradientId = `spark-${useId().replace(/:/g, "")}`
  const chartConfig = {
    value: { label, color: "var(--primary)" },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-14 w-full">
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-value)"
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor="var(--color-value)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, "dataMax"]} />
        <ChartTooltip
          cursor={{ stroke: "var(--border)" }}
          // The card clips overflow, so float the tooltip up over the header.
          allowEscapeViewBox={{ x: false, y: true }}
          position={{ y: -56 }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) => {
                const date = payload?.[0]?.payload?.date as string | undefined
                return date
                  ? dayLabel.format(new Date(`${date}T00:00:00Z`))
                  : ""
              }}
              formatter={(value) => (
                <div className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium tabular-nums">
                    {unit === "kyats"
                      ? formatKyats(Number(value))
                      : Number(value)}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="value"
          type="monotone"
          connectNulls
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
