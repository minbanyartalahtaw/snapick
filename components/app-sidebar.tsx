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

import { NavUser } from "@/components/nav-user"
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
  username,
  ...props
}: React.ComponentProps<typeof Sidebar> & { username: string }) {
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
              <span className="truncate text-base font-semibold">Snapick</span>
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
        <NavUser username={username} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
