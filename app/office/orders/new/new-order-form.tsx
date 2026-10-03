"use client"

import { useEffect, useMemo, useState } from "react"
import { useActionState } from "react"
import { IconPlus, IconTrash } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

function Step({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3">
      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
        {number}
      </span>
      <h2 className="font-medium">{title}</h2>
    </div>
  )
}

function OrderFields({
  customers,
  products,
  state,
  requireStock,
}: {
  customers: OrderCustomerOption[]
  products: OrderProductOption[]
  state: OrderFormState
  requireStock: boolean
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
      ? initial?.paymentMethod ?? "cod"
      : "cod"
  )
  const [lines, setLines] = useState<(OrderLineValues & { key: number })[]>(
    initial?.lines.length
      ? initial.lines.map((line) => ({ ...line, key: Math.random() }))
      : [blankLine()]
  )

  const cityOptions = city && !cities.includes(city) ? [city, ...cities] : cities
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

  const total = lines.reduce((sum, line) => {
    const product = products.find((item) => String(item.id) === line.productId)
    const quantity = Number(line.quantity)
    if (!product || !Number.isInteger(quantity) || quantity < 1) return sum
    return sum + product.price * quantity
  }, 0)

  return (
    <>
      <section className="rounded-2xl border">
        <Step number={1} title="Customer" />
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="order-customer" className="text-sm">
              Find by customer
            </label>
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
                placeholder="Phone, code, or name"
              />
              <ComboboxContent>
                <ComboboxEmpty>No customers</ComboboxEmpty>
                <ComboboxList>
                  {(code: string) => {
                    const query = searchQuery(customers, customerCode, customerQuery)
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
                    const customer = customers.find((item) => item.code === code)
                    if (!customer) return null
                    return (
                      <ComboboxItem
                        key={code}
                        value={code}
                        className="h-auto items-center gap-3 py-2 pr-3 pl-2.5 font-normal [&>span.pointer-events-none]:hidden"
                      >
                        <CustomerAvatar customer={customer} className="size-9 text-xs" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            <SearchHighlight text={customer.name} query={query} />
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground!">
                            <SearchHighlight text={customer.code} query={query} />
                            <span className="px-1">·</span>
                            <SearchHighlight text={customer.phone} query={query} />
                          </span>
                        </span>
                      </ComboboxItem>
                    )
                  }}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="order-name" className="text-sm">
                Name
              </label>
              <Input
                id="order-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="order-phone" className="text-sm">
                Phone
              </label>
              <Input
                id="order-phone"
                name="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="order-city" className="text-sm">
                City
              </label>
              <input type="hidden" name="city" value={city} />
              <Select value={city || null} onValueChange={(value) => setCity(value ?? "")}>
                <SelectTrigger id="order-city" className="w-full">
                  <SelectValue>
                    {(value) =>
                      value || (
                        <span className="text-muted-foreground">Search a city</span>
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
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="order-address" className="text-sm">
                Address
              </label>
              <Input
                id="order-address"
                name="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border">
        <Step number={2} title="Items & payment" />
        <div className="flex flex-col gap-4 p-4">
          <div className="hidden gap-2 px-0.5 text-xs tracking-wide text-muted-foreground uppercase sm:grid sm:grid-cols-[minmax(0,1fr)_4.5rem_7.5rem_2rem]">
            <span>Product</span>
            <span>Qty</span>
            <span>Price</span>
          </div>
          {lines.map((line, index) => {
            const product = products.find((item) => String(item.id) === line.productId)
            return (
              <div
                key={line.key}
                className="grid grid-cols-[minmax(0,1fr)_4.5rem_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_4.5rem_7.5rem_2rem]"
              >
                <input type="hidden" name="productId" value={line.productId} />
                <Combobox
                  items={productItems}
                  value={line.productId || null}
                  onValueChange={(value) =>
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key
                          ? { ...item, productId: value ?? "" }
                          : item
                      )
                    )
                  }
                  itemToStringLabel={(id) =>
                    products.find((item) => String(item.id) === id)?.name ?? ""
                  }
                  filter={(id, query) => productMatches(products, id, query)}
                >
                  <ComboboxInput
                    aria-label={`Product ${index + 1}`}
                    className="w-full min-w-0"
                    placeholder="Search"
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No products</ComboboxEmpty>
                    <ComboboxList>
                      {(id: string) => {
                        const item = products.find((product) => String(product.id) === id)
                        if (!item) return null
                        return (
                          <ComboboxItem
                            key={id}
                            value={id}
                            disabled={requireStock && item.stock < 1}
                          >
                            {item.name} · {formatKyats(item.price)} · {item.stock} left
                          </ComboboxItem>
                        )
                      }}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <Input
                  name="quantity"
                  aria-label={`Quantity ${index + 1}`}
                  inputMode="numeric"
                  value={line.quantity}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) =>
                        item.key === line.key
                          ? { ...item, quantity: event.target.value }
                          : item
                      )
                    )
                  }
                />
                <div className="col-span-2 flex h-9 items-center justify-end gap-2 rounded-3xl bg-input/50 px-3 text-sm text-muted-foreground tabular-nums sm:col-span-1">
                  <span>{product ? amount.format(product.price) : ""}</span>
                  <span>Ks</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove item"
                  disabled={lines.length === 1}
                  onClick={() =>
                    setLines((current) =>
                      current.filter((item) => item.key !== line.key)
                    )
                  }
                >
                  <IconTrash />
                </Button>
              </div>
            )
          })}

          <div className="flex items-end justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLines((current) => [...current, blankLine()])}
            >
              <IconPlus />
              Add line
            </Button>
            <div className="text-right">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                Total
              </p>
              <p className="text-lg font-semibold tabular-nums">{formatKyats(total)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm">Payment</p>
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            <div className="flex flex-wrap gap-2">
              {paymentChoices.map(([value, label]) => {
                const selected = paymentMethod === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-3xl border px-4 py-2 text-sm",
                      selected ? "border-primary" : "border-border"
                    )}
                  >
                    <span
                      className={cn(
                        "size-3.5 rounded-full border",
                        selected
                          ? "border-primary bg-primary shadow-[inset_0_0_0_3px_var(--background)]"
                          : "border-muted-foreground"
                      )}
                    />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="order-note" className="text-sm">
              Note <span className="text-muted-foreground">optional</span>
            </label>
            <textarea
              id="order-note"
              name="note"
              rows={3}
              defaultValue={initial?.note ?? ""}
              className="min-h-24 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm"
            />
          </div>
        </div>
      </section>
    </>
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
    <form action={formAction} className="flex flex-col gap-4">
      <OrderFields
        key={JSON.stringify(state?.values ?? null)}
        customers={customers}
        products={products}
        state={state}
        requireStock={requireStock}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save order"}
        </Button>
      </div>
    </form>
  )
}
