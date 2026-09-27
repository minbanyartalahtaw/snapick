"use client"

import { useState } from "react"
import { useActionState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cities } from "@/lib/cities"

import {
  createCustomer,
  type CustomerFormState,
  type CustomerFormValues,
} from "../actions"

const empty: CustomerFormValues = {
  name: "",
  phone: "",
  city: "",
  address: "",
  note: "",
}

function CustomerFields({
  initial,
  pending,
}: {
  initial: CustomerFormValues
  pending: boolean
}) {
  const [city, setCity] = useState(initial.city)

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="customer-name"
          name="name"
          defaultValue={initial.name}
          placeholder="Customer name"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="customer-phone" className="text-sm font-medium">
            Mobile number
          </label>
          <Input
            id="customer-phone"
            name="phone"
            defaultValue={initial.phone}
            inputMode="tel"
            placeholder="09xxxxxxxxx"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="customer-city" className="text-sm font-medium">
            City
          </label>
          <input type="hidden" name="city" value={city} />
          <Select
            value={city || null}
            onValueChange={(value) => setCity(value ?? "")}
          >
            <SelectTrigger id="customer-city" className="w-full">
              <SelectValue>
                {(value) =>
                  value || (
                    <span className="text-muted-foreground">
                      Select a city
                    </span>
                  )
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {cities.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-address" className="text-sm font-medium">
          Address
        </label>
        <Textarea
          id="customer-address"
          name="address"
          rows={3}
          defaultValue={initial.address}
          placeholder="Street, township"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="customer-note" className="text-sm font-medium">
          Note <span className="font-normal text-muted-foreground">optional</span>
        </label>
        <Textarea
          id="customer-note"
          name="note"
          rows={3}
          defaultValue={initial.note}
          placeholder="Anything worth remembering"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/office/customers" />}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Create customer"}
        </Button>
      </div>
    </div>
  )
}

export function NewCustomerForm() {
  const [state, formAction, pending] = useActionState(
    createCustomer,
    undefined as CustomerFormState
  )
  const values = state?.values ?? empty

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && <FieldError>{state.error}</FieldError>}
      <CustomerFields
        key={JSON.stringify(values)}
        initial={values}
        pending={pending}
      />
    </form>
  )
}
