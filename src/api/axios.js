import axios from "axios"
import { useLoaderStore } from "../stores/loader.store"

const api = axios.create({
  baseURL: "https://hopital.congoastral-app.com/api",
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const loader = useLoaderStore()

  loader.show()

  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(

  response=>{

    const loader = useLoaderStore()

    loader.hide()

    return response

  },

  error=>{

    const loader = useLoaderStore()

    loader.hide()

    return Promise.reject(error)

  }

)


export default api