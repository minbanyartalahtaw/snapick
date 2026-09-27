import type { ProductFormState } from "./actions"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type ProductDefaults = {
  name?: string
  sku?: string
  price?: number | string
  stock?: number | string
  isActive?: boolean
}

export function ProductFields({
  defaults: initial = {},
  state,
}: {
  defaults?: ProductDefaults
  state: ProductFormState
}) {
  const errors = state?.fieldErrors
  const defaults = state?.values ?? initial

  return (
    <FieldGroup key={JSON.stringify(defaults)}>
      <Field data-invalid={!!errors?.name}>
        <FieldLabel htmlFor="product-name">Name</FieldLabel>
        <Input
          id="product-name"
          name="name"
          defaultValue={defaults.name}
          aria-invalid={!!errors?.name}
          required
        />
        <FieldError>{errors?.name}</FieldError>
      </Field>
      <Field data-invalid={!!errors?.sku}>
        <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
        <Input
          id="product-sku"
          name="sku"
          defaultValue={defaults.sku}
          autoCapitalize="characters"
          className="font-mono uppercase"
          aria-invalid={!!errors?.sku}
          required
        />
        <FieldError>{errors?.sku}</FieldError>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field data-invalid={!!errors?.price}>
          <FieldLabel htmlFor="product-price">Price (Ks)</FieldLabel>
          <Input
            id="product-price"
            name="price"
            inputMode="numeric"
            defaultValue={defaults.price}
            aria-invalid={!!errors?.price}
            required
          />
          <FieldError>{errors?.price}</FieldError>
        </Field>
        <Field data-invalid={!!errors?.stock}>
          <FieldLabel htmlFor="product-stock">Stock</FieldLabel>
          <Input
            id="product-stock"
            name="stock"
            inputMode="numeric"
            defaultValue={defaults.stock}
            aria-invalid={!!errors?.stock}
            required
          />
          <FieldError>{errors?.stock}</FieldError>
        </Field>
      </div>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="product-active">Active</FieldLabel>
          <FieldDescription>
            Hidden products are not shown in the shop.
          </FieldDescription>
        </FieldContent>
        <Switch
          id="product-active"
          name="isActive"
          defaultChecked={defaults.isActive ?? true}
        />
      </Field>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </FieldGroup>
  )
}
