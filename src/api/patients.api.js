//import api from "./axios"

//export const getPatients = () => api.get("/patients")

//export const createPatient = (data) => api.post("/patients", data)

//export const searchPatients = (q) => api.get("/patients/search", { params: { q } })

//export const getPatient = (id) => api.get(`/patients/${id}`)

//export const updatePatient = (id, data) => api.patch(`/patients/${id}`, data)

//export const deletePatient = (id) => api.delete(`/patients/${id}`)


const STORAGE_KEY = "patients_db"

// 🔹 récupérer tous les patients
export const getPatients = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// 🔹 sauvegarder toute la liste
const savePatients = (patients) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
}

// 🔹 créer patient
export const createPatient = (patient) => {
  const patients = getPatients()

  const newPatient = {
    id: Date.now(), // ID unique simple
    ...patient,
    created_at: new Date().toISOString()
  }

  patients.push(newPatient)
  savePatients(patients)

  return newPatient
}

// 🔹 chercher patient
export const searchPatients = (q) => {
  const patients = getPatients()

  return patients.filter(p =>
    p.nom?.toLowerCase().includes(q.toLowerCase()) ||
    p.prenom?.toLowerCase().includes(q.toLowerCase()) ||
    p.numero_fiche?.includes(q)
  )
}

// 🔹 récupérer un patient
export const getPatient = (id) => {
  return getPatients().find(p => p.id == id)
}

// 🔹 update
export const updatePatient = (id, data) => {
  const patients = getPatients()

  const index = patients.findIndex(p => p.id == id)
  if (index !== -1) {
    patients[index] = { ...patients[index], ...data }
    savePatients(patients)
  }

  return patients[index]
}

// 🔹 delete
export const deletePatient = (id) => {
  let patients = getPatients()

  patients = patients.filter(p => p.id != id)
  savePatients(patients)
}