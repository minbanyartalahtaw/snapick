"use client"

import {
  IconLayoutDashboard,
  IconPackage,
  IconShoppingCart,
  IconUsers,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavUser, type SidebarAdmin } from "@/components/nav-user"
import { SnapickWordmark } from "@/components/snapick-wordmark"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard", url: "/office/dashboard", icon: IconLayoutDashboard },
  { title: "Orders", url: "/office/orders", icon: IconShoppingCart },
  { title: "Customers", url: "/office/customers", icon: IconUsers },
  { title: "Products", url: "/office/products", icon: IconPackage },
]

export function AppSidebar({
  admin,
  ...props
}: React.ComponentProps<typeof Sidebar> & { admin: SidebarAdmin }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/office/dashboard" />}
            >
              <Image
                src="/icons/icon-192.png"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0"
              />
              <SnapickWordmark className="h-6! w-auto! shrink-0 text-sidebar-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname.startsWith(item.url)}
                    render={<Link href={item.url} />}
                    className="text-sidebar-foreground/70 data-active:text-sidebar-accent-foreground"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser admin={admin} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
