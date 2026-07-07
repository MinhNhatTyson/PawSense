import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, ActivityIndicator, Alert, Platform } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { appointmentAPI, type VetAvailabilitySlot } from '../../api/appointmentAPI'
import { catProfileAPI, type CatProfile } from '../../api/catProfileAPI'
import { Button } from '../../components/UI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

function groupByDate(slots: VetAvailabilitySlot[]) {
  const groups: Record<string, VetAvailabilitySlot[]> = {}
  for (const s of slots) {
    const key = new Date(s.startTime).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return Object.entries(groups)
}

export function VetAvailabilityScreen({ navigation, route }: any) {
  const { vetId, vetName } = route.params as { vetId: string; vetName: string }

  const [slots, setSlots] = useState<VetAvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedSlot, setSelectedSlot] = useState<VetAvailabilitySlot | null>(null)
  const [cats, setCats] = useState<CatProfile[]>([])
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [booking, setBooking] = useState(false)

  const load = useCallback(async () => {
    try {
      setError('')
      const data = await appointmentAPI.listSlotsForVet(vetId)
      setSlots(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }, [vetId])

  useFocusEffect(useCallback(() => { setLoading(true); load() }, [load]))

  useEffect(() => { catProfileAPI.list().then(setCats).catch(() => {}) }, [])

  const handleBook = async () => {
    if (!selectedSlot) return
    setBooking(true)
    try {
      await appointmentAPI.book({
        slotId: selectedSlot.id,
        catProfileId: selectedCatId || undefined,
        reason: reason.trim() || undefined,
      })
      Alert.alert('Appointment booked', 'Your appointment has been confirmed.', [
        { text: 'View my appointments', onPress: () => navigation.replace('MyAppointments') },
      ])
    } catch (err) {
      Alert.alert('Could not book', err instanceof Error ? err.message : 'Please try another slot.')
      setSelectedSlot(null)
      load()
    } finally {
      setBooking(false)
    }
  }

  const grouped = groupByDate(slots)

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vetName}</Text>
        <Text style={styles.headerSubtitle}>Choose an open slot to book</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centred}><ActivityIndicator size="large" color={Colors.greenSage} /></View>
        ) : error ? (
          <View style={styles.centred}><Text style={styles.stateText}>{error}</Text></View>
        ) : grouped.length === 0 ? (
          <View style={styles.centred}>
            <Text style={styles.stateText}>This vet has no open slots right now. Please check back later.</Text>
          </View>
        ) : (
          grouped.map(([dateKey, daySlots]) => (
            <View key={dateKey} style={styles.dayGroup}>
              <Text style={styles.dayHeading}>
                {new Date(dateKey).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
              <View style={styles.slotRow}>
                {daySlots.map(slot => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.slotChip, selectedSlot?.id === slot.id && styles.slotChipSelected]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.slotChipText, selectedSlot?.id === slot.id && styles.slotChipTextSelected]}>
                      {new Date(slot.startTime).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}

        {selectedSlot && (
          <View style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>Confirm appointment</Text>
            <Text style={styles.bookingTime}>
              {new Date(selectedSlot.startTime).toLocaleString('en-GB', {
                weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
              })}
            </Text>

            {cats.length > 0 && (
              <>
                <Text style={styles.fieldLabel}>Which cat? (optional)</Text>
                <View style={styles.chipsWrap}>
                  <TouchableOpacity style={[styles.catChip, selectedCatId === null && styles.catChipSelected]} onPress={() => setSelectedCatId(null)}>
                    <Text style={[styles.catChipText, selectedCatId === null && styles.catChipTextSelected]}>Not specified</Text>
                  </TouchableOpacity>
                  {cats.map(c => (
                    <TouchableOpacity key={c.id} style={[styles.catChip, selectedCatId === c.id && styles.catChipSelected]} onPress={() => setSelectedCatId(c.id)}>
                      <Text style={[styles.catChipText, selectedCatId === c.id && styles.catChipTextSelected]}>{c.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.fieldLabel}>Reason for visit (optional)</Text>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Annual checkup, limping on left paw…"
              placeholderTextColor={Colors.textLight}
              multiline
            />

            <Button label={booking ? 'Booking…' : 'Confirm booking'} onPress={handleBook} loading={booking} style={{ marginTop: Spacing.md } as any} />
            <Button label="Cancel selection" onPress={() => setSelectedSlot(null)} variant="secondary" disabled={booking} style={{ marginTop: Spacing.sm } as any} />
          </View>
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
  headerTitle: { fontSize: 24, fontWeight: '700', color: Colors.cream, letterSpacing: -0.4 },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(245,240,232,0.62)' },
  scroll: { padding: Spacing['2xl'] },
  centred: { alignItems: 'center', paddingVertical: Spacing['4xl'] },
  stateText: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  dayGroup: { marginBottom: Spacing.lg },
  dayHeading: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  slotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slotChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.warmWhite, backgroundColor: Colors.white },
  slotChipSelected: { borderColor: Colors.greenSage, backgroundColor: Colors.greenDeep },
  slotChipText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textBody },
  slotChipTextSelected: { color: Colors.cream },
  bookingCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.warmWhite, padding: Spacing['2xl'], marginTop: Spacing.md, gap: Spacing.xs, ...Shadow.sm },
  bookingTitle: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  bookingTime: { fontSize: Typography.base, color: Colors.greenForest, fontWeight: '600', marginBottom: Spacing.md },
  fieldLabel: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textMuted, letterSpacing: 0.3, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  catChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.warmWhite, backgroundColor: Colors.ivory },
  catChipSelected: { borderColor: Colors.greenSage, backgroundColor: Colors.greenPale },
  catChipText: { fontSize: Typography.sm, color: Colors.textBody, fontWeight: '500' },
  catChipTextSelected: { color: Colors.greenForest, fontWeight: '700' },
  reasonInput: { minHeight: 80, backgroundColor: Colors.ivory, borderWidth: 1.5, borderColor: Colors.warmWhite, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.base, color: Colors.textPrimary, textAlignVertical: 'top' },
})