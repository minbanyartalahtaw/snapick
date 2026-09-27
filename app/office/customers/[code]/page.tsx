import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BackButton } from "@/components/back-button"
import { Badge } from "@/components/ui/badge"
import type { DeliveryStatus } from "@/lib/generated/prisma/client"
import { formatDate, formatKyats } from "@/lib/format"
import { prisma } from "@/lib/prisma"

import { CustomerAvatar } from "../customer-avatar"

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

  const details = [
    { label: "Phone", value: customer.phone, mono: true },
    { label: "City", value: customer.city },
    { label: "Address", value: customer.address },
    { label: "Note", value: customer.note },
    { label: "Joined", value: formatDate(customer.createdAt), mono: true },
  ].filter((detail) => detail.value)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col items-start gap-3">
        <BackButton fallback="/office/customers" />
        <div className="flex items-center gap-4">
          <CustomerAvatar name={customer.name} className="size-14" />
          <div className="min-w-0">
            <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">
              {customer.name}
            </h1>
            <p className="font-mono text-sm text-muted-foreground">
              {customer.code}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border p-4">
          <p className="text-xs text-muted-foreground">Orders</p>
          <p className="text-xl font-semibold tabular-nums">
            {customer.orders.length}
          </p>
        </div>
        <div className="rounded-2xl border p-4">
          <p className="text-xs text-muted-foreground">Total spent</p>
          <p className="text-xl font-semibold tabular-nums">
            {formatKyats(totalSpent)}
          </p>
        </div>
      </div>

      <dl className="divide-y rounded-2xl border">
        {details.map((detail) => (
          <div key={detail.label} className="flex gap-4 px-4 py-3 text-sm">
            <dt className="w-20 shrink-0 text-muted-foreground">
              {detail.label}
            </dt>
            <dd className={detail.mono ? "font-mono" : undefined}>
              {detail.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Orders</h2>
        {customer.orders.length > 0 ? (
          <ul className="divide-y rounded-2xl border">
            {customer.orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
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
