import { GlassAvatar } from "@/components/glass-avatar"
import { getTrustLevel } from "@/lib/trust"
import { cn } from "@/lib/utils"

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" })

function firstGrapheme(word: string) {
  return graphemes.segment(word)[Symbol.iterator]().next().value?.segment ?? ""
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length > 1 && /^[a-z]/i.test(words[0])) {
    return (firstGrapheme(words[0]) + firstGrapheme(words[1])).toUpperCase()
  }
  return firstGrapheme(words[0] ?? "").toUpperCase()
}

export type AvatarCustomer = {
  name: string
  code: string
  avatar: string | null
  avatarColor: string
}

export function CustomerAvatar({
  customer,
  className,
}: {
  customer: AvatarCustomer
  className?: string
}) {
  return (
    <GlassAvatar
      seed={customer.avatar ?? customer.code}
      color={customer.avatarColor}
      label={initials(customer.name)}
      className={cn("text-xs", className)}
    />
  )
}

export function TrustBadge({
  trust,
  className,
}: {
  trust: string
  className?: string
}) {
  const level = getTrustLevel(trust)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        level.badgeClassName,
        className
      )}
    >
      {level.label}
    </span>
  )
}
