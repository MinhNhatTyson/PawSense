import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, Platform } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { appointmentAPI, type Appointment } from '../../api/appointmentAPI'
import {
  requestNotificationPermissions,
  hasNotificationPermission,
  scheduleAppointmentReminder,
  cancelAppointmentReminder,
} from '../../utils/notifications'
import { Button } from '../../components/UI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  CONFIRMED: { bg: '#edf7f1', color: '#2d7a4f' },
  COMPLETED: { bg: '#e0f2fe', color: '#0369a1' },
  CANCELLED: { bg: '#fdf0ee', color: '#c0392b' },
}

function AppointmentCard({ appt, onCancel }: { appt: Appointment; onCancel: () => void }) {
  const start = new Date(appt.slot.startTime)
  const s = STATUS_STYLE[appt.status]
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.topRow}>
        <Text style={cardStyles.vetName}>{appt.vet.profile?.fullName || appt.vet.email}</Text>
        <View style={[cardStyles.statusPill, { backgroundColor: s.bg }]}>
          <Text style={[cardStyles.statusText, { color: s.color }]}>{appt.status}</Text>
        </View>
      </View>
      {appt.vet.profile?.clinicName ? <Text style={cardStyles.clinic}>{appt.vet.profile.clinicName}</Text> : null}
      <Text style={cardStyles.time}>
        {start.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
      </Text>
      {appt.catProfile && <Text style={cardStyles.meta}>For: {appt.catProfile.name}</Text>}
      {appt.reason ? <Text style={cardStyles.reason}>{appt.reason}</Text> : null}
      {appt.status === 'CANCELLED' && appt.cancelReason ? (
        <Text style={cardStyles.cancelNote}>Cancelled by {appt.cancelledBy === 'VET' ? 'the vet' : 'you'}: {appt.cancelReason}</Text>
      ) : null}
      {appt.status === 'CONFIRMED' && start > new Date() && (
        <TouchableOpacity style={cardStyles.cancelBtn} onPress={onCancel}>
          <Text style={cardStyles.cancelBtnText}>Cancel appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const cardStyles = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.warmWhite, padding: Spacing.lg, marginBottom: Spacing.md, gap: 3, ...Shadow.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  vetName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  statusPill: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, flexShrink: 0 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  clinic: { fontSize: Typography.sm, color: Colors.textLight, fontStyle: 'italic' },
  time: { fontSize: Typography.sm, color: Colors.greenForest, fontWeight: '600', marginTop: 4 },
  meta: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 2 },
  reason: { fontSize: Typography.sm, color: Colors.textBody, marginTop: 4, lineHeight: 19 },
  cancelNote: { fontSize: Typography.sm, color: Colors.error, marginTop: 4, fontStyle: 'italic' },
  cancelBtn: { marginTop: Spacing.sm, alignSelf: 'flex-start' },
  cancelBtnText: { fontSize: Typography.sm, color: Colors.error, fontWeight: '600' },
})

export function MyAppointmentsScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')

  const load = useCallback(async () => {
    try {
      setError('')
      const data = await appointmentAPI.listMine()
      setAppointments(data)

      const granted = await hasNotificationPermission()
      setNotifStatus(granted ? 'granted' : 'unknown')

      if (granted) {
        // Sync reminders to match the current state: schedule for confirmed
        // upcoming appointments, cancel for anything no longer confirmed.
        for (const a of data) {
          const isUpcomingConfirmed = a.status === 'CONFIRMED' && new Date(a.slot.startTime) > new Date()
          if (isUpcomingConfirmed) {
            scheduleAppointmentReminder(a.id, a.vet.profile?.fullName || a.vet.email, a.slot.startTime).catch(() => {})
          } else {
            cancelAppointmentReminder(a.id).catch(() => {})
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { setLoading(true); load() }, [load]))

  const handleEnableReminders = async () => {
    const granted = await requestNotificationPermissions()
    setNotifStatus(granted ? 'granted' : 'denied')
    if (granted) {
      load()
      Alert.alert('Reminders enabled', "You'll get a notification 1 day before and 2 hours before each appointment.")
    } else {
      Alert.alert('Permission needed', 'Enable notifications in your device settings to get appointment reminders.')
    }
  }

  const handleCancel = (appt: Appointment) => {
    Alert.alert('Cancel this appointment?', 'The vet will be notified.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel appointment', style: 'destructive',
        onPress: async () => {
          try {
            await appointmentAPI.cancel(appt.id)
            await cancelAppointmentReminder(appt.id)
            load()
          } catch {
            Alert.alert('Error', 'Failed to cancel. Please try again.')
          }
        },
      },
    ])
  }

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED' && new Date(a.slot.startTime) >= new Date())
  const past = appointments.filter(a => !(a.status === 'CONFIRMED' && new Date(a.slot.startTime) >= new Date()))

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <Text style={styles.headerSubtitle}>{upcoming.length > 0 ? `${upcoming.length} upcoming` : 'No upcoming appointments'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Button label="Book a new appointment" onPress={() => navigation.navigate('VetDirectory')} style={{ marginBottom: Spacing.lg } as any} />

        {Platform.OS !== 'web' && notifStatus !== 'granted' && upcoming.length > 0 && (
          <View style={styles.reminderBanner}>
            <Text style={styles.reminderBannerText}>
              Get notified 1 day before and 2 hours before each appointment.
            </Text>
            <Button label="Enable reminders" onPress={handleEnableReminders} style={{ marginTop: Spacing.sm } as any} />
          </View>
        )}

        {loading ? (
          <View style={styles.centred}><ActivityIndicator size="large" color={Colors.greenSage} /></View>
        ) : error ? (
          <View style={styles.centred}><Text style={styles.stateText}>{error}</Text></View>
        ) : appointments.length === 0 ? (
          <View style={styles.centred}><Text style={styles.stateText}>You haven't booked any appointments yet.</Text></View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>Upcoming</Text>
                {upcoming.map(a => <AppointmentCard key={a.id} appt={a} onCancel={() => handleCancel(a)} />)}
              </>
            )}
            {past.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>Past & cancelled</Text>
                {past.map(a => <AppointmentCard key={a.id} appt={a} onCancel={() => handleCancel(a)} />)}
              </>
            )}
          </>
        )}
        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: Colors.greenDeep, paddingHorizontal: Spacing['2xl'], paddingTop: Platform.OS === 'ios' ? 56 : Spacing['3xl'], paddingBottom: Spacing['2xl'], gap: 4 },
  backBtn: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  backBtnText: { fontSize: Typography.base, color: 'rgba(245,240,232,0.70)', fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: Colors.cream, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(245,240,232,0.62)' },
  scroll: { padding: Spacing['2xl'] },
  centred: { alignItems: 'center', paddingVertical: Spacing['4xl'] },
  stateText: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center' },
  sectionHeading: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: Spacing.md, marginTop: Spacing.sm },
  reminderBanner: { backgroundColor: Colors.ivory, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.warmWhite, marginBottom: Spacing.lg },
  reminderBannerText: { fontSize: Typography.sm, color: Colors.textBody, lineHeight: 20 },
})