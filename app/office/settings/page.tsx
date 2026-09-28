import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"

import { PasswordForm, ProfileForm } from "./settings-forms"

export const metadata: Metadata = {
  title: "Settings | Snapick",
}

export default async function SettingsPage() {
  const admin = await requireAdmin()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      <section>
        <p className="mb-2 px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Profile
        </p>
        <ProfileForm
          initial={{
            name: admin.name,
            username: admin.username,
            avatar: admin.avatar,
            avatarColor: admin.avatarColor,
          }}
        />
      </section>
      <section>
        <p className="mb-2 px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Password
        </p>
        <PasswordForm />
      </section>
    </div>
  )
}
