import api from "./axios"

export const registerUser = (data) => api.post("/auth/register", data)

export const loginUser = (data) => api.post("/auth/login", data)

export const logoutUser = () => api.post("/auth/logout")

export const verifyToken = () => api.get("/auth/verify")

export const getProfile = () => api.get("/auth/profile")

export const updateProfile = (data) => api.put("/auth/profile", data)

export const changePassword = (data) => api.put("/auth/change-password", data)

export const getLoggedInUser = (userId) => api.get(`/auth/log/${userId}`)

export const getUser = () => api.get("/auth/users")