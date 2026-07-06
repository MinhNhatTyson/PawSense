import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
  ActivityIndicator, Alert, Platform, KeyboardAvoidingView,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { catProfileAPI, type CatProfile, type HealthNote } from '../../api/catProfileAPI'
import { Button, Field } from '../../components/UI'
import { TextInput } from '../../components/TextInput'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'
import {
  requestNotificationPermissions,
  hasNotificationPermission,
  syncCatReminders,
} from '../../utils/notifications'

type Tab = 'vaccinations' | 'history' | 'treatments'

const SEV_STYLE: Record<string, { bg: string; color: string }> = {
  LOW:      { bg: '#edf7f1', color: '#2d7a4f' },
  MEDIUM:   { bg: '#fdf7ed', color: '#8b6340' },
  HIGH:     { bg: '#fdf0ee', color: '#c0392b' },
  CRITICAL: { bg: '#fce8e6', color: '#922b21' },
}

function TabBar({ tab, onChange, counts }: { tab: Tab; onChange: (t: Tab) => void; counts: Record<Tab, number> }) {
  const items: { key: Tab; label: string }[] = [
    { key: 'vaccinations', label: 'Vaccinations' },
    { key: 'history', label: 'Medical history' },
    { key: 'treatments', label: 'Treatments' },
  ]
  return (
    <View style={tabStyles.wrap}>
      {items.map(item => (
        <TouchableOpacity
          key={item.key}
          style={[tabStyles.tab, tab === item.key && tabStyles.tabActive]}
          onPress={() => onChange(item.key)}
          activeOpacity={0.8}
        >
          <Text style={[tabStyles.tabText, tab === item.key && tabStyles.tabTextActive]}>
            {item.label}{counts[item.key] > 0 ? ` (${counts[item.key]})` : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const tabStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.ivory,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm + 2, alignItems: 'center', borderRadius: Radius.full },
  tabActive: { backgroundColor: Colors.greenDeep, ...Shadow.sm },
  tabText: { fontSize: Typography.xs, fontWeight: '600', color: Colors.textMuted, textAlign: 'center' },
  tabTextActive: { color: Colors.cream },
})

function Card({ children }: { children: React.ReactNode }) {
  return <View style={cardStyles.card}>{children}</View>
}
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
})

export function HealthTrackingScreen({ navigation, route }: any) {
  const { catId } = route.params as { catId: string }
  const [cat, setCat] = useState<CatProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('vaccinations')
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')

  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNote, setEditingNote] = useState<HealthNote | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteError, setNoteError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await catProfileAPI.getById(catId)
      setCat(data)
      const granted = await hasNotificationPermission()
      setNotifStatus(granted ? 'granted' : 'unknown')
      if (granted) {
        syncCatReminders(data.id, data.name, data.vaccinations).catch(() => {})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health data')
    } finally {
      setLoading(false)
    }
  }, [catId])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleEnableReminders = async () => {
    const granted = await requestNotificationPermissions()
    setNotifStatus(granted ? 'granted' : 'denied')
    if (granted && cat) {
      await syncCatReminders(cat.id, cat.name, cat.vaccinations)
      Alert.alert('Reminders enabled', "You'll get a notification 3 days before and on the day each vaccination is due.")
    } else if (!granted) {
      Alert.alert('Permission needed', 'Enable notifications in your device settings to get vaccination reminders.')
    }
  }

  const openAddNote = () => {
    setEditingNote(null)
    setNoteTitle('')
    setNoteContent('')
    setNoteError('')
    setShowNoteForm(true)
  }

  const openEditNote = (note: HealthNote) => {
    setEditingNote(note)
    setNoteTitle(note.title || '')
    setNoteContent(note.content)
    setNoteError('')
    setShowNoteForm(true)
  }

  const closeNoteForm = () => {
    setShowNoteForm(false)
    setEditingNote(null)
  }

  const saveNote = async () => {
    if (!noteContent.trim()) {
      setNoteError('Please write something before saving.')
      return
    }
    setNoteSaving(true)
    setNoteError('')
    try {
      if (editingNote) {
        await catProfileAPI.updateHealthNote(catId, editingNote.id, {
          title: noteTitle.trim() || undefined,
          content: noteContent.trim(),
        })
      } else {
        await catProfileAPI.createHealthNote(catId, {
          title: noteTitle.trim() || undefined,
          content: noteContent.trim(),
        })
      }
      closeNoteForm()
      load()
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Failed to save note')
    } finally {
      setNoteSaving(false)
    }
  }

  const handleDeleteNote = (note: HealthNote) => {
    Alert.alert('Delete this note?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await catProfileAPI.deleteHealthNote(catId, note.id)
            load()
          } catch {
            Alert.alert('Error', 'Failed to delete note.')
          }
        },
      },
    ])
  }

  if (loading && !cat) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color={Colors.greenSage} />
      </View>
    )
  }

  if (!cat) {
    return (
      <View style={styles.centred}>
        <Text style={styles.errorText}>{error || 'Cat not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: Spacing.lg }}>
          <Text style={styles.backLinkText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  type HistoryItem =
    | { kind: 'diagnosis'; date: string; id: string; diseaseName: string; severity: string; notes?: string | null }
    | { kind: 'note'; date: string; id: string; note: HealthNote }

  const historyItems: HistoryItem[] = [
    ...cat.diagnoses.map(d => ({
      kind: 'diagnosis' as const,
      date: d.diagnosedAt,
      id: d.id,
      diseaseName: d.disease.name,
      severity: d.disease.severity,
      notes: d.notes,
    })),
    ...cat.healthNotes.map(n => ({
      kind: 'note' as const,
      date: n.noteDate,
      id: n.id,
      note: n,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const counts: Record<Tab, number> = {
    vaccinations: cat.vaccinations.length,
    history: historyItems.length,
    treatments: cat.catTreatmentRecords.length,
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cat.name}'s Health</Text>
        <Text style={styles.headerSubtitle}>Vaccinations, medical history & treatments in one place</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TabBar tab={tab} onChange={setTab} counts={counts} />

        {error ? (
          <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{error}</Text></View>
        ) : null}

        {tab === 'vaccinations' && (
          <>
            {Platform.OS !== 'web' && notifStatus !== 'granted' && (
              <View style={styles.reminderBanner}>
                <Text style={styles.reminderBannerText}>
                  Get notified 3 days before and on the day each vaccination is due.
                </Text>
                <Button label="Enable reminders" onPress={handleEnableReminders} style={{ marginTop: Spacing.sm } as any} />
              </View>
            )}

            {cat.vaccinations.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No vaccinations recorded yet.</Text>
                <Button
                  label="Add a vaccination"
                  variant="secondary"
                  onPress={() => navigation.navigate('CatForm', { mode: 'edit', cat })}
                  style={{ marginTop: Spacing.md } as any}
                />
              </View>
            ) : (
              cat.vaccinations.map(v => {
                const nextDue = v.nextDueDate ? new Date(v.nextDueDate) : null
                const overdue = !!nextDue && nextDue < new Date()
                const dueSoon = !!nextDue && !overdue && nextDue.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
                return (
                  <Card key={v.id}>
                    <View style={rowStyles.top}>
                      <Text style={rowStyles.title}>{v.vaccineName}</Text>
                      {nextDue && (
                        <View style={[
                          rowStyles.statusPill,
                          { backgroundColor: overdue ? '#fdf0ee' : dueSoon ? '#fdf7ed' : Colors.greenPale },
                        ]}>
                          <Text style={[
                            rowStyles.statusPillText,
                            { color: overdue ? Colors.error : dueSoon ? '#8b6340' : Colors.greenForest },
                          ]}>
                            {overdue ? 'Overdue' : dueSoon ? 'Due soon' : 'Scheduled'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={rowStyles.meta}>
                      Given {new Date(v.dateGiven).toLocaleDateString()}
                      {nextDue ? ` · Next due ${nextDue.toLocaleDateString()}` : ''}
                    </Text>
                    {v.veterinarian && <Text style={rowStyles.meta}>Dr. {v.veterinarian}</Text>}
                    {v.notes && <Text style={rowStyles.notes}>{v.notes}</Text>}
                  </Card>
                )
              })
            )}
          </>
        )}

        {tab === 'history' && (
          <>
            {!showNoteForm && (
              <Button label="+ Add a health note" onPress={openAddNote} style={{ marginBottom: Spacing.lg } as any} />
            )}

            {showNoteForm && (
              <Card>
                <Text style={rowStyles.title}>{editingNote ? 'Edit note' : 'New health note'}</Text>
                {noteError ? <Text style={styles.inlineError}>{noteError}</Text> : null}
                <Field label="Title" optional>
                  <TextInput value={noteTitle} onChangeText={setNoteTitle} placeholder="e.g. Limping after play, Skin looks flaky…" />
                </Field>
                <Field label="What did you notice?">
                  <TextInput
                    value={noteContent}
                    onChangeText={setNoteContent}
                    placeholder="Describe what you observed, when it started, anything else worth remembering…"
                    multiline
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top', paddingTop: Spacing.md }}
                  />
                </Field>
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <Button label={noteSaving ? 'Saving…' : 'Save note'} onPress={saveNote} loading={noteSaving} style={{ flex: 1 } as any} />
                  <Button label="Cancel" onPress={closeNoteForm} variant="secondary" disabled={noteSaving} style={{ flex: 1 } as any} />
                </View>
              </Card>
            )}

            {historyItems.length === 0 && !showNoteForm ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  No medical history yet. Vet diagnoses and your own notes will appear here.
                </Text>
              </View>
            ) : (
              historyItems.map(item => {
                if (item.kind === 'diagnosis') {
                  const sev = SEV_STYLE[item.severity] ?? SEV_STYLE.MEDIUM
                  return (
                    <Card key={`d-${item.id}`}>
                      <View style={rowStyles.top}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sourceTag}>VET DIAGNOSIS</Text>
                          <Text style={rowStyles.title}>{item.diseaseName}</Text>
                        </View>
                        <View style={[rowStyles.statusPill, { backgroundColor: sev.bg }]}>
                          <Text style={[rowStyles.statusPillText, { color: sev.color }]}>{item.severity}</Text>
                        </View>
                      </View>
                      <Text style={rowStyles.meta}>{new Date(item.date).toLocaleDateString()}</Text>
                      {item.notes && <Text style={rowStyles.notes}>{item.notes}</Text>}
                    </Card>
                  )
                }
                const note = item.note
                return (
                  <Card key={`n-${item.id}`}>
                    <View style={rowStyles.top}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.sourceTag, { color: Colors.gold }]}>YOUR NOTE</Text>
                        <Text style={rowStyles.title}>{note.title || 'Health note'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                        <TouchableOpacity onPress={() => openEditNote(note)}>
                          <Text style={styles.linkText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteNote(note)}>
                          <Text style={[styles.linkText, { color: Colors.error }]}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={rowStyles.meta}>{new Date(item.date).toLocaleDateString()}</Text>
                    <Text style={rowStyles.notes}>{note.content}</Text>
                  </Card>
                )
              })
            )}
          </>
        )}

        {tab === 'treatments' && (
          cat.catTreatmentRecords.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                No treatments logged yet. Your veterinarian will record treatments here after a visit.
              </Text>
            </View>
          ) : (
            cat.catTreatmentRecords.map(r => (
              <Card key={r.id}>
                <Text style={rowStyles.title}>{r.treatment.name}</Text>
                <Text style={rowStyles.meta}>
                  {new Date(r.administeredAt).toLocaleDateString()}
                  {r.administeredBy?.profile?.fullName ? ` · Dr. ${r.administeredBy.profile.fullName}` : ''}
                </Text>
                {r.treatment.estimatedDuration && (
                  <Text style={rowStyles.meta}>Duration: {r.treatment.estimatedDuration}</Text>
                )}
                {r.notes && <Text style={rowStyles.notes}>{r.notes}</Text>}
              </Card>
            ))
          )
        )}

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const rowStyles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm, marginBottom: 4 },
  title: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  meta: { fontSize: Typography.sm, color: Colors.textMuted, marginBottom: 2 },
  notes: { fontSize: Typography.sm, color: Colors.textBody, marginTop: 4, lineHeight: 20 },
  statusPill: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full, flexShrink: 0 },
  statusPillText: { fontSize: Typography.xs, fontWeight: '700' },
})

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  centred: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: Typography.base, color: Colors.error, textAlign: 'center' },
  backLinkText: { fontSize: Typography.base, color: Colors.greenForest, fontWeight: '600' },

  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    gap: 4,
  },
  backBtn: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  backBtnText: { fontSize: Typography.base, color: 'rgba(245,240,232,0.70)', fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: Colors.cream, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(245,240,232,0.62)', lineHeight: 20 },

  scroll: { padding: Spacing['2xl'] },

  errorBanner: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  errorBannerText: { color: Colors.error, fontSize: Typography.base },
  inlineError: { color: Colors.error, fontSize: Typography.sm, marginBottom: Spacing.sm },

  reminderBanner: {
    backgroundColor: Colors.ivory, borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.warmWhite, marginBottom: Spacing.lg,
  },
  reminderBannerText: { fontSize: Typography.sm, color: Colors.textBody, lineHeight: 20 },

  emptyWrap: { alignItems: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.sm },
  emptyText: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 280 },

  sourceTag: { fontSize: 10, fontWeight: '700', color: Colors.greenForest, letterSpacing: 0.5, marginBottom: 2 },
  linkText: { fontSize: Typography.sm, color: Colors.greenForest, fontWeight: '600' },
})