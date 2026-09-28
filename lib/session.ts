import "server-only"

import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

const SESSION_COOKIE = "session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function getKey() {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    throw new Error("SESSION_SECRET is not set")
  }

  return new TextEncoder().encode(secret)
}

export async function encrypt(adminId: number) {
  return new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey())
}

export async function decrypt(token: string | undefined) {
  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    })
    const adminId = Number(payload.sub)
    return Number.isInteger(adminId) && adminId > 0 ? { adminId } : null
  } catch {
    return null
  }
}

export async function createSession(adminId: number) {
  const token = await encrypt(adminId)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
