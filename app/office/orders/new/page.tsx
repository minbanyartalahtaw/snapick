import type { Metadata } from "next"

import { BackButton } from "@/components/back-button"
import { prisma } from "@/lib/prisma"

import { NewOrderForm } from "./new-order-form"

export const metadata: Metadata = {
  title: "New order | Snapick",
}

export default async function NewOrderPage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: {
        code: true,
        name: true,
        phone: true,
        city: true,
        address: true,
        avatar: true,
        avatarColor: true,
      },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
      },
    }),
  ])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackButton fallback="/office/orders" />
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New order
        </h1>
      </div>
      <NewOrderForm customers={customers} products={products} />
    </div>
  )
}
