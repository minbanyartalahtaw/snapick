"use client"

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type BestSeller = { name: string; quantity: number }

const chartConfig = {
  quantity: { label: "Pieces sold", color: "var(--primary)" },
} satisfies ChartConfig

const NAME_LIMIT = 16

function shortName(name: string) {
  return name.length > NAME_LIMIT ? `${name.slice(0, NAME_LIMIT - 1)}…` : name
}

export function BestSellersChart({ data }: { data: BestSeller[] }) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto w-full"
      style={{ height: data.length * 40 }}
    >
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 32 }}>
        <YAxis
          dataKey="name"
          type="category"
          width={120}
          tickLine={false}
          axisLine={false}
          tickFormatter={shortName}
        />
        <XAxis dataKey="quantity" type="number" hide allowDecimals={false} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar
          dataKey="quantity"
          fill="var(--color-quantity)"
          radius={4}
          barSize={20}
        >
          <LabelList
            dataKey="quantity"
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
