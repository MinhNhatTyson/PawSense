import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { storage } from './storage'
import type { Vaccination } from '../api/catProfileAPI'

const STORAGE_PREFIX = 'notif_scheduled_cat_'
const REMINDER_DAYS_BEFORE = [3, 0] // 3 days before, and on the day

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // New properties required by NotificationBehavior
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false // local scheduling isn't supported on web
  const { status: existing } = await Notifications.getPermissionsAsync()
  let status = existing
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync()
    status = req.status
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('vaccination-reminders', {
      name: 'Vaccination reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  }
  return status === 'granted'
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

async function getStoredIds(catId: string): Promise<string[]> {
  try {
    const raw = await storage.getItem(`${STORAGE_PREFIX}${catId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

async function setStoredIds(catId: string, ids: string[]) {
  await storage.setItem(`${STORAGE_PREFIX}${catId}`, JSON.stringify(ids))
}

export async function cancelCatReminders(catId: string) {
  const ids = await getStoredIds(catId)
  for (const id of ids) {
    try { await Notifications.cancelScheduledNotificationAsync(id) } catch { /* already gone */ }
  }
  await setStoredIds(catId, [])
}

/**
 * Cancels any reminders previously scheduled for this cat, then schedules
 * fresh reminders (3 days before + on the day) for every vaccination that
 * has a future nextDueDate. Safe to call every time the cat's data loads —
 * the backend regenerates vaccination IDs on every profile edit
 * (delete-all-then-recreate), so we always reconcile against the current
 * list rather than diffing by vaccination ID.
 */
export async function syncCatReminders(
  catId: string,
  catName: string,
  vaccinations: Vaccination[]
): Promise<void> {
  if (Platform.OS === 'web') return

  await cancelCatReminders(catId)

  const newIds: string[] = []

  for (const v of vaccinations) {
    if (!v.nextDueDate) continue
    const dueDate = new Date(v.nextDueDate)

    for (const daysBefore of REMINDER_DAYS_BEFORE) {
      const trigger = new Date(dueDate)
      trigger.setDate(trigger.getDate() - daysBefore)
      trigger.setHours(9, 0, 0, 0)
      if (trigger.getTime() <= Date.now()) continue

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: daysBefore === 0
            ? `${catName}'s ${v.vaccineName} is due today`
            : `${catName}'s ${v.vaccineName} is due in ${daysBefore} days`,
          body: `Due ${dueDate.toLocaleDateString()}. Open PawSense for details.`,
          data: { catId, vaccinationId: v.id },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
      })
      newIds.push(id)
    }
  }

  await setStoredIds(catId, newIds)
}