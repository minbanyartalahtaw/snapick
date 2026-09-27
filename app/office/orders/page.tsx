import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Orders | Snapick",
}

export default function OrdersPage() {
  return (
    <h1 className="font-heading text-2xl font-semibold tracking-tight">
      Orders Page
    </h1>
  )
}
