const kyats = new Intl.NumberFormat("en-US")

export function formatKyats(amount: number) {
  return `${kyats.format(amount)} Ks`
}

const yangonDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Yangon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function formatDate(date: Date) {
  return yangonDate.format(date)
}
