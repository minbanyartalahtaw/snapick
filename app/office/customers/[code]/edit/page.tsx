import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { IconPencil } from "@tabler/icons-react"

import { BackButton } from "@/components/back-button"
import { formatKyats } from "@/lib/format"
import { prisma } from "@/lib/prisma"

import { CustomerAvatar } from "../../customer-avatar"
import { EditCustomerForm } from "./edit-customer-form"

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = decodeURIComponent((await params).code)
  return { title: `Edit ${code} | Snapick` }
}

export default async function EditCustomerPage({ params }: Props) {
  const code = decodeURIComponent((await params).code)
  const customer = await prisma.customer.findUnique({
    where: { code },
    include: { orders: { orderBy: { placedAt: "desc" } } },
  })

  if (!customer) {
    notFound()
  }

  const totalSpent = customer.orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0)
  const lastOrder = customer.orders[0]
  const formatDay = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Yangon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)

  const stats = [
    { label: "Orders", value: String(customer.orders.length) },
    { label: "Spent", value: formatKyats(totalSpent) },
    {
      label: "Last order",
      value: lastOrder ? formatDay(lastOrder.placedAt) : "—",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <BackButton fallback={`/office/customers/${customer.code}`} />

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center gap-4 p-5">
          <span className="relative shrink-0">
            <CustomerAvatar name={customer.name} className="size-14 text-base" />
            <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border border-border bg-muted">
              <IconPencil className="size-3 text-muted-foreground" />
            </span>
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {customer.name}
            </h1>
            <p className="mt-1 inline-flex rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              {customer.code}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x border-t">
          {stats.map((stat) => (
            <div key={stat.label} className="px-2 py-4 text-center">
              <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="mt-1.5 text-sm font-semibold tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Details
        </p>
        <EditCustomerForm
          code={customer.code}
          initial={{
            name: customer.name,
            phone: customer.phone,
            city: customer.city,
            address: customer.address,
            note: customer.note,
          }}
        />
      </div>
    </div>
  )
}
