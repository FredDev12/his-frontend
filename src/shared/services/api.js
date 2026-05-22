import axios from 'axios'

const api = axios.create({
  baseURL: 'https://hopital.congoastral-app.com/api',
  //withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('his_access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers['X-Client'] = 'his-web'
  config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem('his_access_token')
      localStorage.removeItem('his_user')
    }

    return Promise.reject(error)
  },
)

export default api
