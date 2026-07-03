import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = token || null;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export function getCsrfToken() {
  return csrfToken;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Client": "his-frontend"
  }
});

apiClient.interceptors.request.use((config) => {
  const method = String(config.method || "get").toUpperCase();

  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) {
    config.headers = config.headers || {};
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const response = error.response;

    const normalized = {
      success: false,
      status: response?.status || 0,
      code: response?.data?.code || "NETWORK_OR_API_ERROR",
      message:
        response?.data?.message ||
        error.message ||
        "Erreur de communication avec le serveur HIS.",
      requestId: response?.data?.requestId || response?.headers?.["x-request-id"] || null,
      details: response?.data?.details || null,
      raw: response?.data || null
    };

    if (normalized.status === 401) {
      window.dispatchEvent(new CustomEvent("his:auth-required", { detail: normalized }));
    }

    if (normalized.status === 403) {
      window.dispatchEvent(new CustomEvent("his:forbidden", { detail: normalized }));
    }

    return Promise.reject(normalized);
  }
);

export async function apiGet(url, config = {}) {
  return apiClient.get(url, config);
}

export async function apiPost(url, data = {}, config = {}) {
  return apiClient.post(url, data, config);
}

export async function apiPatch(url, data = {}, config = {}) {
  return apiClient.patch(url, data, config);
}

export async function apiPut(url, data = {}, config = {}) {
  return apiClient.put(url, data, config);
}

export async function apiDelete(url, config = {}) {
  return apiClient.delete(url, config);
}

export default apiClient;

export function setFrontendSession(token) {
  setCsrfToken(token);
}

export function clearFrontendSession() {
  clearCsrfToken();
}

export function getFrontendSession() {
  return {
    csrfToken: getCsrfToken()
  };
}
