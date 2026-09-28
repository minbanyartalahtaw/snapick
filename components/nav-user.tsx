"use client"

import { useState } from "react"
import {
  IconLogout,
  IconMoon,
  IconSelector,
  IconSettings,
} from "@tabler/icons-react"
import Link from "next/link"
import { useTheme } from "next-themes"

import { logout } from "@/app/actions/auth"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { GlassAvatar } from "@/components/glass-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

export type SidebarAdmin = {
  name: string
  username: string
  avatar: string
  avatarColor: string
}

function UserInfo({ admin }: { admin: SidebarAdmin }) {
  return (
    <>
      <GlassAvatar
        seed={admin.avatar}
        color={admin.avatarColor}
        className="size-8"
      />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{admin.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          @{admin.username}
        </span>
      </div>
    </>
  )
}

export function NavUser({ admin }: { admin: SidebarAdmin }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const isDark = resolvedTheme === "dark"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-sidebar-accent"
              />
            }
          >
            <UserInfo admin={admin} />
            <IconSelector className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56"
            side="top"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 p-1.5 text-foreground">
                <UserInfo admin={admin} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/office/settings" />}>
                <IconSettings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                closeOnClick={false}
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                <IconMoon />
                Dark mode
                <Switch
                  size="sm"
                  checked={isDark}
                  tabIndex={-1}
                  aria-hidden
                  className="pointer-events-none ml-auto"
                />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setLogoutOpen(true)}
            >
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Log out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to access the office.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={logout} className="grid">
                <Button type="submit" variant="destructive">
                  Log out
                </Button>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
