import type { Metadata } from "next"
import Link from "next/link"
import { IconChevronRight, IconSearch, IconUsers } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/format"
import { prisma } from "@/lib/prisma"

import { CustomerAvatar } from "./customer-avatar"

export const metadata: Metadata = {
  title: "Customers | Snapick",
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""
  const phoneQuery = query.replace(/[\s-]/g, "")

  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { code: { contains: query, mode: "insensitive" } },
            ...(phoneQuery ? [{ phone: { contains: phoneQuery } }] : []),
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-4">
      <form action="/office/customers" className="relative w-full sm:max-w-sm">
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Name, SP- code or phone"
          aria-label="Search customers"
          className="pr-20 pl-9"
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="absolute top-1/2 right-1 -translate-y-1/2"
        >
          Search
        </Button>
      </form>

      {customers.length > 0 ? (
        <ul className="divide-y overflow-hidden rounded-2xl border">
          {customers.map((customer) => (
            <li key={customer.id}>
              <Link
                href={`/office/customers/${customer.code}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
              >
                <CustomerAvatar name={customer.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {customer.name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {customer.code}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <p className="truncate text-muted-foreground">
                    {customer.city}
                  </p>
                  <p className="font-mono text-muted-foreground">
                    {customer.phone}
                  </p>
                </div>
                <p className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
                  {formatDate(customer.createdAt)}
                </p>
                <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconUsers />
            </EmptyMedia>
            <EmptyTitle>No customers found</EmptyTitle>
            <EmptyDescription>
              {query ? "Try a different search." : "No customers yet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
