const fs = require("node:fs")
const path = require("node:path")
const { TextDecoder } = require("node:util")

const files = [
  "src/modules/patients/components/PatientForm.vue",
  "src/modules/patients/stores/patients.store.js",
]

const decoder = new TextDecoder("windows-1252")

for (const relativePath of files) {
  const filePath = path.join(process.cwd(), relativePath)

  if (!fs.existsSync(filePath)) {
    console.log("Fichier introuvable :", relativePath)
    continue
  }

  const backupPath = `${filePath}.bak`

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath)
  }

  const buffer = fs.readFileSync(filePath)
  const content = decoder.decode(buffer)

  fs.writeFileSync(filePath, content, { encoding: "utf8" })

  console.log("Converti en UTF-8 :", relativePath)
}

console.log("Conversion terminée.")
