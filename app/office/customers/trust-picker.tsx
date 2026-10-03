"use client"

import { useState } from "react"
import { IconPencil } from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GlassAvatar } from "@/components/glass-avatar"
import { avatarStyleSeeds, pickerAvatarColors } from "@/lib/avatar"
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
  const [tab, setTab] = useState(
    pickerAvatarColors.some((option) => option.value === initialColor)
      ? initialColor
      : pickerAvatarColors[0].value
  )

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <input type="hidden" name="trust" value={trust} />
      <input type="hidden" name="avatar" value={seed} />
      <input type="hidden" name="avatarColor" value={color} />
      <div className="flex flex-wrap items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Change profile"
            className="relative rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <CustomerAvatar
              customer={{ name, code: seed, avatar: seed, avatarColor: color }}
              className="size-16 text-base"
            />
            <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border bg-background text-foreground shadow-sm">
              <IconPencil className="size-3.5" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto p-3">
            <div className="flex flex-col gap-3">
              <div role="tablist" aria-label="Color" className="flex gap-1.5">
                {pickerAvatarColors.map((option) => {
                  const active = option.value === tab
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTab(option.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30",
                        active &&
                          "border-primary bg-background ring-1 ring-primary"
                      )}
                    >
                      <span
                        className="size-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: `#${option.value}` }}
                      />
                      <span className="hidden sm:inline">{option.label}</span>
                    </button>
                  )
                })}
              </div>
              <div
                role="radiogroup"
                aria-label="Style"
                className="grid grid-cols-4 gap-2 sm:grid-cols-8"
              >
                {avatarStyleSeeds.map((style) => {
                  const selected = style === seed && tab === color
                  return (
                    <button
                      key={style}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setSeed(style)
                        setColor(tab)
                      }}
                      className={cn(
                        "flex items-center justify-center rounded-xl border p-1.5 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30",
                        selected && "border-primary ring-1 ring-primary"
                      )}
                    >
                      <GlassAvatar
                        seed={style}
                        color={tab}
                        className="size-10"
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
