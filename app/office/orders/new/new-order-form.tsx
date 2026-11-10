"use client"

import { useEffect, useMemo, useState } from "react"
import { useActionState } from "react"
import {
  IconLoader2,
  IconMinus,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { CustomerAvatar } from "@/app/office/customers/customer-avatar"
import { SearchHighlight } from "@/components/search-highlight"
import { cities } from "@/lib/cities"
import { formatKyats } from "@/lib/format"
import { cn } from "@/lib/utils"

import {
  createOrder,
  type OrderFormState,
  type OrderFormValues,
  type OrderLineValues,
} from "../actions"

export type OrderCustomerOption = {
  code: string
  name: string
  phone: string
  city: string
  address: string
  avatar: string | null
  avatarColor: string
}

export type OrderProductOption = {
  id: number
  name: string
  sku: string
  price: number
  stock: number
}

const amount = new Intl.NumberFormat("en-US")

function compact(value: string) {
  return value.replace(/[\s-]/g, "").toLowerCase()
}

function customerLabel(customers: OrderCustomerOption[], code: string) {
  if (!code || code === "walk-in") return "Walk-in"
  const customer = customers.find((item) => item.code === code)
  return customer ? `${customer.name} · ${customer.code}` : code
}

function customerMatches(
  customers: OrderCustomerOption[],
  code: string,
  query: string
) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (code === "walk-in") return "walk-in".includes(q)
  const customer = customers.find((item) => item.code === code)
  if (!customer) return false
  return (
    customer.code.toLowerCase().includes(q) ||
    customer.name.toLowerCase().includes(q) ||
    compact(customer.phone).includes(compact(q))
  )
}

function searchQuery(
  customers: OrderCustomerOption[],
  selectedCode: string,
  query: string
) {
  const q = query.trim()
  if (!q) return ""
  const label = customerLabel(customers, selectedCode || "walk-in")
  if (q.toLowerCase() === label.toLowerCase()) return ""
  return q
}

function productMatches(
  products: OrderProductOption[],
  id: string,
  query: string
) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const product = products.find((item) => String(item.id) === id)
  return Boolean(product && product.name.toLowerCase().includes(q))
}

function blankLine(): OrderLineValues & { key: number } {
  return { key: Date.now() + Math.random(), productId: "", quantity: "1" }
}

const PAYMENT_HINTS: Record<string, string> = {
  paid: "Already paid in full",
  cod: "Collect the money on delivery",
  refunded: "Money returned to the customer",
}

const ITEM_COLUMNS = "sm:grid-cols-[minmax(0,1fr)_7rem_7.5rem_2rem]"

function Section({
  number,
  title,
  hint,
  children,
}: {
  number: number
  title: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card">
      <div className="flex items-center gap-3 border-b px-4 py-3.5 sm:px-5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground tabular-nums">
          {number}
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-medium">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4 sm:p-5">{children}</div>
    </section>
  )
}

function FormField({
  label,
  htmlFor,
  optional = false,
  children,
}: {
  label: string
  htmlFor: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={htmlFor}>
        {label}
        {optional && (
          <span className="font-normal text-muted-foreground">optional</span>
        )}
      </Label>
      {children}
    </div>
  )
}

