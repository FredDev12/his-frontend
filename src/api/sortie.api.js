import api from "./axios"

export const getSorties = (params) => api.get("/sortie", { params })

export const createSortie = (data) => api.post("/sortie", data)

export const getSortieById = (id) => api.get(`/sortie/${id}`)

export const updateSortieById = (id, data) => api.patch(`/sortie/${id}`, data)

export const deleteSortieById = (id) => api.delete(`/sortie/${id}`)