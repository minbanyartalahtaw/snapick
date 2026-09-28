import "dotenv/config"

import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../lib/generated/prisma/client"
import { randomAvatarSeed } from "../lib/avatar"
import { hashPassword } from "../lib/password"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function ask(prompt: string) {
  const rl = createInterface({ input: stdin, output: stdout })
  try {
    return await rl.question(prompt)
  } finally {
    rl.close()
  }
}

// Reads a line from the terminal without echoing it.
function askSecret(prompt: string) {
  stdout.write(prompt)
  stdin.setRawMode?.(true)
  stdin.resume()

  return new Promise<string>((resolve) => {
    let value = ""
    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\r" || char === "\n") {
          stdin.off("data", onData)
          stdin.setRawMode?.(false)
          stdin.pause()
          stdout.write("\n")
          resolve(value)
          return
        }
        if (char === "\u0003") process.exit(130)
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1)
        else value += char
      }
    }
    stdin.on("data", onData)
  })
}

async function askPassword() {
  for (;;) {
    const password = await askSecret("Password (min 8 characters): ")
    if (password.length < 8) {
      console.log("Too short.")
      continue
    }
    if ((await askSecret("Confirm password: ")) !== password) {
      console.log("Passwords do not match.")
      continue
    }
    return password
  }
}

async function main() {
  const existing = await prisma.admin.findFirst()

  // The shop has a single admin, so a second run resets that admin's password.
  if (existing) {
    console.log(
      `Admin already exists: ${existing.name} (@${existing.username}).`
    )
    const answer = await ask("Reset the password? [y/N] ")
    if (answer.trim().toLowerCase() !== "y") return

    await prisma.admin.update({
      where: { id: existing.id },
      data: { passwordHash: await hashPassword(await askPassword()) },
    })
    console.log("Password updated.")
    return
  }

  const name = (await ask("Name: ")).trim()
  const username = (await ask("Username: ")).trim()
  if (!name || !/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    console.log(
      "Name is required and username must be 3–32 letters, numbers, dots, dashes or underscores."
    )
    process.exitCode = 1
    return
  }

  await prisma.admin.create({
    data: {
      name,
      username,
      passwordHash: await hashPassword(await askPassword()),
      avatar: randomAvatarSeed(),
    },
  })
  console.log(`Admin @${username} created. You can sign in now.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
