import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

const CSRF_STORAGE_KEY = 'his_csrf_token'
const USER_STORAGE_KEY = 'his_user'

export function setCsrfToken(token) {
  if (token) {
    sessionStorage.setItem(CSRF_STORAGE_KEY, token)
  }
}

export function getCsrfToken() {
  return sessionStorage.getItem(CSRF_STORAGE_KEY)
}

export function clearCsrfToken() {
  sessionStorage.removeItem(CSRF_STORAGE_KEY)
}

export function clearFrontendSession() {
  clearCsrfToken()
  localStorage.removeItem(USER_STORAGE_KEY)
  localStorage.removeItem('his_access_token')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const method = String(config.method || 'get').toLowerCase()

  config.headers['X-Client'] = 'his-web'
  config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone

  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const csrfToken = getCsrfToken()

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearFrontendSession()
    }

    return Promise.reject(error)
  },
)

export default api