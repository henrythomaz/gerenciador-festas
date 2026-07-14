export const API_BASE_URL = import.meta.env.VITE_BACK_URL || 'http://localhost'

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.mensagem || data.message || `Erro ${res.status}`)
  }
  return res.json()
}
