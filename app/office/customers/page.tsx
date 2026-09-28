import type { Metadata } from "next"
import Link from "next/link"
import {
  IconChevronRight,
  IconPlus,
  IconUsers,
} from "@tabler/icons-react"

import { LiveSearch } from "@/components/live-search"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SearchHighlight } from "@/components/search-highlight"
import { formatDate } from "@/lib/format"
import { prisma } from "@/lib/prisma"

import { CustomerAvatar, TrustBadge } from "./customer-avatar"

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
      <div className="flex items-center gap-2">
        <LiveSearch
          placeholder="Name, SPC- code or phone"
          label="Search customers"
          className="sm:max-w-sm"
        />
        <Button
          className="ml-auto shrink-0"
          nativeButton={false}
          render={<Link href="/office/customers/new" />}
        >
          <IconPlus />
          New customer
        </Button>
      </div>

      {customers.length > 0 ? (
        <ul className="divide-y overflow-hidden rounded-2xl border">
          {customers.map((customer) => (
            <li key={customer.id}>
              <Link
                href={`/office/customers/${customer.code}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
              >
                <CustomerAvatar customer={customer} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">
                      <SearchHighlight text={customer.name} query={query} />
                    </span>
                    {customer.trust !== "new" && (
                      <TrustBadge trust={customer.trust} className="shrink-0" />
                    )}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    <SearchHighlight text={customer.code} query={query} />
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs">
                  <p className="truncate text-muted-foreground">
                    {customer.city}
                  </p>
                  <p className="font-mono text-muted-foreground">
                    <SearchHighlight text={customer.phone} query={query} />
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
