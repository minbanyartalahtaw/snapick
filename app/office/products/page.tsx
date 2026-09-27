import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products | Snapick",
}

export default function ProductsPage() {
  return (
    <h1 className="font-heading text-2xl font-semibold tracking-tight">
      Products Page
    </h1>
  )
}
