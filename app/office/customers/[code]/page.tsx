import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { IconPencil } from "@tabler/icons-react"

import { BackButton } from "@/components/back-button"
import { Badge } from "@/components/ui/badge"
import type { DeliveryStatus } from "@/lib/generated/prisma/client"
import { formatDate, formatKyats } from "@/lib/format"
import { prisma } from "@/lib/prisma"

import { CustomerAvatar, TrustBadge } from "../customer-avatar"

type Props = { params: Promise<{ code: string }> }

function getCustomer(code: string) {
  return prisma.customer.findUnique({
    where: { code: decodeURIComponent(code) },
    include: { orders: { orderBy: { placedAt: "desc" } } },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const customer = await getCustomer((await params).code)
  return { title: `${customer?.name ?? "Customer"} | Snapick` }
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const variant =
    status === "cancelled"
      ? "destructive"
      : status === "delivered"
        ? "outline"
        : "secondary"
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  )
}

export default async function CustomerPage({ params }: Props) {
  const customer = await getCustomer((await params).code)

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

  const details: { label: string; value: string | null; mono?: boolean; fallback?: boolean }[] = [
    { label: "Name", value: customer.name },
    { label: "Mobile", value: customer.phone, mono: true },
    { label: "City", value: customer.city },
    { label: "Address", value: customer.address },
    { label: "Note", value: customer.note, fallback: true },
    { label: "Added", value: formatDay(customer.createdAt), mono: true },
  ]

  const stats = [
    { label: "Orders", value: String(customer.orders.length) },
    { label: "Spent", value: formatKyats(totalSpent) },
    { label: "Last order", value: lastOrder ? formatDay(lastOrder.placedAt) : "—" },
  ]

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <BackButton fallback="/office/customers" />

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center gap-4 p-5">
          <CustomerAvatar customer={customer} className="size-14 text-base" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {customer.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <p className="inline-flex rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                {customer.code}
              </p>
              <TrustBadge trust={customer.trust} className="py-1" />
            </div>
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
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Details
          </p>
          <Link
            href={`/office/customers/${customer.code}/edit`}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/50"
          >
            <IconPencil className="size-3.5" />
            Edit
          </Link>
        </div>
        <dl className="divide-y overflow-hidden rounded-2xl border bg-card">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="flex items-start justify-between gap-6 px-4 py-3.5 text-sm"
            >
              <dt className="shrink-0 pt-0.5 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
                {detail.label}
              </dt>
              <dd
                className={
                  detail.mono
                    ? "text-right font-mono break-words"
                    : "text-right break-words"
                }
              >
                {detail.value || (detail.fallback ? "—" : null)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Orders</h2>
        {customer.orders.length > 0 ? (
          <ul className="divide-y rounded-2xl border">
            {customer.orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/office/orders/${order.code}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                >
                <div className="min-w-0 flex-1">
                  <p className="font-mono font-medium">{order.code}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatDate(order.placedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-medium tabular-nums">
                    {formatKyats(order.total)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border px-4 py-6 text-center text-sm text-muted-foreground">
            No orders yet.
          </p>
        )}
      </section>
    </div>
  )
}
