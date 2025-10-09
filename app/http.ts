const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in .env.local');
}

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} ${errorText}`);
  }

  // Возвращаем Response, чтобы можно было потом вызвать response.json()
  return res;
}
