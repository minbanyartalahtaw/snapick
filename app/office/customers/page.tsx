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
import { isTrustLevel, trustLevels } from "@/lib/trust"
import { cn } from "@/lib/utils"

import { CustomerAvatar, TrustBadge } from "./customer-avatar"

export const metadata: Metadata = {
  title: "Customers | Snapick",
}

const trustDots: Record<string, string> = {
  new: "bg-muted-foreground",
  trusted: "bg-emerald-500",
  vip: "bg-amber-500",
  careful: "bg-rose-500",
}

function customersHref(q: string, trust?: string) {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (trust) params.set("trust", trust)
  const search = params.toString()
  return search ? `/office/customers?${search}` : "/office/customers"
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; trust?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() ?? ""
  const phoneQuery = query.replace(/[\s-]/g, "")
  const trust =
    params.trust && isTrustLevel(params.trust) ? params.trust : undefined

  const searchWhere = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { code: { contains: query, mode: "insensitive" as const } },
          ...(phoneQuery ? [{ phone: { contains: phoneQuery } }] : []),
        ],
      }
    : undefined

  const [grouped, customers] = await Promise.all([
    prisma.customer.groupBy({
      by: ["trust"],
      where: searchWhere,
      _count: { _all: true },
    }),
    prisma.customer.findMany({
      where: { ...searchWhere, ...(trust ? { trust } : {}) },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const counts = Object.fromEntries(
    grouped.map((group) => [group.trust, group._count._all])
  ) as Record<string, number | undefined>
  const allCount = grouped.reduce((sum, group) => sum + group._count._all, 0)

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

      <div className="flex gap-1 overflow-x-auto">
        <FilterLink
          href={customersHref(query)}
          active={!trust}
          label="All"
          count={allCount}
        />
        {trustLevels.map((level) => (
          <FilterLink
            key={level.value}
            href={customersHref(query, level.value)}
            active={trust === level.value}
            label={level.label}
            count={counts[level.value] ?? 0}
            dot={trustDots[level.value]}
          />
        ))}
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
              {query || trust ? "Try a different search." : "No customers yet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}

function FilterLink({
  href,
  active,
  label,
  count,
  dot,
}: {
  href: string
  active: boolean
  label: string
  count: number
  dot?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm",
        active ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dot)} />}
      {label}
      <span className="tabular-nums">{count}</span>
    </Link>
  )
}
