import { Avatar } from "@/components/ui/avatar"
import { glassAvatar } from "@/lib/avatar"
import { cn } from "@/lib/utils"

export function GlassAvatar({
  seed,
  color,
  label,
  className,
}: {
  seed: string
  color?: string
  label?: string
  className?: string
}) {
  return (
    <Avatar className={cn("size-10", className)}>
      {/* A data URI needs no loading state, so skip AvatarImage and render it
          on the server too. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={glassAvatar(seed, color)}
        alt=""
        className="aspect-square size-full rounded-full object-cover"
      />
      {label && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full font-semibold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.35)]">
          {label}
        </span>
      )}
    </Avatar>
  )
}
