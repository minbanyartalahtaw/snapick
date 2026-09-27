"use server"

import { createHash, timingSafeEqual } from "node:crypto"
import { redirect } from "next/navigation"

import { createSession, deleteSession } from "@/lib/session"

export type LoginState = { error?: string; username?: string } | undefined

function safeEqual(a: string, b: string) {
  const hashA = createHash("sha256").update(a).digest()
  const hashB = createHash("sha256").update(b).digest()
  return timingSafeEqual(hashA, hashB)
}

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const adminUsername = process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    return { error: "Login is not configured.", username }
  }

  const validUsername = safeEqual(username, adminUsername)
  const validPassword = safeEqual(password, adminPassword)

  if (!validUsername || !validPassword) {
    return { error: "Invalid username or password.", username }
  }

  await createSession(adminUsername)
  redirect("/office/dashboard")
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}
