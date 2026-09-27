"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { generateOrderCode } from "@/lib/codes"
import {
  DeliveryStatus,
  PaymentMethod,
  Prisma,
} from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export type OrderLineValues = { productId: string; quantity: string }

export type OrderFormValues = {
  customerCode: string
  name: string
  phone: string
  city: string
  address: string
  note: string
  paymentMethod: string
  lines: OrderLineValues[]
}

export type OrderFormState =
  | {
      error?: string
      values?: OrderFormValues
    }
  | undefined

class StockError extends Error {
  constructor(readonly productName: string) {
    super(productName)
  }
}

function readOrderValues(formData: FormData): OrderFormValues {
  const productIds = formData.getAll("productId").map(String)
  const quantities = formData.getAll("quantity").map(String)
  const count = Math.max(productIds.length, quantities.length)
  const lines = Array.from({ length: count }, (_, index) => ({
    productId: productIds[index] ?? "",
    quantity: quantities[index] ?? "",
  })).filter((line) => line.productId || line.quantity)

  return {
    customerCode: String(formData.get("customerCode") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    note: String(formData.get("note") ?? "").trim(),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
    lines,
  }
}

function isUniqueError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

const statuses = new Set<string>(Object.values(DeliveryStatus))

export async function updateOrderStatus(orderId: number, status: string) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!Number.isInteger(orderId) || !statuses.has(status)) return

  const next = status as DeliveryStatus
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, code: true },
  })
  if (!order || order.status === next) return

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: next } }),
    prisma.orderStatusEvent.create({
      data: { orderId, status: next, changedBy: session.username },
    }),
  ])
  revalidatePath("/office/orders")
  revalidatePath(`/office/orders/${order.code}`)
}

const payments = new Set<string>(Object.values(PaymentMethod))

export async function updateOrder(
  code: string,
  _state: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const session = await getSession()
  if (!session) redirect("/login")

  const values = readOrderValues(formData)
  if (!values.name || !values.phone || !values.city) {
    return { error: "Name, phone and city are required.", values }
  }
  if (!payments.has(values.paymentMethod)) {
    return { error: "Choose a payment method.", values }
  }
  if (values.lines.length === 0) {
    return { error: "Add at least one item.", values }
  }

  const quantities = new Map<number, number>()
  for (const line of values.lines) {
    const productId = Number(line.productId)
    const quantity = Number(line.quantity)
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
      return { error: "Each item needs a product and a quantity of at least 1.", values }
    }
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity)
  }

  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: true },
  })
  if (!order) return { error: "Order not found.", values }

  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
  })
  if (products.length !== quantities.size) {
    return { error: "A product is no longer available.", values }
  }

  const customerCode = values.customerCode.trim()
  if (customerCode) {
    const customer = await prisma.customer.findUnique({
      where: { code: customerCode },
      select: { code: true },
    })
    if (!customer) return { error: "Customer not found.", values }
  }

  const saved = new Map(
    order.items.flatMap((item) =>
      item.productId == null ? [] : [[item.productId, item] as const]
    )
  )
  const items = products.map((product) => {
    const previous = saved.get(product.id)
    const quantity = quantities.get(product.id) ?? 0
    return {
      productId: product.id,
      name: previous?.name ?? product.name,
      sku: previous?.sku ?? product.sku,
      unitPrice: previous?.unitPrice ?? product.price,
      quantity,
    }
  })
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  await prisma.order.update({
    where: { id: order.id },
    data: {
      customerCode: customerCode || null,
      customerName: values.name,
      phone: values.phone,
      city: values.city,
      address: values.address,
      total,
      paymentMethod: values.paymentMethod as PaymentMethod,
      note: values.note,
      items: { deleteMany: {}, create: items },
    },
  })

  revalidatePath("/office/orders")
  revalidatePath(`/office/orders/${order.code}`)
  if (order.customerCode) revalidatePath(`/office/customers/${order.customerCode}`)
  if (customerCode && customerCode !== order.customerCode) {
    revalidatePath(`/office/customers/${customerCode}`)
  }
  redirect(`/office/orders/${order.code}`)
}

export async function updateOrderNote(orderId: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!Number.isInteger(orderId)) return

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { note: String(formData.get("note") ?? "").trim() },
    select: { code: true },
  })
  revalidatePath(`/office/orders/${order.code}`)
}

export async function createOrder(
  _state: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const session = await getSession()
  if (!session) redirect("/login")

  const values = readOrderValues(formData)
  if (!values.name || !values.phone || !values.city) {
    return { error: "Name, phone and city are required.", values }
  }
  if (!Object.values(PaymentMethod).includes(values.paymentMethod as PaymentMethod)) {
    return { error: "Choose a payment method.", values }
  }
  if (values.lines.length === 0) {
    return { error: "Add at least one item.", values }
  }

  const quantities = new Map<number, number>()
  for (const line of values.lines) {
    const productId = Number(line.productId)
    const quantity = Number(line.quantity)
    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
      return { error: "Each item needs a product and a quantity of at least 1.", values }
    }
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity)
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
  })
  if (products.length !== quantities.size) {
    return { error: "A product is no longer available.", values }
  }

  const customerCode = values.customerCode.trim()
  if (customerCode) {
    const customer = await prisma.customer.findUnique({
      where: { code: customerCode },
      select: { code: true },
    })
    if (!customer) return { error: "Customer not found.", values }
  }

  const items = products.map((product) => {
    const quantity = quantities.get(product.id) ?? 0
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: product.price,
      quantity,
    }
  })
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const paymentMethod = values.paymentMethod as PaymentMethod

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const code = generateOrderCode()
      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          })
          if (updated.count !== 1) throw new StockError(item.name)
        }
        await tx.order.create({
          data: {
            code,
            customerCode: customerCode || null,
            customerName: values.name,
            phone: values.phone,
            city: values.city,
            address: values.address,
            total,
            paymentMethod,
            status: DeliveryStatus.pending,
            note: values.note,
            items: { create: items },
            statusEvents: {
              create: { status: DeliveryStatus.pending, changedBy: session.username },
            },
          },
        })
      })
      revalidatePath("/office/orders")
      revalidatePath("/office/products")
      redirect(`/office/orders/${code}`)
    } catch (error) {
      if (error instanceof StockError) {
        return { error: `Not enough stock for ${error.productName}.`, values }
      }
      if (isUniqueError(error)) continue
      throw error
    }
  }

  return { error: "Could not create the order. Try again.", values }
}
