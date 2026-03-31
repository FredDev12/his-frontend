import api from "./axios"


export const getCaisse = (params) => api.get("/caisse", { params })

export const createCaisse = (data) => api.post("/caisse", data)

export const getCaisseById = (id) => api.get(`/caisse/${id}`)

export const updateCaisse = (id, data) => api.patch(`/caisse/${id}`, data)

export const deleteCaisse = (id) => api.delete(`/caisse/${id}`)