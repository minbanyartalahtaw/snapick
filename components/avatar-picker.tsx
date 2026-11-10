"use client"

import { useState } from "react"
import { IconPencil } from "@tabler/icons-react"

import { GlassAvatar } from "@/components/glass-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { avatarPresets } from "@/lib/avatar"
import { cn } from "@/lib/utils"

// Click the avatar, pick a shape (each has its own colour). One click sets both.
export function AvatarPicker({
  seed,
  color,
  label,
  onChange,
}: {
  seed: string
  color: string
  label?: string
  onChange: (seed: string, color: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label="Change profile picture"
        className="relative rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <GlassAvatar
          seed={seed}
          color={color}
          label={label}
          className="size-16 text-base"
        />
        <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border bg-background text-foreground shadow-sm">
          <IconPencil className="size-3.5" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto p-3">
        <div
          role="radiogroup"
          aria-label="Profile picture"
          className="grid grid-cols-4 gap-2"
        >
          {avatarPresets.map((preset) => {
            const selected = preset.seed === seed && preset.color === color
            return (
              <button
                key={preset.seed}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  onChange(preset.seed, preset.color)
                  setOpen(false)
                }}
                className={cn(
                  "rounded-full p-0.5 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30",
                  selected && "ring-2 ring-primary"
                )}
              >
                <GlassAvatar
                  seed={preset.seed}
                  color={preset.color}
                  label={label}
                  className="size-12 text-sm"
                />
              </button>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
