import { searchPatients } from "../../../api/patients.api"
import { searchAgents } from "../../../api/agents.api"

export const findPatient = async (query)=>{

const res = await searchPatients(query)

return res.data.data

}

export const findAgent = async (query)=>{

const res = await searchAgents({nom_post:query})

return res.data.data

}

const clean = (v) => {
  const s = (v ?? "").toString().trim()
  if (!s) return ""
  if (s.toLowerCase() === "null") return ""
  return s.replace(/\s+/g, " ").trim()
}

const phoneTokens = (phone) => {
  const s = clean(phone)
  if (!s) return []
  // split par -, /, espace, virgule
  return s.split(/[-/,\s]+/).map(p => p.trim()).filter(Boolean)
}

export const smartFindExistingPatient = async ({ relation, agent, typedName }) => {
  const queries = []

  if (relation === "SELF") {
    if (clean(agent?.cac_id_co)) queries.push(clean(agent.cac_id_co))
    phoneTokens(agent?.telephone).forEach(t => queries.push(t))
    if (clean(agent?.nom_post)) queries.push(clean(agent.nom_post))
    if (clean(agent?.prenom)) queries.push(clean(agent.prenom))
  }

  if (relation === "SPOUSE") {
    if (clean(agent?.nom_conjoint) && clean(agent.nom_conjoint) !== "-") queries.push(clean(agent.nom_conjoint))
    // le conjoint a parfois le même tel sur CAC (pas parfait mais utile)
    phoneTokens(agent?.telephone).forEach(t => queries.push(t))
  }

  if (relation === "PARENT") {
    if (clean(agent?.parents) && clean(agent.parents) !== "-") queries.push(clean(agent.parents))
  }

  if (relation === "CHILD") {
    if (clean(typedName)) queries.push(clean(typedName))
  }

  // supprime doublons
  const uniqueQueries = [...new Set(queries)].filter(q => q.length >= 2)

  for (const q of uniqueQueries) {
    const res = await searchPatients(q)
    const data = res?.data?.data || []
    if (data.length > 0) {
      return { found: true, query: q, matches: data, tried: uniqueQueries }
    }
  }

  return { found: false, query: null, matches: [], tried: uniqueQueries }
}