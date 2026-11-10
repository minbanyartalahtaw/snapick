import type { Metadata } from "next"

import { requireAdmin } from "@/lib/auth"

import { PasswordForm, ProfileForm } from "./settings-forms"

export const metadata: Metadata = {
  title: "Settings | Snapick",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-4 py-8 first:pt-0 last:pb-0 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

export default async function SettingsPage() {
  const admin = await requireAdmin()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Settings
      </h1>

      <div className="divide-y">
        <Section title="Profile">
          <ProfileForm
            initial={{
              name: admin.name,
              username: admin.username,
              avatar: admin.avatar,
              avatarColor: admin.avatarColor,
            }}
          />
        </Section>

        <Section title="Password">
          <PasswordForm />
        </Section>
      </div>
    </div>
  )
}
