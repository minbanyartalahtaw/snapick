"use server"

import { redirect } from "next/navigation"

import { verifyPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/session"

export type LoginState = { error?: string; username?: string } | undefined

// Checked against when the username is unknown, so a miss costs the same
// time as a wrong password.
const DUMMY_HASH =
  "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  const admin = await prisma.admin.findUnique({
    where: { username },
    select: { id: true, passwordHash: true },
  })
  const valid = await verifyPassword(
    password,
    admin?.passwordHash ?? DUMMY_HASH
  )

  if (!admin || !valid) {
    return { error: "Invalid username or password.", username }
  }

  await createSession(admin.id)
  redirect("/office/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
