import { cookies } from "next/headers"

import { FLASH_COOKIE } from "@/lib/flash-cookie"

// A one-shot message for the page a server action redirects to; FlashToast
// reads it in the browser, shows the toast and clears it.
export async function flash(message: string) {
  const store = await cookies()
  store.set(FLASH_COOKIE, message, {
    path: "/",
    maxAge: 30,
  })
}
