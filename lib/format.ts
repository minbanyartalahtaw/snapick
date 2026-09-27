const kyats = new Intl.NumberFormat("en-US")

export function formatKyats(amount: number) {
  return `${kyats.format(amount)} Ks`
}

const yangonStamp = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Yangon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h12",
})

export function formatStamp(date: Date) {
  const parts = yangonStamp.formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""
  return `${pick("year")}-${pick("month")}-${pick("day")} ${pick("hour")}:${pick("minute")} ${pick("dayPeriod").toUpperCase()}`
}

export function formatDate(date: Date) {
  return formatStamp(date)
}

export function formatDateTime(date: Date) {
  return formatStamp(date)
}
