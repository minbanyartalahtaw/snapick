"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

const STACK_KEY = "snapick-route-stack"

function readStack() {
  try {
    const raw = sessionStorage.getItem(STACK_KEY)
    const stack = raw ? JSON.parse(raw) : []
    return Array.isArray(stack) ? stack.filter((entry) => typeof entry === "string") : []
  } catch {
    return []
  }
}

export function RouteMemory() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const href = search ? `${pathname}?${search}` : pathname

  useEffect(() => {
    const stack = readStack()
    if (stack.at(-1) === href) return
    if (stack.length >= 2 && stack.at(-2) === href) {
      stack.pop()
    } else {
      stack.push(href)
      if (stack.length > 40) stack.shift()
    }
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack))
  }, [href])

  return null
}

export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Back"
      onClick={() => {
        const stack = readStack()
        const href = `${location.pathname}${location.search}`
        const previous = stack.at(-1) === href ? stack.at(-2) : stack.at(-1)
        if (previous?.startsWith("/office/") && previous !== href) {
          router.push(previous)
        } else {
          router.push(fallback)
        }
      }}
    >
      <IconArrowLeft />
    </Button>
  )
}
