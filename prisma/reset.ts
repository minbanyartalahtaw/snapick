import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../lib/generated/prisma/client"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "order_status_events", "order_items", "orders", "customers", "products" RESTART IDENTITY CASCADE'
  )
  console.log("All data deleted.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
