"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export type CustomerFormValues = {
  name: string
  phone: string
  city: string
  address: string
  note: string
}

export type CustomerFormState =
  | {
      error?: string
      values?: CustomerFormValues
    }
  | undefined

function readCustomerValues(formData: FormData): CustomerFormValues {
  return {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    note: String(formData.get("note") ?? "").trim(),
  }
}

export async function updateCustomer(
  code: string,
  _state: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const session = await getSession()
  if (!session) redirect("/login")

  const values = readCustomerValues(formData)
  if (!values.name || !values.phone || !values.city) {
    return { error: "Name, mobile number and city are required.", values }
  }

  try {
    await prisma.customer.update({
      where: { code },
      data: {
        name: values.name,
        phone: values.phone,
        city: values.city,
        address: values.address,
        note: values.note,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "This mobile number is already in use.", values }
    }
    throw error
  }

  revalidatePath("/office/customers")
  revalidatePath(`/office/customers/${code}`)
  redirect(`/office/customers/${code}`)
}

export async function createCustomer(
  _state: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const session = await getSession()
  if (!session) redirect("/login")

  const values = readCustomerValues(formData)
  if (!values.name || !values.phone || !values.city) {
    return { error: "Name, mobile number and city are required.", values }
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        name: values.name,
        phone: values.phone,
        city: values.city,
        address: values.address,
        note: values.note,
      },
      select: { code: true },
    })
    revalidatePath("/office/customers")
    redirect(`/office/customers/${customer.code}`)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "This mobile number is already in use.", values }
    }
    throw error
  }
}
