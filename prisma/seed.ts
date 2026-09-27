import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import {
  DeliveryStatus,
  PaymentMethod,
  PrismaClient,
} from "../lib/generated/prisma/client"
import { generateCustomerCode, generateOrderCode } from "../lib/codes"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const products = [
  { sku: "TEE-WHT", name: "Oversized Tee - White", price: 18000, stock: 25 },
  { sku: "TEE-BLK", name: "Oversized Tee - Black", price: 18000, stock: 20 },
  { sku: "HOOD-GRY", name: "Hoodie - Grey", price: 35000, stock: 10 },
  { sku: "TOTE-CRM", name: "Canvas Tote Bag", price: 12000, stock: 30 },
  { sku: "CAP-BLK", name: "Baseball Cap", price: 9500, stock: 15 },
  { sku: "SOCK-3P", name: "Socks 3-Pack", price: 6000, stock: 40 },
  { sku: "CASE-CLR", name: "Clear Phone Case", price: 8000, stock: 0 },
  {
    sku: "SCRUNCH-SET",
    name: "Satin Scrunchie Set",
    price: 4500,
    stock: 12,
    isActive: false,
  },
]

const customers = [
  {
    name: "Aung Aung",
    phone: "09420012345",
    city: "Yangon",
    address: "No. 12, Bogyoke Road, Kamaryut Township",
  },
  {
    name: "Su Su Hlaing",
    phone: "09785123456",
    city: "Mandalay",
    address: "No. 45, 78th Street, Chanayethazan Township",
    note: "Prefers delivery after 5 PM",
  },
  {
    name: "Kyaw Zin Htet",
    phone: "09259876543",
    city: "Yangon",
    address: "Room 7B, Shwe Taung Kyar Housing, Bahan Township",
  },
  {
    name: "Thiri Win",
    phone: "09450067890",
    city: "Naypyidaw",
    address: "No. 3, Yan Aung Street, Zabuthiri Township",
  },
  {
    name: "Hnin Ei Phyu",
    phone: "09790054321",
    city: "Taunggyi",
    address: "No. 21, Bogyoke Aung San Road, Taunggyi",
  },
  {
    name: "Min Khant",
    phone: "09965432109",
    city: "Yangon",
    address: "No. 88, Pyay Road, Hlaing Township",
  },
]

type SeedOrder = {
  customer: number | null
  walkIn?: { name: string; phone: string; city: string }
  items: { sku: string; quantity: number }[]
  paymentMethod: PaymentMethod
  status: DeliveryStatus
  daysAgo: number
  note?: string
}

const orders: SeedOrder[] = [
  {
    customer: 0,
    items: [
      { sku: "TEE-WHT", quantity: 2 },
      { sku: "CAP-BLK", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "delivered",
    daysAgo: 13,
  },
  {
    customer: 1,
    items: [{ sku: "HOOD-GRY", quantity: 1 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 11,
  },
  {
    customer: 2,
    items: [
      { sku: "TOTE-CRM", quantity: 1 },
      { sku: "SOCK-3P", quantity: 2 },
    ],
    paymentMethod: "cod",
    status: "shipped",
    daysAgo: 6,
  },
  {
    customer: 3,
    items: [{ sku: "TEE-BLK", quantity: 1 }],
    paymentMethod: "refunded",
    status: "cancelled",
    daysAgo: 5,
    note: "Customer changed size, cancelled before packing",
  },
  {
    customer: 0,
    items: [{ sku: "HOOD-GRY", quantity: 1 }],
    paymentMethod: "paid",
    status: "packing",
    daysAgo: 3,
  },
  {
    customer: 4,
    items: [
      { sku: "TEE-WHT", quantity: 1 },
      { sku: "TEE-BLK", quantity: 1 },
      { sku: "TOTE-CRM", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "packing",
    daysAgo: 2,
    note: "Gift wrap please",
  },
  {
    customer: null,
    walkIn: { name: "Ma Hla", phone: "09771234567", city: "Yangon" },
    items: [{ sku: "SOCK-3P", quantity: 3 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 1,
  },
  {
    customer: 5,
    items: [{ sku: "CAP-BLK", quantity: 2 }],
    paymentMethod: "cod",
    status: "pending",
    daysAgo: 0,
  },
  {
    customer: 1,
    items: [
      { sku: "TOTE-CRM", quantity: 2 },
      { sku: "SOCK-3P", quantity: 1 },
    ],
    paymentMethod: "paid",
    status: "pending",
    daysAgo: 0,
  },
]

const flow: DeliveryStatus[] = ["pending", "packing", "shipped", "delivered"]

function statusHistory(status: DeliveryStatus) {
  if (status === "cancelled") return ["pending", "cancelled"] as const
  return flow.slice(0, flow.indexOf(status) + 1)
}

async function main() {
  if ((await prisma.product.count()) > 0) {
    console.log("Database already has data. Run npm run db:reset first.")
    return
  }

  await prisma.product.createMany({ data: products })
  const productBySku = new Map(
    (await prisma.product.findMany()).map((product) => [product.sku, product])
  )

  const savedCustomers = []
  for (const customer of customers) {
    savedCustomers.push(
      await prisma.customer.create({
        data: { ...customer, code: generateCustomerCode() },
      })
    )
  }

  for (const order of orders) {
    const placedAt = new Date(Date.now() - order.daysAgo * 24 * 60 * 60 * 1000)
    const customer =
      order.customer === null ? null : savedCustomers[order.customer]
    const items = order.items.map(({ sku, quantity }) => {
      const product = productBySku.get(sku)!
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity,
      }
    })
    const history = statusHistory(order.status)

    await prisma.order.create({
      data: {
        code: generateOrderCode(placedAt),
        customerCode: customer?.code,
        customerName: customer?.name ?? order.walkIn!.name,
        phone: customer?.phone ?? order.walkIn!.phone,
        city: customer?.city ?? order.walkIn!.city,
        address: customer?.address ?? "",
        total: items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        ),
        paymentMethod: order.paymentMethod,
        status: order.status,
        note: order.note ?? "",
        placedAt,
        items: { create: items },
        statusEvents: {
          create: history.map((status, index) => ({
            status,
            changedBy: "admin",
            changedAt: new Date(
              placedAt.getTime() + index * 6 * 60 * 60 * 1000
            ),
          })),
        },
      },
    })
  }

  console.log(
    `Seeded ${products.length} products, ${customers.length} customers, ${orders.length} orders.`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
