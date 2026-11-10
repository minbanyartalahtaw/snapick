import { cn } from "@/lib/utils"

const PETAL_PATH = "M0 0A62.5 62.5 0 0 1 0 -100A62.5 62.5 0 0 1 0 0Z"
const PETALS = [0, 45, 90, 135, 180, 225, 270, 315]

const JOURNEY = [
  { label: "Pending", dot: "bg-rose-500" },
  { label: "Packing", dot: "bg-violet-500" },
  { label: "Shipped", dot: "bg-amber-500" },
  { label: "Delivered", dot: "bg-emerald-500" },
]

export function Bloom({
  accent = false,
  className,
  ...props
}: React.ComponentProps<"svg"> & { accent?: boolean }) {
  return (
    <svg
      viewBox="-104 -104 208 208"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {PETALS.map((angle, index) =>
        accent && index === 1 ? (
          <path
            key={angle}
            d={PETAL_PATH}
            transform={`rotate(${angle})`}
            className="fill-[#FF7A98]"
            fillOpacity={0.9}
          />
        ) : (
          <path
            key={angle}
            d={PETAL_PATH}
            transform={`rotate(${angle})`}
            fill="currentColor"
            fillOpacity={index % 2 ? 0.55 : 1}
          />
        )
      )}
    </svg>
  )
}

export function BrandPanel() {
  return (
    <div className="relative flex h-full flex-col justify-end overflow-hidden rounded-[2rem] bg-primary p-10 text-primary-foreground xl:p-14">
      <Bloom
        accent
        className="pointer-events-none absolute -top-[22%] -right-[26%] aspect-square w-[92%] animate-[spin_240s_linear_infinite] text-white/10 motion-reduce:animate-none"
      />
      <div className="relative">
        <p className="text-[11px] font-medium tracking-widest text-white/70 uppercase">
          Snapick Office
        </p>
        <p className="mt-4 max-w-md text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-white xl:max-w-xl xl:text-5xl">
          Orders, customers and stock in one place.
        </p>
        <ol className="mt-10 flex flex-wrap items-center gap-y-2">
          {JOURNEY.map((step, index) => (
            <li key={step.label} className="flex items-center">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="h-px w-3 bg-white/40 xl:w-8"
                />
              )}
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-medium text-zinc-900">
                <span className={cn("size-1.5 rounded-full", step.dot)} />
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
