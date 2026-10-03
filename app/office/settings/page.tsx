import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"

import { PasswordForm, ProfileForm } from "./settings-forms"

export const metadata: Metadata = {
  title: "Settings | Snapick",
}

export default async function SettingsPage() {
  const admin = await requireAdmin()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Your name, username and avatar.
          </p>
        </div>
        <ProfileForm
          initial={{
            name: admin.name,
            username: admin.username,
            avatar: admin.avatar,
            avatarColor: admin.avatarColor,
          }}
        />
      </section>
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-medium">Password</h2>
          <p className="text-sm text-muted-foreground">
            Use at least 8 characters.
          </p>
        </div>
        <PasswordForm />
      </section>
    </div>
  )
}
