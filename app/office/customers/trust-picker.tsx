"use client"

import { useState } from "react"
import { IconArrowsShuffle } from "@tabler/icons-react"

import { AvatarColorSelect } from "@/components/avatar-color-select"
import { Button } from "@/components/ui/button"
import { randomAvatarSeed } from "@/lib/avatar"
import { trustLevels, type TrustLevel } from "@/lib/trust"
import { cn } from "@/lib/utils"

import { CustomerAvatar, TrustBadge } from "./customer-avatar"

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

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <input type="hidden" name="trust" value={trust} />
      <input type="hidden" name="avatar" value={seed} />
      <input type="hidden" name="avatarColor" value={color} />
      <div className="flex flex-wrap items-center gap-4">
        <CustomerAvatar
          customer={{ name, code: seed, avatar: seed, avatarColor: color }}
          className="size-16 text-base"
        />
        <div className="flex flex-wrap items-center gap-2">
          <AvatarColorSelect
            id="customer-avatar-color"
            value={color}
            onValueChange={setColor}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setSeed(randomAvatarSeed())}
          >
            <IconArrowsShuffle data-icon="inline-start" />
            Shuffle
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Trust</p>
        <div
          role="radiogroup"
          aria-label="Trust"
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {trustLevels.map((level) => {
            const selected = level.value === trust
            return (
              <button
                key={level.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTrust(level.value)}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/30",
                  selected && "border-primary bg-muted/50 ring-1 ring-primary"
                )}
              >
                <TrustBadge trust={level.value} />
                <span className="text-[11px] leading-tight text-muted-foreground">
                  {level.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
