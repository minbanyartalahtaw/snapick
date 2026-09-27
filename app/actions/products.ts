"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

type ProductField = "name" | "sku" | "price" | "stock"
type FieldErrors = Partial<Record<ProductField, string>>

export type ProductFormValues = {
  name: string
  sku: string
  price: string
  stock: string
  isActive: boolean
}

export type ProductFormState =
  | {
      success?: boolean
      error?: string
      fieldErrors?: FieldErrors
      values?: ProductFormValues
    }
  | undefined

function parseWholeNumber(value: string) {
  const text = value.replace(/,/g, "")
  if (!/^\d+$/.test(text)) return null
  const number = Number(text)
  return Number.isSafeInteger(number) ? number : null
}

function readValues(formData: FormData): ProductFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    sku: String(formData.get("sku") ?? "")
      .trim()
      .toUpperCase(),
    price: String(formData.get("price") ?? "").trim(),
    stock: String(formData.get("stock") ?? "").trim(),
    isActive: formData.get("isActive") === "on",
  }
}

function parseProductForm(values: ProductFormValues) {
  const { name, sku, isActive } = values
  const price = parseWholeNumber(values.price)
  const stock = parseWholeNumber(values.stock)

  const fieldErrors: FieldErrors = {}
  if (!name) fieldErrors.name = "Name is required."
  if (!sku) fieldErrors.sku = "SKU is required."
  if (price === null) fieldErrors.price = "Enter a whole number of kyats."
  if (stock === null) fieldErrors.stock = "Enter a whole number, 0 or more."

  if (price === null || stock === null || Object.keys(fieldErrors).length) {
    return { fieldErrors }
  }

  return { data: { name, sku, price, stock, isActive } }
}

function isDuplicateSku(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}

function duplicateSku(values: ProductFormValues): ProductFormState {
  return {
    fieldErrors: { sku: "Another product already uses this SKU." },
    values,
  }
}

export async function createProduct(
  _state: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await getSession())) {
    redirect("/login")
  }

  const values = readValues(formData)
  const { data, fieldErrors } = parseProductForm(values)
  if (!data) return { fieldErrors, values }

  try {
    await prisma.product.create({ data })
  } catch (error) {
    if (isDuplicateSku(error)) return duplicateSku(values)
    throw error
  }

  revalidatePath("/office/products")
  redirect("/office/products")
}

export async function updateProduct(
  id: number,
  _state: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  if (!(await getSession())) {
    redirect("/login")
  }

  const values = readValues(formData)
  const { data, fieldErrors } = parseProductForm(values)
  if (!data) return { fieldErrors, values }

  try {
    await prisma.product.update({ where: { id }, data })
  } catch (error) {
    if (isDuplicateSku(error)) return duplicateSku(values)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { error: "This product no longer exists.", values }
    }
    throw error
  }

  revalidatePath("/office/products")
  return { success: true }
}
