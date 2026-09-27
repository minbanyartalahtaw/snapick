import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BackButton } from "@/components/back-button"
import { prisma } from "@/lib/prisma"

import { updateOrder } from "../../actions"
import { NewOrderForm } from "../../new/new-order-form"

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = decodeURIComponent((await params).code)
  return { title: `Edit ${code} | Snapick` }
}

export default async function EditOrderPage({ params }: Props) {
  const code = decodeURIComponent((await params).code)
  const [order, customers, products] = await Promise.all([
    prisma.order.findUnique({
      where: { code },
      include: { items: { orderBy: { id: "asc" } } },
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { code: true, name: true, phone: true, city: true, address: true },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, price: true, stock: true },
    }),
  ])

  if (!order) notFound()

  const saved = new Map<number, { name: string; price: number }>()
  for (const item of order.items) {
    if (item.productId != null && !saved.has(item.productId)) {
      saved.set(item.productId, { name: item.name, price: item.unitPrice })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton fallback={`/office/orders/${order.code}`} />
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Edit order
        </h1>
      </div>
      <NewOrderForm
        customers={customers}
        products={products.map((product) => {
          const previous = saved.get(product.id)
          return previous
            ? { ...product, name: previous.name, price: previous.price }
            : product
        })}
        action={updateOrder.bind(null, order.code)}
        requireStock={false}
        initial={{
          customerCode: order.customerCode ?? "",
          name: order.customerName,
          phone: order.phone,
          city: order.city,
          address: order.address,
          note: order.note,
          paymentMethod: order.paymentMethod,
          lines: order.items.map((item) => ({
            productId:
              item.productId != null && saved.has(item.productId)
                ? String(item.productId)
                : "",
            quantity: String(item.quantity),
          })),
        }}
      />
    </div>
  )
}
