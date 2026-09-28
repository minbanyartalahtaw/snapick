import type { TrustLevel } from "@/lib/generated/prisma/enums"

export type { TrustLevel }

export const trustLevels: {
  value: TrustLevel
  label: string
  description: string
  badgeClassName: string
}[] = [
  {
    value: "new",
    label: "New",
    description: "No history yet",
    badgeClassName: "bg-muted text-muted-foreground",
  },
  {
    value: "trusted",
    label: "Trusted",
    description: "Pays and picks up reliably",
    badgeClassName: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  {
    value: "vip",
    label: "VIP",
    description: "Loyal, repeat customer",
    badgeClassName: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  {
    value: "careful",
    label: "Careful",
    description: "Returns, no-shows or unpaid COD",
    badgeClassName: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
]

export function getTrustLevel(value: string | null | undefined) {
  return trustLevels.find((level) => level.value === value) ?? trustLevels[0]
}

export function isTrustLevel(value: string): value is TrustLevel {
  return trustLevels.some((level) => level.value === value)
}
