import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import {
  DeliveryStatus,
  PaymentMethod,
  PrismaClient,
} from "../lib/generated/prisma/client"
import { generateOrderCode } from "../lib/codes"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const products = [
  { sku: "TEE-WHT", name: "Oversized Tee - White", price: 18000, stock: 25 },
  { sku: "TEE-BLK", name: "Oversized Tee - Black", price: 18000, stock: 20 },
  { sku: "TEE-PNK", name: "Oversized Tee - Pink", price: 18000, stock: 18 },
  { sku: "TEE-NVY", name: "Oversized Tee - Navy", price: 18000, stock: 14 },
  { sku: "HOOD-GRY", name: "Hoodie - Grey", price: 35000, stock: 10 },
  { sku: "HOOD-BLK", name: "Hoodie - Black", price: 35000, stock: 8 },
  { sku: "HOOD-CRM", name: "Hoodie - Cream", price: 38000, stock: 4 },
  { sku: "TOTE-CRM", name: "Canvas Tote Bag", price: 12000, stock: 30 },
  { sku: "TOTE-BLK", name: "Canvas Tote - Black", price: 12000, stock: 22 },
  { sku: "CAP-BLK", name: "Baseball Cap", price: 9500, stock: 15 },
  { sku: "CAP-WHT", name: "Baseball Cap - White", price: 9500, stock: 3 },
  { sku: "SOCK-3P", name: "Socks 3-Pack", price: 6000, stock: 40 },
  { sku: "SOCK-WHT", name: "Socks 3-Pack - White", price: 6000, stock: 35 },
  { sku: "CASE-CLR", name: "Clear Phone Case", price: 8000, stock: 0 },
  { sku: "CASE-BLK", name: "Black Phone Case", price: 8000, stock: 16 },
  {
    sku: "SCRUNCH-SET",
    name: "Satin Scrunchie Set",
    price: 4500,
    stock: 12,
    isActive: false,
  },
  { sku: "SCRUNCH-PNK", name: "Satin Scrunchie - Pink", price: 2500, stock: 50 },
  { sku: "BAG-MINI", name: "Mini Crossbody Bag", price: 28000, stock: 6 },
  { sku: "BEANIE-GRY", name: "Beanie - Grey", price: 11000, stock: 0 },
  { sku: "PIN-SET", name: "Enamel Pin Set", price: 3500, stock: 2 },
  {
    sku: "RIBBON-SET",
    name: "Hair Ribbon Set",
    price: 3000,
    stock: 9,
    isActive: false,
  },
]

