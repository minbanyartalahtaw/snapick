const kyats = new Intl.NumberFormat("en-US")

export function formatKyats(amount: number) {
  return `${kyats.format(amount)} Ks`
}
