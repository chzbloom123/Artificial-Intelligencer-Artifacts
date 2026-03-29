const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

const request = async <T>(
  url: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {}
): Promise<T> => {
  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok && response.status !== 204) {
    const json = await response.json().catch(() => null);
    throw new Error(
      json?.error?.message || json?.message || `Request failed with status ${response.status}`
    );
  }
  if (response.status === 204) return null as T;
  const json = await response.json();
  // Unwrap { data: T } envelope if present
  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }
  return json as T;
};

export const api = {
  get: <T>(url: string, headers?: Record<string, string>) => request<T>(url, { headers }),
  post: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body), headers }),
  put: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body), headers }),
  delete: <T>(url: string, headers?: Record<string, string>) => request<T>(url, { method: "DELETE", headers }),
  patch: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(body), headers }),
  upload: async <T>(url: string, formData: FormData, headers?: Record<string, string>): Promise<T> => {
    const response = await fetch(`${baseUrl}${url}`, {
      method: "POST",
      credentials: "include",
      headers: { ...headers },
      body: formData,
    });
    const json = await response.json();
    if (json && typeof json === "object" && "data" in json) {
      return json.data as T;
    }
    return json as T;
  },
};
