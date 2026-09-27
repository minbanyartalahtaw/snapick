import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Snapick",
}

export default function DashboardPage() {
  return (
    <h1 className="font-heading text-2xl font-semibold tracking-tight">
      Dashboard Page
    </h1>
  )
}
