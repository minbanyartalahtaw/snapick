import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | Snapick",
}

export default function SettingsPage() {
  return (
    <h1 className="font-heading text-2xl font-semibold tracking-tight">
      Settings Page
    </h1>
  )
}
