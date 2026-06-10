const fs = require("node:fs")
const path = require("node:path")
const { TextDecoder } = require("node:util")

const root = path.join(process.cwd(), "src")
const decoder = new TextDecoder("utf-8", { fatal: true })

const extensions = new Set([
  ".vue",
  ".js",
  ".ts",
  ".css",
  ".html",
])

let invalidFiles = []

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(fullPath)
      continue
    }

    if (!extensions.has(path.extname(entry.name))) {
      continue
    }

    const buffer = fs.readFileSync(fullPath)

    try {
      decoder.decode(buffer)
    } catch {
      invalidFiles.push(fullPath)
      console.log("ENCODAGE NON UTF-8 :", fullPath)
    }
  }
}

walk(root)

if (invalidFiles.length === 0) {
  console.log("Tous les fichiers src sont valides en UTF-8.")
} else {
  console.log("")
  console.log(`${invalidFiles.length} fichier(s) à convertir en UTF-8.`)
  process.exitCode = 1
}