"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { toast } from "@/components/ui/toast"
import { FLASH_COOKIE } from "@/lib/flash-cookie"

export function FlashToast() {
  const pathname = usePathname()

  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${FLASH_COOKIE}=`))
    if (!match) return
    document.cookie = `${FLASH_COOKIE}=; path=/; max-age=0`
    toast.add({
      type: "success",
      title: decodeURIComponent(match.slice(FLASH_COOKIE.length + 1)),
    })
  }, [pathname])

  return null
}
