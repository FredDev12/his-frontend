import api from "./axios"

export const getImageries = (params) => api.get("/imagerie", { params })

export const createImagerie = (data) => api.post("/imagerie", data)

export const getImagerieById = (id) => api.get(`/imagerie/${id}`)

export const updateImagerieById = (id, data) => api.patch(`/imagerie/${id}`, data)

export const deleteImagerieById = (id) => api.delete(`/imagerie/${id}`)