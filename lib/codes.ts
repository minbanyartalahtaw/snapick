import { randomInt, randomUUID } from "node:crypto"

const LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ"

function randomString(alphabet: string, length: number) {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += alphabet[randomInt(alphabet.length)]
  }
  return result
}

// Unguessable id used in office URLs (32 hex chars, same shape as the DB default).
export function generateUid() {
  return randomUUID().replaceAll("-", "")
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
