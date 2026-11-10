import type { Metadata } from "next"
import Image from "next/image"

import { SnapickWordmark } from "@/components/snapick-wordmark"

import { Bloom, BrandPanel } from "./login-art"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Login | Snapick",
}

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="relative flex flex-col overflow-hidden p-6 sm:p-10">
        <Bloom className="pointer-events-none absolute -top-28 -right-28 size-80 text-primary/[0.07] lg:hidden dark:text-white/[0.05]" />
        <div className="relative flex items-center gap-2.5">
          <Image
            src="/icons/icon-192.png"
            alt=""
            width={32}
            height={32}
            priority
            className="size-8 shrink-0"
          />
          <SnapickWordmark className="h-6 w-auto shrink-0" />
        </div>
        <div className="relative flex flex-1 items-center justify-center py-12">
          <LoginForm />
        </div>
        <p className="relative text-xs text-muted-foreground">
          Admin access only
        </p>
      </div>
      <aside className="hidden p-3 lg:block">
        <BrandPanel />
      </aside>
    </main>
  )
}
