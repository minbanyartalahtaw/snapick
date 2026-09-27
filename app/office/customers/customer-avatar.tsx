import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

export function CustomerAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
