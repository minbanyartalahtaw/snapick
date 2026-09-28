import "server-only"

import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// The signed-in admin, or a trip back to login when the session is missing
// or points at an admin that no longer exists.
export async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect("/login")

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      avatarColor: true,
    },
  })
  if (!admin) redirect("/logout")

  return admin
}
