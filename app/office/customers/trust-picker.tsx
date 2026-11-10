"use client"

import { useState } from "react"
import { IconSelector } from "@tabler/icons-react"

import { AvatarPicker } from "@/components/avatar-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTrustLevel, trustLevels, type TrustLevel } from "@/lib/trust"
import { cn } from "@/lib/utils"

import { initials, TrustBadge } from "./customer-avatar"

// Profile picture and trust level side by side; each opens its own small picker.
export function TrustPicker({
  name,
  initialTrust,
  initialSeed,
  initialColor,
}: {
  name: string
  initialTrust: TrustLevel
  initialSeed: string
  initialColor: string
}) {
  const [trust, setTrust] = useState(initialTrust)
  const [seed, setSeed] = useState(initialSeed)
  const [color, setColor] = useState(initialColor)
  const [trustOpen, setTrustOpen] = useState(false)

  return (
    <div className="flex items-center gap-5 rounded-2xl border bg-card p-4">
      <input type="hidden" name="trust" value={trust} />
      <input type="hidden" name="avatar" value={seed} />
      <input type="hidden" name="avatarColor" value={color} />
      <AvatarPicker
        seed={seed}
        color={color}
        label={initials(name)}
        onChange={(nextSeed, nextColor) => {
          setSeed(nextSeed)
          setColor(nextColor)
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DropdownMenu open={trustOpen} onOpenChange={setTrustOpen}>
          <DropdownMenuTrigger
            aria-label="Change trust level"
            className="flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <span className="flex min-w-0 flex-col items-start gap-1">
              <TrustBadge trust={trust} className="px-2.5 py-1 text-xs" />
              <span className="truncate text-xs text-muted-foreground">
                {getTrustLevel(trust).description}
              </span>
            </span>
            <IconSelector className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--anchor-width) min-w-56 p-1.5"
          >
            <div role="radiogroup" aria-label="Trust" className="flex flex-col">
              {trustLevels.map((level) => {
                const selected = level.value === trust
                return (
                  <button
                    key={level.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setTrust(level.value)
                      setTrustOpen(false)
                    }}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg px-2.5 py-2 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30",
                      selected && "bg-muted"
                    )}
                  >
                    <TrustBadge trust={level.value} />
                    <span className="text-xs text-muted-foreground">
                      {level.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
