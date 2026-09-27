"use client"

import { Fragment } from "react"
import { usePathname } from "next/navigation"

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

export function OfficeBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean).slice(1)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/office/${segments.slice(0, index + 1).join("/")}`
          const isLast = index === segments.length - 1

          return (
            <Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{toTitle(segment)}</BreadcrumbPage>
                ) : (
                  <span className="text-muted-foreground">
                    {toTitle(segment)}
                  </span>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
