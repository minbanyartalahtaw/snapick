import type { Metadata } from "next"

import { NewProductForm } from "./new-product-form"

export const metadata: Metadata = {
  title: "New product | Snapick",
}

export default function NewProductPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        New product
      </h1>
      <NewProductForm />
    </div>
  )
}
