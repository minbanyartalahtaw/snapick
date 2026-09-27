import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { formatStamp } from "@/lib/format"
import { prisma } from "@/lib/prisma"

import { OrderDetailView } from "./order-detail"

type Props = { params: Promise<{ code: string }> }

function getOrder(code: string) {
  return prisma.order.findUnique({
    where: { code: decodeURIComponent(code) },
    include: {
      items: { orderBy: { id: "asc" } },
      statusEvents: { orderBy: { changedAt: "asc" } },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = await getOrder((await params).code)
  return { title: `${order?.code ?? "Order"} | Snapick` }
}

export default async function OrderPage({ params }: Props) {
  const order = await getOrder((await params).code)

  if (!order) {
    notFound()
  }

  return (
    <OrderDetailView
      order={{
        id: order.id,
        code: order.code,
        customerCode: order.customerCode,
        customerName: order.customerName,
        phone: order.phone,
        city: order.city,
        address: order.address,
        paymentMethod: order.paymentMethod,
        status: order.status,
        note: order.note,
        total: order.total,
        placedAt: formatStamp(order.placedAt),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        events: order.statusEvents.map((event) => ({
          id: event.id,
          status: event.status,
          at: formatStamp(event.changedAt),
        })),
      }}
    />
  )
}
