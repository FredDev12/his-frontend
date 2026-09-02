import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";

const SESSION_RETRY_FLAG = "__hisSessionRetried";

let csrfToken = null;
let refreshPromise = null;

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
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "X-Client": "his-frontend"
  }
});

const sessionRefreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "X-Client": "his-frontend"
  }
});

function isUnsafeMethod(method) {
  return !["GET", "HEAD", "OPTIONS"].includes(
    String(method || "get").toUpperCase()
  );
}

function isAuthenticationEndpoint(config) {
  const url = String(config?.url || "");

  return [
    "/auth/login",
    "/auth/refresh",
    "/auth/bootstrap-admin"
  ].some((path) => url.includes(path));
}

function normalizeApiError(error) {
  const response = error?.response;

  return {
    success: false,
    status: response?.status || 0,
    code: response?.data?.code || "NETWORK_OR_API_ERROR",
    message:
      response?.data?.message ||
      error?.message ||
      "Erreur de communication avec le serveur HIS.",
    requestId:
      response?.data?.requestId ||
      response?.headers?.["x-request-id"] ||
      null,
    details: response?.data?.details || null,
    raw: response?.data || null
  };
}

function shouldRecoverSession(error, config) {
  if (!config || config[SESSION_RETRY_FLAG]) {
    return false;
  }

  if (isAuthenticationEndpoint(config)) {
    return false;
  }

  const status = error?.response?.status;
  const code = error?.response?.data?.code;

  const accessSessionExpired =
    status === 401 &&
    ["AUTH_REQUIRED", "TOKEN_INVALID"].includes(code);

  const csrfDesynchronized =
    status === 403 &&
    code === "CSRF_INVALID";

  return accessSessionExpired || csrfDesynchronized;
}

async function refreshSessionOnce() {
  if (!refreshPromise) {
    refreshPromise = sessionRefreshClient
      .post("/auth/refresh", {})
      .then((response) => {
        const payload = response?.data;
        const token =
          payload?.data?.csrfToken ??
          payload?.csrfToken ??
          null;

        if (!token) {
          throw new Error(
            "Le serveur n’a pas retourné de nouveau jeton CSRF."
          );
        }

        setCsrfToken(token);

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("his:session-refreshed", {
              detail: payload
            })
          );
        }

        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  if (isUnsafeMethod(config.method) && csrfToken) {
    config.headers = config.headers || {};
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalConfig = error?.config;

    if (shouldRecoverSession(error, originalConfig)) {
      try {
        const refreshedCsrfToken =
          await refreshSessionOnce();

        originalConfig[SESSION_RETRY_FLAG] = true;
        originalConfig.headers =
          originalConfig.headers || {};

        if (isUnsafeMethod(originalConfig.method)) {
          originalConfig.headers["X-CSRF-Token"] =
            refreshedCsrfToken;
        }

        return apiClient(originalConfig);
      } catch (refreshError) {
        clearCsrfToken();

        const normalizedRefreshError =
          normalizeApiError(refreshError);

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("his:auth-required", {
              detail: normalizedRefreshError
            })
          );
        }

        return Promise.reject(normalizedRefreshError);
      }
    }

    const normalized = normalizeApiError(error);

    if (
      normalized.status === 401 &&
      typeof window !== "undefined"
    ) {
      clearCsrfToken();

      window.dispatchEvent(
        new CustomEvent("his:auth-required", {
          detail: normalized
        })
      );
    }

    if (
      normalized.status === 403 &&
      normalized.code !== "CSRF_INVALID" &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(
        new CustomEvent("his:forbidden", {
          detail: normalized
        })
      );
    }

    return Promise.reject(normalized);
  }
);

export async function apiGet(url, config = {}) {
  return apiClient.get(url, config);
}

export async function apiPost(
  url,
  data = {},
  config = {}
) {
  return apiClient.post(url, data, config);
}

export async function apiPatch(
  url,
  data = {},
  config = {}
) {
  return apiClient.patch(url, data, config);
}

export async function apiPut(
  url,
  data = {},
  config = {}
) {
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
