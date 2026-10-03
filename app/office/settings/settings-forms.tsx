"use client"

import { useActionState, useEffect, useState } from "react"
import { IconArrowsShuffle } from "@tabler/icons-react"

import { AvatarColorSelect } from "@/components/avatar-color-select"
import { GlassAvatar } from "@/components/glass-avatar"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { randomAvatarSeed } from "@/lib/avatar"

import {
  changePassword,
  updateProfile,
  type PasswordFormState,
  type ProfileFormState,
  type ProfileFormValues,
} from "./actions"

function ProfileFields({
  initial,
  pending,
  saved,
  error,
}: {
  initial: ProfileFormValues
  pending: boolean
  saved: boolean
  error?: string
}) {
  const [avatar, setAvatar] = useState(initial.avatar)
  const [avatarColor, setAvatarColor] = useState(initial.avatarColor)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <input type="hidden" name="avatar" value={avatar} />
      <input type="hidden" name="avatarColor" value={avatarColor} />
      {error && <FieldError>{error}</FieldError>}
      <div className="flex items-center gap-4">
        <GlassAvatar seed={avatar} color={avatarColor} className="size-14" />
        <div className="flex flex-wrap items-center gap-2">
          <AvatarColorSelect
            id="admin-avatar-color"
            value={avatarColor}
            onValueChange={setAvatarColor}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAvatar(randomAvatarSeed())}
          >
            <IconArrowsShuffle data-icon="inline-start" />
            Shuffle
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="admin-name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="admin-name"
            name="name"
            defaultValue={initial.name}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="admin-username" className="text-sm font-medium">
            Username
          </label>
          <Input
            id="admin-username"
            name="username"
            defaultValue={initial.username}
            autoComplete="username"
            autoCapitalize="none"
            required
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        {saved && !pending && (
          <span className="text-xs text-muted-foreground">Saved</span>
        )}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </div>
  )
}

export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    undefined as ProfileFormState
  )
  const values = state?.values ?? initial

  useEffect(() => {
    if (state?.saved) toast.add({ type: "success", title: "Profile saved" })
  }, [state])

  return (
    <form action={formAction}>
      <ProfileFields
        key={JSON.stringify(values)}
        initial={values}
        pending={pending}
        saved={!!state?.saved}
        error={state?.error}
      />
    </form>
  )
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    undefined as PasswordFormState
  )

  useEffect(() => {
    if (state?.saved) toast.add({ type: "success", title: "Password changed" })
  }, [state])

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4"
    >
      {state?.error && <FieldError>{state.error}</FieldError>}
      <div className="flex flex-col gap-2">
        <label htmlFor="current-password" className="text-sm font-medium">
          Current password
        </label>
        <Input
          id="current-password"
          name="current"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="new-password" className="text-sm font-medium">
            New password
          </label>
          <Input
            id="new-password"
            name="next"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirm-password" className="text-sm font-medium">
            Confirm new password
          </label>
          <Input
            id="confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        {state?.saved && !pending && (
          <span className="text-xs text-muted-foreground">
            Password changed
          </span>
        )}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Change password"}
        </Button>
      </div>
    </form>
  )
}
