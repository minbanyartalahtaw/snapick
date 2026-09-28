"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { avatarColors } from "@/lib/avatar"

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="size-3.5 shrink-0 rounded-full border border-black/10"
      style={{ backgroundColor: `#${color}` }}
    />
  )
}

export function AvatarColorSelect({
  id,
  value,
  onValueChange,
}: {
  id?: string
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={(next) => next && onValueChange(next)}>
      <SelectTrigger id={id} className="w-36">
        <SelectValue>
          {(current: string) => (
            <span className="flex items-center gap-2">
              <Swatch color={current} />
              {avatarColors.find((color) => color.value === current)?.label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {avatarColors.map((color) => (
          <SelectItem key={color.value} value={color.value}>
            <Swatch color={color.value} />
            {color.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
