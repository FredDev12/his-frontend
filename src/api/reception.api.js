import api from "./axios"

export const getReception = (params) => api.get("/receptions", {params})

export const createReception = (data) => api.post("/receptions", data)

export const getRecentesReception = (params) => api.get("/receptions/recents", {params})

export const getUrgentesReception = () => api.get("/receptions/urgentes")

export const getStatReception = () => api.get("/receptions/statistiques")

export const getSearchReception = (data) => api.get("/receptions/search", data)

export const getPatientReceptionById = (id) => api.get(`/receptions/${id}`)

export const createReceptionAdmissions = (data) => api.post("/receptions/admissions", data)

export const createReceptionAdmissionsPayment = (id) => api.post(`/receptions/admissions/${id}/payment`)

export const getReceptionById = (id) => api.get(`/receptions/${id}`)

export const updateReceptionById = (id, data) => api.patch(`/receptions/${id}`, data)

export const deleteReceptionById = (id) => api.delete(`/receptions/${id}`)

export const updateStatus =(id, data)=> api.patch(`/receptions/${id}/status`, data)