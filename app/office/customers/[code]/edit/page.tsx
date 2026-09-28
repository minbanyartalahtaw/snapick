import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BackButton } from "@/components/back-button"
import { prisma } from "@/lib/prisma"

import { EditCustomerForm } from "./edit-customer-form"

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = decodeURIComponent((await params).code)
  return { title: `Edit ${code} | Snapick` }
}

export default async function EditCustomerPage({ params }: Props) {
  const code = decodeURIComponent((await params).code)
  const customer = await prisma.customer.findUnique({
    where: { code },
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <BackButton fallback={`/office/customers/${customer.code}`} />

      <div>
        <p className="mb-2 px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Details
        </p>
        <EditCustomerForm
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
