import { IconShoppingBag } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <IconShoppingBag className="size-8" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Snapick
        </h1>
        <p className="text-muted-foreground">Coming soon</p>
      </div>
      <Button size="lg">Shop now</Button>
    </main>
  )
}
