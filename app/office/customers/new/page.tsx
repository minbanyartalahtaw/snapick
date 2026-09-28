import type { Metadata } from "next"

import { BackButton } from "@/components/back-button"
import { randomAvatarSeed } from "@/lib/avatar"

import { NewCustomerForm } from "./new-customer-form"

export const metadata: Metadata = {
  title: "New customer | Snapick",
}

export default function NewCustomerPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <BackButton fallback="/office/customers" />
        <h1 className="text-lg font-semibold tracking-tight">New customer</h1>
      </div>
      <NewCustomerForm initialSeed={randomAvatarSeed()} />
    </div>
  )
}
