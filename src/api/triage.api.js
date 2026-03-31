//import api from "./axios"

//export const getTriage = (params) => api.get("/triage", {params})

//export const createTriage = (data) => api.post("/triage", data)

//export const getTriageById = (id) => api.get(`/triage/${id}`)

//export const updateTriageById = (id, data) => api.patch(`/triage/${id}`, data)

//export const deleteTriageById = (id) => api.delete(`/triage/${id}`)

const STORAGE_KEY = "triage_db"

// 🔹 GET ALL (avec pagination simulée)
export const getTriage = ({ page = 1, limit = 10 } = {}) => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

  const start = (page - 1) * limit
  const end = start + limit

  return {
    data: data.slice(start, end),
    total: data.length,
    page,
    limit
  }
}

// 🔹 CREATE
export const createTriage = (triage) => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

  const newTriage = {
    id: Date.now(),
    ...triage,
    created_at: new Date().toISOString()
  }

  data.push(newTriage)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

  return newTriage
}

// 🔹 GET BY ID
export const getTriageById = (id) => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  return data.find(t => t.id == id)
}

// 🔹 UPDATE
export const updateTriageById = (id, updates) => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

  const index = data.findIndex(t => t.id == id)

  if (index !== -1) {
    data[index] = {
      ...data[index],
      ...updates,
      updated_at: new Date().toISOString()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  return data[index]
}

// 🔹 DELETE
export const deleteTriageById = (id) => {
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

  data = data.filter(t => t.id != id)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}