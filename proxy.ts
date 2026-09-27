import { NextResponse, type NextRequest } from "next/server"

import { decrypt } from "@/lib/session"

export default async function proxy(req: NextRequest) {
  const session = await decrypt(req.cookies.get("session")?.value)
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/office") && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/office/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/office/:path*", "/login"],
}
