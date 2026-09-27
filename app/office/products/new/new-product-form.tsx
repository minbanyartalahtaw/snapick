"use client"

import { useActionState } from "react"
import Link from "next/link"

import { createProduct } from "../actions"
import { Button } from "@/components/ui/button"

import { ProductFields } from "../product-fields"

export function NewProductForm() {
  const [state, action, pending] = useActionState(createProduct, undefined)

  return (
    <form action={action} className="flex flex-col gap-6">
      <ProductFields defaults={{ stock: 0, isActive: true }} state={state} />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/office/products" />}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  )
}
