"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

type Labels = Record<string, string>
type SetLabel = (segment: string, label: string | null) => void

const LabelsContext = createContext<Labels>({})
const SetLabelContext = createContext<SetLabel | null>(null)

// Lets a page swap an opaque URL segment (like an order's uid) for something
// readable (its code) in the header breadcrumb.
export function BreadcrumbLabelProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Labels>({})

  // Stable identity, so pages' effects don't re-run when labels change.
  const setLabel = useCallback<SetLabel>((segment, label) => {
    setLabels((current) => {
      if (label === null) {
        if (!(segment in current)) return current
        const next = { ...current }
        delete next[segment]
        return next
      }
      return current[segment] === label
        ? current
        : { ...current, [segment]: label }
    })
  }, [])

  return (
    <SetLabelContext.Provider value={setLabel}>
      <LabelsContext.Provider value={labels}>{children}</LabelsContext.Provider>
    </SetLabelContext.Provider>
  )
}

export function useBreadcrumbLabels() {
  return useContext(LabelsContext)
}

export function BreadcrumbLabel({
  segment,
  label,
}: {
  segment: string
  label: string
}) {
  const setLabel = useContext(SetLabelContext)
  useEffect(() => {
    setLabel?.(segment, label)
    return () => setLabel?.(segment, null)
  }, [setLabel, segment, label])
  return null
}
