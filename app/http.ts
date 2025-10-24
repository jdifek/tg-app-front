const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}
export async function apiFetch(path: string, options?: RequestInit) {
  const isFormData = options?.body instanceof FormData;

  const headers = isFormData
    ? options?.headers // не ставим Content-Type для FormData
    : {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} ${errorText}`);
  }

  return res;
}
