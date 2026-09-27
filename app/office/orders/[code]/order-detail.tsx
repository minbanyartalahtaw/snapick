"use client"

import { useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { IconDownload, IconPencil } from "@tabler/icons-react"

import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { formatKyats } from "@/lib/format"
import { cn } from "@/lib/utils"

import { updateOrderNote } from "../actions"
import { StatusMenu } from "../status-menu"

export type OrderDetail = {
  id: number
  code: string
  customerCode: string | null
  customerName: string
  phone: string
  city: string
  address: string
  paymentMethod: "paid" | "cod" | "refunded"
  status: string
  note: string
  total: number
  placedAt: string
  itemCount: number
  items: {
    id: number
    name: string
    sku: string
    quantity: number
    unitPrice: number
  }[]
  events: { id: number; status: string; at: string }[]
}

const paymentLabel = {
  paid: "Paid",
  cod: "Cash on delivery",
  refunded: "Refunded",
} as const

const eventDot: Record<string, string> = {
  pending: "bg-rose-500",
  packing: "bg-violet-500",
  shipped: "bg-amber-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-zinc-400",
}

function SaveNoteButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? "Saving..." : "Save note"}
    </Button>
  )
}

export function OrderDetailView({ order }: { order: OrderDetail }) {
  const invoiceRef = useRef<HTMLElement>(null)
  const [savingImage, setSavingImage] = useState(false)
  const [imageError, setImageError] = useState("")

  async function saveImage() {
    const node = invoiceRef.current
    if (!node) return
    setSavingImage(true)
    setImageError("")
    try {
      const { domToPng } = await import("modern-screenshot")
      const url = await domToPng(node, {
        scale: 3,
        width: 720,
        backgroundColor: "#ffffff",
        filter: (el) =>
          !(el instanceof HTMLElement && el.hasAttribute("data-invoice-hide")),
      })
      const link = document.createElement("a")
      link.href = url
      link.download = `${order.code}.png`
      link.click()
    } catch {
      setImageError("Could not save the image.")
    } finally {
      setSavingImage(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <BackButton fallback="/office/orders" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/office/orders/${order.code}/edit`} />}
          >
            <IconPencil />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={savingImage}
            onClick={saveImage}
          >
            <IconDownload />
            {savingImage ? "Saving..." : "Save image"}
          </Button>
        </div>
      </div>
      {imageError && <FieldError>{imageError}</FieldError>}

      <article
        ref={invoiceRef}
        className="rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-950 shadow-sm sm:p-8"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <p className="text-lg font-semibold tracking-[0.18em] text-rose-700">SNAPICK</p>
            <p className="text-xs text-zinc-400">Online shop</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Invoice</p>
            <p className="font-mono text-sm font-semibold">{order.code}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Billed to</p>
            <p className="mt-2 font-semibold">
              {order.customerName}
              {order.customerCode && (
                <>
                  {" "}
                  <Link
                    href={`/office/customers/${order.customerCode}`}
                    className="text-xs font-normal text-zinc-400"
                  >
                    {order.customerCode}
                  </Link>
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-zinc-700">{order.phone}</p>
            {order.address && (
              <p className="mt-1 text-sm whitespace-pre-wrap text-zinc-700">{order.address}</p>
            )}
            {order.city && <p className="text-sm text-zinc-700">{order.city}</p>}
          </div>
          <dl className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 sm:justify-self-end">
            <dt className="text-[11px] tracking-wide text-zinc-400 uppercase">Date</dt>
            <dd className="text-sm font-medium">{order.placedAt}</dd>
            <dt className="text-[11px] tracking-wide text-zinc-400 uppercase">Payment</dt>
            <dd className="text-sm font-medium">{paymentLabel[order.paymentMethod]}</dd>
            <dt
              data-invoice-hide
              className="text-[11px] tracking-wide text-zinc-400 uppercase"
            >
              Status
            </dt>
            <dd data-invoice-hide>
              <StatusMenu orderId={order.id} status={order.status} variant="badge" />
            </dd>
          </dl>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-4">
          <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_5.25rem_5.75rem] gap-2 text-[11px] tracking-wide text-zinc-400 uppercase">
            <span>Item</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Amount</span>
          </div>
          <ul className="mt-2 divide-y divide-zinc-200">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_2.5rem_5.25rem_5.75rem] items-center gap-2 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.name}</p>
                  {item.sku && <p className="text-xs text-zinc-400">{item.sku}</p>}
                </div>
                <p className="text-right tabular-nums">{item.quantity}</p>
                <p className="text-right text-xs tabular-nums sm:text-sm">
                  {formatKyats(item.unitPrice)}
                </p>
                <p className="text-right text-xs font-semibold tabular-nums sm:text-sm">
                  {formatKyats(item.unitPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-2 flex items-end justify-end gap-6 border-t border-zinc-200 pt-4">
          <div className="text-right">
            <p className="text-[11px] tracking-wide text-zinc-400 uppercase">Total</p>
            <p className="text-xs text-zinc-400">
              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <p className="text-2xl font-semibold tabular-nums">{formatKyats(order.total)}</p>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-400">
          Thank you for shopping with Snapick
        </p>
      </article>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs tracking-wide text-muted-foreground uppercase">Note</h2>
        <form
          key={order.note}
          action={updateOrderNote.bind(null, order.id)}
          className="rounded-xl border p-3"
        >
          <Textarea
            name="note"
            rows={3}
            defaultValue={order.note}
            placeholder="Nothing noted yet."
          />
          <div className="mt-3 flex justify-end">
            <SaveNoteButton />
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs tracking-wide text-muted-foreground uppercase">Order history</h2>
        <ol className="divide-y rounded-xl border">
          {order.events.map((event) => (
            <li key={event.id} className="flex gap-3 px-4 py-3 text-sm">
              <span
                className={cn(
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  eventDot[event.status] ?? "bg-zinc-400"
                )}
              />
              <div>
                <p className="font-medium capitalize">{event.status}</p>
                <p className="text-xs text-muted-foreground">{event.at}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

    </div>
  )
}
