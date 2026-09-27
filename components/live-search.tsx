"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconSearch } from "@tabler/icons-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function LiveSearch({
  placeholder,
  label,
  className,
}: {
  placeholder: string
  label: string
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get("q") ?? ""
  const [value, setValue] = useState(current)
  const pushed = useRef(current)

  useEffect(() => {
    if (current === pushed.current) return
    pushed.current = current
    setValue(current)
  }, [current])

  useEffect(() => {
    const next = value.trim()
    if (next === current) return
    const handle = window.setTimeout(() => {
      pushed.current = next
      const params = new URLSearchParams(window.location.search)
      if (next) params.set("q", next)
      else params.delete("q")
      params.delete("page")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    }, 200)
    return () => window.clearTimeout(handle)
  }, [value, current, pathname, router])

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="pl-9"
      />
    </div>
  )
}
