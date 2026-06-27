import { Platform } from 'react-native'

// On web, AsyncStorage is not available — use localStorage instead.
// On native (iOS/Android), use AsyncStorage.

const isWeb = Platform.OS === 'web'

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    }
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
    return AsyncStorage.getItem(key)
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.setItem(key, value)
      } catch {
        // storage quota exceeded — silently ignore on web
      }
      return
    }
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
    return AsyncStorage.setItem(key, value)
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      try {
        localStorage.removeItem(key)
      } catch {
        // ignore
      }
      return
    }
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
    return AsyncStorage.removeItem(key)
  },
}