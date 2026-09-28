import { NextResponse, type NextRequest } from "next/server"

import { deleteSession } from "@/lib/session"

// Clears a stale session (e.g. the admin row was removed) without the
// proxy bouncing /login straight back to the office.
export async function GET(req: NextRequest) {
  await deleteSession()
  return NextResponse.redirect(new URL("/login", req.nextUrl))
}
