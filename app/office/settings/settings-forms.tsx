"use client"

import { useActionState, useEffect, useState } from "react"
import { AvatarPicker } from "@/components/avatar-picker"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import {
  changePassword,
  updateProfile,
  type PasswordFormState,
  type ProfileFormState,
  type ProfileFormValues,
} from "./actions"

function FormFooter({
  note,
  pending,
  disabled,
}: {
  note?: string
  pending: boolean
  disabled: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t bg-muted/40 px-5 py-3">
      <p className="text-xs text-muted-foreground">{note}</p>
      <Button type="submit" size="sm" disabled={pending || disabled}>
        Save
      </Button>
    </div>
  )
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ProfileFields({
  initial,
  baseline,
  pending,
  saved,
  error,
}: {
  initial: ProfileFormValues
  baseline: ProfileFormValues
  pending: boolean
  saved: boolean
  error?: string
}) {
  const [avatar, setAvatar] = useState(initial.avatar)
  const [avatarColor, setAvatarColor] = useState(initial.avatarColor)
  const [name, setName] = useState(initial.name)
  const [username, setUsername] = useState(initial.username)

  const changed =
    name.trim() !== baseline.name ||
    username.trim() !== baseline.username ||
    avatar !== baseline.avatar ||
    avatarColor !== baseline.avatarColor

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <input type="hidden" name="avatar" value={avatar} />
      <input type="hidden" name="avatarColor" value={avatarColor} />
      <div className="flex flex-col gap-5 p-5">
        {error && <FieldError>{error}</FieldError>}
        <div className="border-b pb-5">
          <AvatarPicker
            seed={avatar}
            color={avatarColor}
            onChange={(nextSeed, nextColor) => {
              setAvatar(nextSeed)
              setAvatarColor(nextColor)
            }}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="admin-name" label="Name">
            <Input
              id="admin-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Field>
          <Field id="admin-username" label="Username" hint="Used to sign in.">
            <Input
              id="admin-username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              required
            />
          </Field>
        </div>
      </div>
      <FormFooter
        note={saved && !pending ? "Saved" : undefined}
        pending={pending}
        disabled={!changed}
      />
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
        baseline={initial}
        pending={pending}
        saved={!!state?.saved}
        error={state?.error}
      />
    </form>
  )
}

export function PasswordForm() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [state, formAction, pending] = useActionState(
    async (previous: PasswordFormState, formData: FormData) => {
      const result = await changePassword(previous, formData)
      if (result?.saved) {
        setCurrent("")
        setNext("")
        setConfirm("")
      }
      return result
    },
    undefined as PasswordFormState
  )

  useEffect(() => {
    if (state?.saved) toast.add({ type: "success", title: "Password changed" })
  }, [state])

  return (
    <form
      action={formAction}
      className="overflow-hidden rounded-2xl border bg-card"
    >
      <div className="flex flex-col gap-4 p-5">
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Field id="current-password" label="Current password">
          <Input
            id="current-password"
            name="current"
            type="password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="new-password" label="New password">
            <Input
              id="new-password"
              name="next"
              type="password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
          <Field id="confirm-password" label="Confirm new password">
            <Input
              id="confirm-password"
              name="confirm"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Field>
        </div>
      </div>
      <FormFooter
        note={
          state?.saved && !pending
            ? "Password changed"
            : "Use at least 8 characters."
        }
        pending={pending}
        disabled={!current && !next && !confirm}
      />
    </form>
  )
}
