const TOKEN_KEY = 'guruvan_admin_token'
const ROLE_KEY = 'guruvan_admin_role'
const BASE = import.meta.env.VITE_API_URL || ''

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getRole = () => localStorage.getItem(ROLE_KEY)
export const isLoggedIn = () => !!getToken()

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Login failed.')
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(ROLE_KEY, data.role)
  return data
}

/**
 * Downloads an admin-only file (the volunteer PDFs). A plain <a href> can't carry
 * the bearer token, so fetch it and hand the blob to the browser instead.
 */
export async function adminDownload(path, filename) {
  const res = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } })
  if (res.status === 401) {
    logout()
    throw new Error('Session expired. Please log in again.')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Could not generate the document.')
  }
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Fetch wrapper that attaches the admin bearer token. */
export async function adminFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  })
  if (res.status === 401) {
    logout()
    throw new Error('Session expired. Please log in again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed.')
  return data
}
