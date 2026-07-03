import { apiGet, apiPost } from "@/shared/services/api";
import { setCsrfToken, clearCsrfToken } from "@/shared/services/api";

export async function login(payload) {
  const response = await apiPost("/auth/login", payload);

  if (response?.data?.csrfToken) {
    setCsrfToken(response.data.csrfToken);
  }

  return response;
}

export async function me() {
  return apiGet("/auth/me");
}

export async function logout() {
  try {
    return await apiPost("/auth/logout", {});
  } finally {
    clearCsrfToken();
  }
}
