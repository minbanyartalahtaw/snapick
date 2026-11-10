"use client"

import { useActionState, useState } from "react"
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react"

import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to manage the shop.
      </p>
      <form action={action} className="mt-8">
        <FieldGroup className="gap-5">
          <Field className="gap-2">
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              key={state?.username ?? ""}
              id="username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              defaultValue={state?.username}
              required
              className="h-11 px-4"
            />
          </Field>
          <Field className="gap-2" data-invalid={!!state?.error}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup className="h-11">
              <InputGroupInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-invalid={!!state?.error}
                required
                className="h-full pl-4"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-sm"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldError>{state?.error}</FieldError>
          </Field>
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-1 h-11"
          >
            {pending && <IconLoader2 className="animate-spin" />}
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
