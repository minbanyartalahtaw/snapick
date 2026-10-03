"use client"

import { useActionState, useCallback, useEffect } from "react"

import { updateProduct } from "./actions"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet"
import type { Product } from "@/lib/generated/prisma/client"

import { ProductFields } from "./product-fields"

function ProductForm({
  product,
  onSaved,
}: {
  product: Product
  onSaved: () => void
}) {
  const [state, action, pending] = useActionState(
    updateProduct.bind(null, product.id),
    undefined
  )

  useEffect(() => {
    if (state?.success) {
      toast.add({ type: "success", title: "Product updated" })
      onSaved()
    }
  }, [state, onSaved])

  return (
    <form action={action} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-6">
        <ProductFields defaults={product} state={state} />
      </div>
      <SheetFooter className="flex-row justify-end">
        <SheetClose render={<Button type="button" variant="outline" />}>
          Cancel
        </SheetClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save"}
        </Button>
      </SheetFooter>
    </form>
  )
}

export function ProductSheet({
  product,
  formKey,
  open,
  onOpenChange,
}: {
  product: Product | null
  formKey: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader></SheetHeader>
        {product && (
          <ProductForm key={formKey} product={product} onSaved={close} />
        )}
      </SheetContent>
    </Sheet>
  )
}
