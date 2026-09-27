import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customers | Snapick",
}

export default function CustomersPage() {
  return (
    <h1 className="font-heading text-2xl font-semibold tracking-tight">
      Customers Page
    </h1>
  )
}
