"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"

import { useBreadcrumbLabels } from "@/components/breadcrumb-label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function toTitle(segment: string) {
  const text = decodeURIComponent(segment)
  if (text !== text.toLowerCase()) return text
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Opaque ids (32 hex chars) stay hidden until the page supplies a readable label.
const OPAQUE_ID = /^[0-9a-f]{32}$/

export function OfficeBreadcrumb() {
  const pathname = usePathname()
  const labels = useBreadcrumbLabels()
  const segments = pathname.split("/").filter(Boolean).slice(1)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/office/${segments.slice(0, index + 1).join("/")}`
          const isLast = index === segments.length - 1
          const label =
            labels[segment] ??
            (OPAQUE_ID.test(segment) ? null : toTitle(segment))
          if (label === null) return null

          return (
            <Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <span className="text-muted-foreground">{label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
