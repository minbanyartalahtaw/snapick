"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { isAvatarColor } from "@/lib/avatar"
import { Prisma } from "@/lib/generated/prisma/client"
import { hashPassword, verifyPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"

export type ProfileFormValues = {
  name: string
  username: string
  avatar: string
  avatarColor: string
}

export type ProfileFormState =
  { error?: string; saved?: boolean; values?: ProfileFormValues } | undefined

export async function updateProfile(
  _state: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const admin = await requireAdmin()

  const avatarColor = String(formData.get("avatarColor") ?? "")
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    username: String(formData.get("username") ?? "").trim(),
    avatar: String(formData.get("avatar") ?? "")
      .trim()
      .slice(0, 64),
    avatarColor: isAvatarColor(avatarColor) ? avatarColor : admin.avatarColor,
  }
  if (!values.name || !values.username) {
    return { error: "Name and username are required.", values }
  }
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(values.username)) {
    return {
      error:
        "Username must be 3–32 letters, numbers, dots, dashes or underscores.",
      values,
    }
  }

  try {
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        name: values.name,
        username: values.username,
        avatar: values.avatar || admin.avatar,
        avatarColor: values.avatarColor,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "That username is taken.", values }
    }
    throw error
  }

  revalidatePath("/office", "layout")
  return { saved: true, values }
}

export type PasswordFormState = { error?: string; saved?: boolean } | undefined

export async function changePassword(
  _state: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const admin = await requireAdmin()

  const current = String(formData.get("current") ?? "")
  const next = String(formData.get("next") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (next.length < 8) {
    return { error: "New password must be at least 8 characters." }
  }
  if (next !== confirm) {
    return { error: "New passwords do not match." }
  }

  const { passwordHash } = await prisma.admin.findUniqueOrThrow({
    where: { id: admin.id },
    select: { passwordHash: true },
  })
  if (!(await verifyPassword(current, passwordHash))) {
    return { error: "Current password is wrong." }
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(next) },
  })
  return { saved: true }
}
