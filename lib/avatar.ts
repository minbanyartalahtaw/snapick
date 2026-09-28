import { createAvatar } from "@dicebear/core"
import * as glass from "@dicebear/glass"

export const DEFAULT_AVATAR_COLOR = "eb4747"

// Glass's own red first, then a spread of hues the admin can pick from.
export const avatarColors = [
  { value: DEFAULT_AVATAR_COLOR, label: "Red" },
  { value: "eb7e47", label: "Orange" },
  { value: "ebb447", label: "Amber" },
  { value: "7eeb47", label: "Lime" },
  { value: "47eb7e", label: "Green" },
  { value: "47ebd0", label: "Teal" },
  { value: "47b4eb", label: "Sky" },
  { value: "477eeb", label: "Blue" },
  { value: "6247eb", label: "Indigo" },
  { value: "9947eb", label: "Purple" },
  { value: "eb47d0", label: "Pink" },
  { value: "eb4799", label: "Rose" },
  { value: "64748b", label: "Slate" },
  { value: "27272a", label: "Black" },
]

export function isAvatarColor(value: string) {
  return avatarColors.some((color) => color.value === value)
}

// Glass avatars: the seed picks the shapes, the colour is the background.
export function glassAvatar(seed: string, color = DEFAULT_AVATAR_COLOR) {
  return createAvatar(glass, {
    seed,
    backgroundColor: [color],
  }).toDataUri()
}

export function randomAvatarSeed() {
  return Math.random().toString(36).slice(2, 10)
}
