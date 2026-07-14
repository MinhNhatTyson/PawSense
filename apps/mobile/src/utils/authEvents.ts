// Lightweight event bridge between the API layer (plain modules, not hooks)
// and AuthContext (a React context). API calls can't call useAuth() directly,
// so a 401 anywhere reports here, and AuthContext subscribes once to force
// a clean logout instead of leaving the app in a half-authenticated state.

type Listener = () => void

let listeners: Listener[] = []

export const authEvents = {
  /** Subscribe to unauthorized events. Returns an unsubscribe function. */
  onUnauthorized(listener: Listener): () => void {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },

  /** Call this whenever an authenticated request comes back 401. */
  emitUnauthorized() {
    for (const listener of listeners) listener()
  },
}