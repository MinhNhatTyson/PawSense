import { storage } from './storage'
import { authEvents } from './authEvents'
import { API_URL } from '../config'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await storage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * fetch() wrapper for authenticated API calls.
 * - Prefixes the path with API_URL
 * - Attaches the Authorization header automatically
 * - On any 401 response, notifies AuthContext via authEvents so the app
 *   forces a clean logout/redirect to the login screen instead of leaving
 *   the person on a screen that will silently fail every request from
 *   here on out.
 *
 * Usage: apiFetch('/cat-profiles') instead of
 *   fetch(`${API_URL}/cat-profiles`, { headers: await getHeaders() })
 *
 * For FormData bodies, just pass `body: formData` — do not set
 * Content-Type yourself (same as before, fetch sets the multipart
 * boundary automatically).
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders,
      ...(init.headers as Record<string, string> | undefined),
    },
  })

  if (res.status === 401) {
    authEvents.emitUnauthorized()
  }

  return res
}