"use client"

import { Suspense, useEffect, useState } from "react"

import { RouteMemory } from "@/components/back-button"
import { OfficeBreadcrumb } from "@/components/office-breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const HEADER_HEIGHT = 56

export function OfficeHeader() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY

    function onScroll() {
      const y = window.scrollY
      if (Math.abs(y - lastY) < 4) return
      setHidden(y > lastY && y > HEADER_HEIGHT)
      lastY = y
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur transition-transform duration-200 supports-backdrop-filter:bg-background/80",
        hidden && "-translate-y-full"
      )}
    >
      <Suspense fallback={null}>
        <RouteMemory />
      </Suspense>
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-auto"
      />
      <OfficeBreadcrumb />
    </header>
  )
}
