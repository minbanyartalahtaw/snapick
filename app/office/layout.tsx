import { cookies } from "next/headers"

import { AppSidebar } from "@/components/app-sidebar"
import { FlashToast } from "@/components/flash-toast"
import { OfficeHeader } from "@/components/office-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { requireAdmin } from "@/lib/auth"

export default async function OfficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const admin = await requireAdmin()

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <TooltipProvider>
      <FlashToast />
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar admin={admin} />
        <SidebarInset>
          <OfficeHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