function OrderFields({
  customers,
  products,
  state,
  requireStock,
  pending,
}: {
  customers: OrderCustomerOption[]
  products: OrderProductOption[]
  state: OrderFormState
  requireStock: boolean
  pending: boolean
}) {
  const initial = state?.values
  const paymentChoices = [
    ["paid", "Paid"],
    ["cod", "Cash on delivery"],
    ...(initial?.paymentMethod === "refunded"
      ? [["refunded", "Refunded"] as const]
      : []),
  ] as const
  const [customerCode, setCustomerCode] = useState(initial?.customerCode ?? "")
  const [customerQuery, setCustomerQuery] = useState("")
  const [name, setName] = useState(initial?.name ?? "")
  const [phone, setPhone] = useState(initial?.phone ?? "")
  const [city, setCity] = useState(initial?.city ?? "")
  const [address, setAddress] = useState(initial?.address ?? "")
  const [paymentMethod, setPaymentMethod] = useState(
    paymentChoices.some(([value]) => value === initial?.paymentMethod)
      ? (initial?.paymentMethod ?? "cod")
      : "cod"
  )
  const [lines, setLines] = useState<(OrderLineValues & { key: number })[]>(
    initial?.lines.length
      ? initial.lines.map((line) => ({ ...line, key: Math.random() }))
      : [blankLine()]
  )

  const cityOptions =
    city && !cities.includes(city) ? [city, ...cities] : cities
  const customerItems = useMemo(
    () => ["walk-in", ...customers.map((customer) => customer.code)],
    [customers]
  )
  const productItems = useMemo(
    () => products.map((product) => String(product.id)),
    [products]
  )

  function chooseCustomer(code: string | null) {
    const next = !code || code === "walk-in" ? "" : code
    setCustomerCode(next)
    const customer = customers.find((item) => item.code === next)
    if (!customer) return
    setName(customer.name)
    setPhone(customer.phone)
    setCity(customer.city)
    setAddress(customer.address)
  }

  function updateLine(key: number, patch: Partial<OrderLineValues>) {
    setLines((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )
  }

  function stepQuantity(key: number, quantity: string, delta: number) {
    const current = Number(quantity)
    const base = Number.isInteger(current) && current > 0 ? current : 1
    updateLine(key, { quantity: String(Math.max(1, base + delta)) })
  }

  const rows = lines.map((line) => {
    const product = products.find((item) => String(item.id) === line.productId)
    const quantity = Number(line.quantity)
    const valid =
      Boolean(product) && Number.isInteger(quantity) && quantity >= 1
    return {
      line,
      product,
      quantity,
      valid,
      amount: product && valid ? product.price * quantity : 0,
    }
  })
  const counted = rows.filter((row) => row.valid)
  const total = counted.reduce((sum, row) => sum + row.amount, 0)
  const pieces = counted.reduce((sum, row) => sum + row.quantity, 0)
  const paymentLabel =
    paymentChoices.find(([value]) => value === paymentMethod)?.[1] ?? ""

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <Section
          number={1}
          title="Customer"
          hint="Pick a saved customer to fill in the details, or type them in for a walk-in."
        >
          <FormField label="Saved customer" htmlFor="order-customer" optional>
            <input type="hidden" name="customerCode" value={customerCode} />
            <Combobox
              items={customerItems}
              value={customerCode || null}
              onValueChange={chooseCustomer}
              onInputValueChange={setCustomerQuery}
              itemToStringLabel={(code) => customerLabel(customers, code)}
              filter={(code, query) =>
                customerMatches(
                  customers,
                  code,
                  searchQuery(customers, customerCode, query)
                )
              }
            >
              <ComboboxInput
                id="order-customer"
                className="w-full"
                placeholder="Search by name, phone or code"
              />
              <ComboboxContent>
                <ComboboxEmpty>No customers</ComboboxEmpty>
                <ComboboxList>
                  {(code: string) => {
                    const query = searchQuery(
                      customers,
                      customerCode,
                      customerQuery
                    )
                    if (code === "walk-in") {
                      return (
                        <ComboboxItem
                          key="walk-in"
                          value="walk-in"
                          className="pr-3 [&>span.pointer-events-none]:hidden"
                        >
                          <SearchHighlight text="Walk-in" query={query} />
                        </ComboboxItem>
                      )
                    }
                    const customer = customers.find(
                      (item) => item.code === code
                    )
                    if (!customer) return null
                    return (
                      <ComboboxItem
                        key={code}
                        value={code}
                        className="h-auto items-center gap-3 py-2 pr-3 pl-2.5 font-normal [&>span.pointer-events-none]:hidden"
                      >
                        <CustomerAvatar
                          customer={customer}
                          className="size-9 text-xs"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            <SearchHighlight
                              text={customer.name}
                              query={query}
                            />
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground!">
                            <SearchHighlight
                              text={customer.code}
                              query={query}
                            />
                            <span className="px-1">·</span>
                            <SearchHighlight
                              text={customer.phone}
                              query={query}
                            />
                          </span>
                        </span>
                      </ComboboxItem>
                    )
                  }}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name" htmlFor="order-name">
              <Input
                id="order-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </FormField>
            <FormField label="Phone" htmlFor="order-phone">
              <Input
                id="order-phone"
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                required
              />
            </FormField>
            <FormField label="City" htmlFor="order-city">
              <input type="hidden" name="city" value={city} />
              <Select
                value={city || null}
                onValueChange={(value) => setCity(value ?? "")}
              >
                <SelectTrigger id="order-city" className="w-full">
                  <SelectValue>
                    {(value) =>
                      value || (
                        <span className="text-muted-foreground">
                          Choose a city
                        </span>
                      )
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Address" htmlFor="order-address" optional>
              <Input
                id="order-address"
                name="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </FormField>
          </div>
        </Section>

        <Section
          number={2}
          title="Items"
          hint="Choose each product and how many pieces."
        >
          <div>
            <div
              className={cn(
                "hidden gap-2 pb-2 text-[11px] font-medium tracking-widest text-muted-foreground uppercase sm:grid",
                ITEM_COLUMNS
              )}
            >
              <span>Product</span>
              <span>Quantity</span>
              <span className="text-right">Amount</span>
            </div>
            <ul className="divide-y sm:border-t">
              {rows.map(({ line, product, quantity, valid, amount }, index) => {
                const short =
                  requireStock && product && valid && quantity > product.stock
                return (
                  <li
                    key={line.key}
                    className={cn(
                      "grid grid-cols-[minmax(0,1fr)_2rem] items-start gap-2 py-3 first:pt-0 last:pb-0 sm:first:pt-3",
                      ITEM_COLUMNS
                    )}
                  >
                    <div className="min-w-0">
                      <input
                        type="hidden"
                        name="productId"
                        value={line.productId}
                      />
                      <Combobox
                        items={productItems}
                        value={line.productId || null}
                        onValueChange={(value) =>
                          updateLine(line.key, { productId: value ?? "" })
                        }
                        itemToStringLabel={(id) =>
                          products.find((item) => String(item.id) === id)
                            ?.name ?? ""
                        }
                        filter={(id, query) =>
                          productMatches(products, id, query)
                        }
                      >
                        <ComboboxInput
                          aria-label={`Product ${index + 1}`}
                          className="w-full min-w-0"
                          placeholder="Search a product"
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>No products</ComboboxEmpty>
                          <ComboboxList>
                            {(id: string) => {
                              const item = products.find(
                                (option) => String(option.id) === id
                              )
                              if (!item) return null
                              const out = item.stock < 1
                              return (
                                <ComboboxItem
                                  key={id}
                                  value={id}
                                  disabled={requireStock && out}
                                  className="h-auto flex-col items-start gap-0.5 font-normal"
                                >
                                  <span className="max-w-full truncate font-medium">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground! tabular-nums">
                                    {formatKyats(item.price)}
                                    <span className="px-1">·</span>
                                    {out
                                      ? "Out of stock"
                                      : `${item.stock} left`}
                                  </span>
                                </ComboboxItem>
                              )
                            }}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {product && (
                        <p
                          className={cn(
                            "mt-1.5 px-3 text-xs tabular-nums",
                            short ? "text-destructive" : "text-muted-foreground"
                          )}
                        >
                          {short
                            ? `Only ${product.stock} in stock`
                            : requireStock
                              ? `${formatKyats(product.price)} each · ${product.stock} in stock`
                              : `${formatKyats(product.price)} each`}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove item ${index + 1}`}
                      disabled={lines.length === 1}
                      className="mt-0.5 text-muted-foreground sm:order-last"
                      onClick={() =>
                        setLines((current) =>
                          current.filter((item) => item.key !== line.key)
                        )
                      }
                    >
                      <IconTrash />
                    </Button>
                    <div className="col-span-2 flex items-center justify-between gap-3 sm:contents">
                      <InputGroup className="w-28 sm:w-full">
                        <InputGroupAddon align="inline-start">
                          <InputGroupButton
                            size="icon-xs"
                            aria-label={`Decrease quantity ${index + 1}`}
                            disabled={!(quantity > 1)}
                            onClick={() =>
                              stepQuantity(line.key, line.quantity, -1)
                            }
                          >
                            <IconMinus />
                          </InputGroupButton>
                        </InputGroupAddon>
                        <InputGroupInput
                          name="quantity"
                          aria-label={`Quantity ${index + 1}`}
                          inputMode="numeric"
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(line.key, {
                              quantity: event.target.value,
                            })
                          }
                          className="px-0 text-center tabular-nums"
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="icon-xs"
                            aria-label={`Increase quantity ${index + 1}`}
                            onClick={() =>
                              stepQuantity(line.key, line.quantity, 1)
                            }
                          >
                            <IconPlus />
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      <p className="flex h-9 items-center justify-end text-sm font-medium tabular-nums">
                        {product && valid ? (
                          formatKyats(amount)
                        ) : (
                          <span className="font-normal text-muted-foreground">
                            —
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLines((current) => [...current, blankLine()])}
            >
              <IconPlus />
              Add item
            </Button>
          </div>
        </Section>

        <Section
          number={3}
          title="Payment and note"
          hint="How the customer pays, and anything worth remembering."
        >
          <div
            role="radiogroup"
            aria-label="Payment method"
            className="grid gap-2 sm:grid-cols-2"
          >
            {paymentChoices.map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/30"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={() => setPaymentMethod(value)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50 peer-checked:border-primary peer-checked:bg-primary after:size-1.5 after:rounded-full after:bg-primary-foreground after:opacity-0 peer-checked:after:opacity-100"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {PAYMENT_HINTS[value]}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <FormField label="Note" htmlFor="order-note" optional>
            <Textarea
              id="order-note"
              name="note"
              rows={3}
              defaultValue={initial?.note ?? ""}
              className="min-h-24"
            />
          </FormField>
        </Section>
      </div>

      <aside className="rounded-2xl border bg-card xl:sticky xl:top-18">
        <div className="border-b px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-medium">Order summary</h2>
        </div>
        <dl className="flex flex-col gap-2.5 px-4 py-4 text-sm sm:px-5">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-muted-foreground">Customer</dt>
            <dd className="min-w-0 truncate text-right">
              {name.trim() || (
                <span className="text-muted-foreground">Not set</span>
              )}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-muted-foreground">Payment</dt>
            <dd className="min-w-0 truncate text-right">{paymentLabel}</dd>
          </div>
        </dl>
        <div className="border-t px-4 py-4 sm:px-5">
          {counted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="flex flex-col gap-2.5 text-sm">
              {counted.map((row) => (
                <li key={row.line.key} className="flex items-baseline gap-2">
                  <span className="min-w-0 flex-1 truncate">
                    {row.product?.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    × {row.quantity}
                  </span>
                  <span className="w-24 shrink-0 text-right tabular-nums">
                    {formatKyats(row.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t px-4 py-4 sm:px-5">
          <div>
            <p className="text-sm font-medium">Total</p>
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {pieces} {pieces === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {amount.format(total)}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              Ks
            </span>
          </p>
        </div>
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-11 w-full"
          >
            {pending && <IconLoader2 className="animate-spin" />}
            {pending ? "Saving..." : "Save order"}
          </Button>
        </div>
      </aside>
    </div>
  )
}

export function NewOrderForm({
  customers,
  products,
  action = createOrder,
  initial,
  requireStock = true,
}: {
  customers: OrderCustomerOption[]
  products: OrderProductOption[]
  action?: (
    state: OrderFormState,
    formData: FormData
  ) => Promise<OrderFormState>
  initial?: OrderFormValues
  requireStock?: boolean
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initial ? { values: initial } : undefined
  )

  useEffect(() => {
    if (state?.error) toast.add({ type: "error", title: state.error })
  }, [state])

  return (
    <form action={formAction}>
      <OrderFields
        key={JSON.stringify(state?.values ?? null)}
        customers={customers}
        products={products}
        state={state}
        requireStock={requireStock}
        pending={pending}
      />
    </form>
  )
}
