import { randomInt } from "node:crypto"

const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"
const LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ"

function randomString(alphabet: string, length: number) {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += alphabet[randomInt(alphabet.length)]
  }
  return result
}

export function generateCustomerCode() {
  return `SP-${randomString(CODE_ALPHABET, 6)}`
}

export function generateOrderCode(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yangon",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const part = (type: string) => parts.find((p) => p.type === type)?.value
  return `SP-${part("year")}${part("month")}${part("day")}${randomString(LETTERS, 3)}`
}
