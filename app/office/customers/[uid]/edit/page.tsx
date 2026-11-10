import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BreadcrumbLabel } from "@/components/breadcrumb-label"
import { BackButton } from "@/components/back-button"
import { prisma } from "@/lib/prisma"

import { EditCustomerForm } from "./edit-customer-form"

type Props = { params: Promise<{ uid: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params
  const customer = await prisma.customer.findUnique({
    where: { uid },
    select: { name: true },
  })
  return { title: `Edit ${customer?.name ?? "customer"} | Snapick` }
}

export default async function EditCustomerPage({ params }: Props) {
  const { uid } = await params
  const customer = await prisma.customer.findUnique({
    where: { uid },
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <BreadcrumbLabel segment={customer.uid} label={customer.code} />
      <BackButton fallback={`/office/customers/${customer.uid}`} />

      <div>
        <p className="mb-2 px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Details
        </p>
        <EditCustomerForm
          uid={customer.uid}
          code={customer.code}
          initial={{
            name: customer.name,
            phone: customer.phone,
            city: customer.city,
            address: customer.address,
            note: customer.note,
            trust: customer.trust,
            avatar: customer.avatar ?? "",
            avatarColor: customer.avatarColor,
          }}
        />
      </div>
    </div>
  )
}
