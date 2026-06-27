const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

function getToken() {
  return localStorage.getItem("accessToken");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
    throw new Error("Não autorizado");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Erro na requisição");
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ accessToken: string; refreshToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },

  template: {
    get: () => request<any>("/template"),
    updateFields: (fields: any[]) =>
      request<any>("/template/fields", {
        method: "PUT",
        body: JSON.stringify(fields),
      }),
  },

  contracts: {
    list: (params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any>(`/contracts${query}`);
    },
    get: (id: string) => request<any>(`/contracts/${id}`),
    create: (fields: any[]) =>
      request<any>("/contracts", {
        method: "POST",
        body: JSON.stringify({ fields }),
      }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/contracts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    history: (id: string) => request<any>(`/contracts/${id}/history`),
  },
};