const customers = [
  {
    name: "Aung Aung",
    phone: "09420012345",
    city: "ရန်ကုန်တိုင်းဒေသကြီး",
    address: "No. 12, Bogyoke Road, Kamaryut Township",
    joinedDaysAgo: 60,
  },
  {
    name: "Su Su Hlaing",
    phone: "09785123456",
    city: "မန္တလေးတိုင်းဒေသကြီး",
    address: "No. 45, 78th Street, Chanayethazan Township",
    note: "Prefers delivery after 5 PM",
    joinedDaysAgo: 55,
  },
  {
    name: "Kyaw Zin Htet",
    phone: "09259876543",
    city: "ရန်ကုန်တိုင်းဒေသကြီး",
    address: "Room 7B, Shwe Taung Kyar Housing, Bahan Township",
    joinedDaysAgo: 48,
  },
  {
    name: "Thiri Win",
    phone: "09450067890",
    city: "နေပြည်တော်",
    address: "No. 3, Yan Aung Street, Zabuthiri Township",
    joinedDaysAgo: 44,
  },
  {
    name: "Hnin Ei Phyu",
    phone: "09790054321",
    city: "ရှမ်းပြည်နယ်",
    address: "No. 21, Bogyoke Aung San Road, Taunggyi",
    joinedDaysAgo: 40,
  },
  {
    name: "Min Khant",
    phone: "09965432109",
    city: "ရန်ကုန်တိုင်းဒေသကြီး",
    address: "No. 88, Pyay Road, Hlaing Township",
    joinedDaysAgo: 36,
  },
  {
    name: "Ei Mon",
    phone: "09421112233",
    city: "ရန်ကုန်တိုင်းဒေသကြီး",
    address: "No. 16, Insein Road, Insein Township",
    joinedDaysAgo: 33,
  },
  {
    name: "Zaw Win Tun",
    phone: "09251112233",
    city: "စစ်ကိုင်းတိုင်းဒေသကြီး",
    address: "No. 8, Zeygyo Street, Monywa",
    joinedDaysAgo: 30,
  },
  {
    name: "May Thazin",
    phone: "09792223344",
    city: "မကွေးတိုင်းဒေသကြီး",
    address: "No. 4, Strand Road, Magway",
    note: "Ask for the shop next to the market",
    joinedDaysAgo: 28,
  },
  {
    name: "Nandar Aye",
    phone: "09443334455",
    city: "ပဲခူးတိုင်းဒေသကြီး",
    address: "No. 22, Main Road, Bago",
    joinedDaysAgo: 26,
  },
  {
    name: "Phyo Wai",
    phone: "09954445566",
    city: "ဧရာဝတီတိုင်းဒေသကြီး",
    address: "No. 9, Strand Road, Pathein",
    joinedDaysAgo: 24,
  },
  {
    name: "Khin Sandar",
    phone: "09425556677",
    city: "တနင်္သာရီတိုင်းဒေသကြီး",
    address: "No. 3, Kanphyar Street, Dawei",
    joinedDaysAgo: 22,
  },
  {
    name: "Seng Mai",
    phone: "09756667788",
    city: "ကချင်ပြည်နယ်",
    address: "No. 11, Aung Nan Yeiktha, Myitkyina",
    joinedDaysAgo: 20,
  },
  {
    name: "Moe Pwint",
    phone: "09447778899",
    city: "ကယားပြည်နယ်",
    address: "No. 5, Kantarawaddy Street, Loikaw",
    joinedDaysAgo: 18,
  },
  {
    name: "Saw Htoo",
    phone: "09268889900",
    city: "ကရင်ပြည်နယ်",
    address: "No. 14, Strand Road, Hpa-An",
    joinedDaysAgo: 16,
  },
  {
    name: "Van Biak",
    phone: "09429990011",
    city: "ချင်းပြည်နယ်",
    address: "No. 2, Main Street, Hakha",
    joinedDaysAgo: 14,
  },
  {
    name: "Mi Cho",
    phone: "09780001122",
    city: "မွန်ပြည်နယ်",
    address: "No. 18, Bogyoke Road, Mawlamyine",
    joinedDaysAgo: 12,
  },
  {
    name: "Maung Maung Soe",
    phone: "09441112200",
    city: "ရခိုင်ပြည်နယ်",
    address: "No. 7, Strand Road, Sittwe",
    joinedDaysAgo: 11,
  },
  {
    name: "Nang Hom",
    phone: "09252223311",
    city: "ရှမ်းပြည်နယ်",
    address: "No. 30, Circular Road, Taunggyi",
    joinedDaysAgo: 9,
  },
  {
    name: "Aye Aye Win",
    phone: "09963334422",
    city: "မန္တလေးတိုင်းဒေသကြီး",
    address: "No. 62, 26th Street, Chanayethazan Township",
    joinedDaysAgo: 8,
  },
  {
    name: "Htet Htet",
    phone: "09424445533",
    city: "ရန်ကုန်တိုင်းဒေသကြီး",
    address: "No. 101, Kabar Aye Pagoda Road, Mayangone Township",
    note: "Call before delivery",
    joinedDaysAgo: 6,
  },
  {
    name: "Ko Ko Lwin",
    phone: "09785556644",
    city: "နေပြည်တော်",
    address: "No. 15, Yaza Thingaha Road, Ottarathiri Township",
    joinedDaysAgo: 4,
  },
  {
    name: "Su Myat Noe",
    phone: "09426667755",
    city: "ရန်ကုန်တိုင်းဒေသကြီး",
    address: "No. 6, Waizayantar Road, Thingangyun Township",
    joinedDaysAgo: 2,
  },
  {
    name: "Pyae Sone",
    phone: "09257778866",
    city: "စစ်ကိုင်းတိုင်းဒေသကြီး",
    address: "No. 19, Sagaing Strand, Sagaing",
    joinedDaysAgo: 1,
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
    daysAgo: 40,
  },
  {
    customer: 1,
    items: [{ sku: "HOOD-GRY", quantity: 1 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 36,
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
    daysAgo: 14,
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
    walkIn: { name: "Ma Hla", phone: "09771234567", city: "ရန်ကုန်တိုင်းဒေသကြီး" },
    items: [{ sku: "SOCK-3P", quantity: 3 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 12,
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
  {
    customer: 6,
    items: [
      { sku: "TEE-PNK", quantity: 1 },
      { sku: "CAP-WHT", quantity: 1 },
    ],
    paymentMethod: "paid",
    status: "shipped",
    daysAgo: 8,
  },
  {
    customer: 7,
    items: [{ sku: "HOOD-BLK", quantity: 1 }],
    paymentMethod: "cod",
    status: "delivered",
    daysAgo: 27,
  },
  {
    customer: 8,
    items: [{ sku: "BAG-MINI", quantity: 1 }],
    paymentMethod: "paid",
    status: "packing",
    daysAgo: 1,
  },
  {
    customer: 9,
    items: [
      { sku: "SOCK-WHT", quantity: 2 },
      { sku: "TOTE-BLK", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "pending",
    daysAgo: 0,
  },
  {
    customer: 10,
    items: [{ sku: "TEE-NVY", quantity: 2 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 21,
  },
  {
    customer: 11,
    items: [{ sku: "SCRUNCH-PNK", quantity: 3 }],
    paymentMethod: "cod",
    status: "delivered",
    daysAgo: 18,
  },
  {
    customer: 12,
    items: [
      { sku: "HOOD-CRM", quantity: 1 },
      { sku: "CASE-BLK", quantity: 1 },
    ],
    paymentMethod: "paid",
    status: "shipped",
    daysAgo: 4,
  },
  {
    customer: 13,
    items: [{ sku: "TEE-WHT", quantity: 1 }],
    paymentMethod: "refunded",
    status: "cancelled",
    daysAgo: 9,
    note: "Wrong address, customer cancelled",
  },
  {
    customer: 14,
    items: [
      { sku: "CAP-BLK", quantity: 1 },
      { sku: "SOCK-3P", quantity: 2 },
    ],
    paymentMethod: "cod",
    status: "packing",
    daysAgo: 2,
  },
  {
    customer: 15,
    items: [{ sku: "BEANIE-GRY", quantity: 1 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 32,
  },
  {
    customer: 16,
    items: [
      { sku: "TOTE-CRM", quantity: 1 },
      { sku: "TEE-BLK", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "pending",
    daysAgo: 1,
  },
  {
    customer: 17,
    items: [
      { sku: "HOOD-GRY", quantity: 1 },
      { sku: "SCRUNCH-PNK", quantity: 2 },
    ],
    paymentMethod: "paid",
    status: "shipped",
    daysAgo: 7,
  },
  {
    customer: 18,
    items: [
      { sku: "TEE-PNK", quantity: 2 },
      { sku: "CASE-BLK", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "delivered",
    daysAgo: 24,
  },
  {
    customer: 19,
    items: [
      { sku: "BAG-MINI", quantity: 1 },
      { sku: "CAP-WHT", quantity: 1 },
    ],
    paymentMethod: "paid",
    status: "packing",
    daysAgo: 1,
    note: "Leave at the gate",
  },
  {
    customer: 20,
    items: [{ sku: "SOCK-3P", quantity: 4 }],
    paymentMethod: "cod",
    status: "delivered",
    daysAgo: 16,
  },
  {
    customer: 21,
    items: [
      { sku: "HOOD-BLK", quantity: 1 },
      { sku: "TEE-NVY", quantity: 1 },
    ],
    paymentMethod: "paid",
    status: "pending",
    daysAgo: 0,
  },
  {
    customer: 22,
    items: [{ sku: "TOTE-BLK", quantity: 2 }],
    paymentMethod: "cod",
    status: "shipped",
    daysAgo: 5,
  },
  {
    customer: 23,
    items: [{ sku: "CASE-CLR", quantity: 1 }],
    paymentMethod: "refunded",
    status: "cancelled",
    daysAgo: 11,
    note: "Out of stock, refunded",
  },
  {
    customer: null,
    walkIn: {
      name: "Daw Mya",
      phone: "09427889900",
      city: "ရန်ကုန်တိုင်းဒေသကြီး",
    },
    items: [{ sku: "PIN-SET", quantity: 2 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 3,
  },
  {
    customer: 0,
    items: [
      { sku: "SCRUNCH-PNK", quantity: 1 },
      { sku: "TEE-WHT", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "shipped",
    daysAgo: 4,
  },
  {
    customer: 4,
    items: [{ sku: "HOOD-CRM", quantity: 1 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 29,
  },
  {
    customer: 2,
    items: [
      { sku: "CAP-BLK", quantity: 1 },
      { sku: "SOCK-WHT", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "pending",
    daysAgo: 0,
  },
  {
    customer: 5,
    items: [{ sku: "BAG-MINI", quantity: 1 }],
    paymentMethod: "paid",
    status: "packing",
    daysAgo: 2,
  },
  {
    customer: null,
    walkIn: {
      name: "Ko Naing",
      phone: "09781112233",
      city: "မန္တလေးတိုင်းဒေသကြီး",
    },
    items: [
      { sku: "TEE-BLK", quantity: 1 },
      { sku: "HOOD-GRY", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "shipped",
    daysAgo: 6,
  },
  {
    customer: 11,
    items: [
      { sku: "PIN-SET", quantity: 1 },
      { sku: "CASE-BLK", quantity: 2 },
    ],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 34,
  },
  {
    customer: 15,
    items: [
      { sku: "TEE-PNK", quantity: 1 },
      { sku: "TOTE-CRM", quantity: 1 },
    ],
    paymentMethod: "cod",
    status: "packing",
    daysAgo: 1,
  },
  {
    customer: 8,
    items: [{ sku: "SOCK-3P", quantity: 1 }],
    paymentMethod: "refunded",
    status: "cancelled",
    daysAgo: 10,
    note: "Customer asked to cancel",
  },
  {
    customer: 19,
    items: [{ sku: "TEE-NVY", quantity: 1 }],
    paymentMethod: "cod",
    status: "delivered",
    daysAgo: 19,
  },
  {
    customer: 6,
    items: [
      { sku: "HOOD-BLK", quantity: 1 },
      { sku: "SOCK-WHT", quantity: 2 },
    ],
    paymentMethod: "paid",
    status: "pending",
    daysAgo: 0,
  },
  {
    customer: 22,
    items: [{ sku: "CAP-WHT", quantity: 1 }],
    paymentMethod: "cod",
    status: "packing",
    daysAgo: 1,
  },
  {
    customer: 17,
    items: [{ sku: "BEANIE-GRY", quantity: 2 }],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 38,
  },
  {
    customer: 9,
    items: [{ sku: "BAG-MINI", quantity: 1 }],
    paymentMethod: "cod",
    status: "shipped",
    daysAgo: 5,
  },
  {
    customer: 20,
    items: [
      { sku: "TEE-WHT", quantity: 1 },
      { sku: "SCRUNCH-PNK", quantity: 4 },
    ],
    paymentMethod: "paid",
    status: "delivered",
    daysAgo: 13,
  },
]

const flow: DeliveryStatus[] = ["pending", "packing", "shipped", "delivered"]

function statusHistory(status: DeliveryStatus) {
  if (status === "cancelled") return ["pending", "cancelled"] as const
  return flow.slice(0, flow.indexOf(status) + 1)
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

const usedOrderCodes = new Set<string>()

function uniqueOrderCode(date: Date) {
  let code = generateOrderCode(date)
  while (usedOrderCodes.has(code)) code = generateOrderCode(date)
  usedOrderCodes.add(code)
  return code
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
        data: {
          name: customer.name,
          phone: customer.phone,
          city: customer.city,
          address: customer.address,
          note: customer.note ?? "",
          createdAt: daysAgo(customer.joinedDaysAgo),
        },
      })
    )
  }

  for (const order of orders) {
    const placedAt = daysAgo(order.daysAgo)
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
        code: uniqueOrderCode(placedAt),
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
