import type { ReactNode } from "react"

function compact(value: string) {
  return value.replace(/[\s-]/g, "").toLowerCase()
}

function matchRanges(text: string, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  const lower = text.toLowerCase()
  const direct: Array<[number, number]> = []
  let from = 0
  while (from < lower.length) {
    const at = lower.indexOf(needle, from)
    if (at < 0) break
    direct.push([at, at + needle.length])
    from = at + needle.length
  }
  if (direct.length > 0) return direct

  const compactNeedle = compact(needle)
  if (!compactNeedle || compactNeedle === needle) return []
  const ranges: Array<[number, number]> = []
  let start = -1
  let matched = 0
  for (let index = 0; index < lower.length; index++) {
    const char = lower[index]
    if (char === " " || char === "-") continue
    if (char === compactNeedle[matched]) {
      if (matched === 0) start = index
      matched += 1
      if (matched === compactNeedle.length) {
        ranges.push([start, index + 1])
        start = -1
        matched = 0
      }
      continue
    }
    if (char === compactNeedle[0]) {
      start = index
      matched = 1
      if (compactNeedle.length === 1) {
        ranges.push([index, index + 1])
        start = -1
        matched = 0
      }
    } else {
      start = -1
      matched = 0
    }
  }
  return ranges
}

export function SearchHighlight({
  text,
  query,
}: {
  text: string
  query: string
}) {
  const ranges = matchRanges(text, query)
  if (ranges.length === 0) return text
  const nodes: ReactNode[] = []
  let cursor = 0
  ranges.forEach(([start, end], index) => {
    if (start > cursor) nodes.push(text.slice(cursor, start))
    nodes.push(
      <span
        key={index}
        className="rounded-md bg-primary! px-1 text-primary-foreground!"
      >
        {text.slice(start, end)}
      </span>
    )
    cursor = end
  })
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}
