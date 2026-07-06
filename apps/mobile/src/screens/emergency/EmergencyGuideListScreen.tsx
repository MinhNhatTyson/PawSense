import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { emergencyGuideAPI, type EmergencyGuide, type Urgency } from '../../api/emergencyGuideAPI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

const URGENCY_STYLE: Record<Urgency, { bg: string; color: string; label: string }> = {
  CRITICAL: { bg: '#fce8e6', color: '#922b21', label: 'Critical' },
  URGENT: { bg: '#fdf7ed', color: '#8b6340', label: 'Urgent' },
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const s = URGENCY_STYLE[urgency]
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: s.bg }]}>
      <Text style={[badgeStyles.text, { color: s.color }]}>{s.label}</Text>
    </View>
  )
}

const badgeStyles = StyleSheet.create({
  wrap: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full, flexShrink: 0 },
  text: { fontSize: Typography.xs, fontWeight: '700', letterSpacing: 0.3 },
})

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[chipStyles.chip, selected && chipStyles.chipSelected]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  )
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    backgroundColor: Colors.white,
    marginRight: Spacing.sm,
  },
  chipSelected: { borderColor: Colors.greenSage, backgroundColor: Colors.greenPale },
  label: { fontSize: Typography.sm, fontWeight: '500', color: Colors.textBody },
  labelSelected: { color: Colors.greenForest, fontWeight: '700' },
})

function GuideCard({ guide, onPress }: { guide: EmergencyGuide; onPress: () => void }) {
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={cardStyles.topRow}>
        <Text style={cardStyles.title} numberOfLines={2}>{guide.title}</Text>
        <UrgencyBadge urgency={guide.urgency} />
      </View>
      <Text style={cardStyles.summary} numberOfLines={2}>{guide.summary}</Text>
      <View style={cardStyles.footerRow}>
        <Text style={cardStyles.category}>{guide.category}</Text>
        <Text style={cardStyles.link}>View guide →</Text>
      </View>
    </TouchableOpacity>
  )
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  title: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary, flex: 1, letterSpacing: -0.2 },
  summary: { fontSize: Typography.sm, color: Colors.textMuted, lineHeight: 20 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  category: { fontSize: Typography.xs, color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.4 },
  link: { fontSize: Typography.sm, color: Colors.greenSage, fontWeight: '600' },
})

export function EmergencyGuideListScreen({ navigation }: any) {
  const [guides, setGuides] = useState<EmergencyGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError('')
      const data = await emergencyGuideAPI.list()
      setGuides(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emergency guides')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const categories = Array.from(new Set(guides.map(g => g.category))).sort()

  const filtered = guides.filter(g => {
    const matchesSearch =
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.emergencySymptoms.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchesUrgency = !urgencyFilter || g.urgency === urgencyFilter
    const matchesCategory = !categoryFilter || g.category === categoryFilter
    return matchesSearch && matchesUrgency && matchesCategory
  })

  const criticalCount = guides.filter(g => g.urgency === 'CRITICAL').length

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Guidance</Text>
        <Text style={styles.headerSubtitle}>
          {guides.length > 0
            ? `${guides.length} first-aid guide${guides.length !== 1 ? 's' : ''} · ${criticalCount} critical`
            : 'Quick-reference first-aid protocols'}
        </Text>
      </View>

      <View style={styles.hotlineBanner}>
        <Text style={styles.hotlineIcon}>☎</Text>
        <Text style={styles.hotlineText}>
          This is not a substitute for hands-on veterinary care. For any life-threatening emergency, call or go to the nearest emergency vet immediately.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} tintColor={Colors.greenSage} />
        }
      >
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search emergencies or symptoms…"
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.chipsRow}>
          <FilterChip label="All urgency" selected={urgencyFilter === null} onPress={() => setUrgencyFilter(null)} />
          <FilterChip label="Critical" selected={urgencyFilter === 'CRITICAL'} onPress={() => setUrgencyFilter('CRITICAL')} />
          <FilterChip label="Urgent" selected={urgencyFilter === 'URGENT'} onPress={() => setUrgencyFilter('URGENT')} />
        </View>

        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <FilterChip label="All categories" selected={categoryFilter === null} onPress={() => setCategoryFilter(null)} />
            {categories.map(c => (
              <FilterChip
                key={c}
                label={c}
                selected={categoryFilter === c}
                onPress={() => setCategoryFilter(prev => (prev === c ? null : c))}
              />
            ))}
          </ScrollView>
        )}

        {loading ? (
          <View style={styles.centred}>
            <ActivityIndicator size="large" color={Colors.greenSage} />
          </View>
        ) : error ? (
          <View style={styles.centred}>
            <Text style={styles.stateTitle}>Something went wrong</Text>
            <Text style={styles.stateDesc}>{error}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centred}>
            <Text style={styles.stateTitle}>No guides found</Text>
            <Text style={styles.stateDesc}>Try a different search or filter.</Text>
          </View>
        ) : (
          filtered.map(g => (
            <GuideCard
              key={g.id}
              guide={g}
              onPress={() => navigation.navigate('EmergencyGuideDetail', { guideId: g.id })}
            />
          ))
        )}
        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing['3xl'],
    paddingBottom: Spacing.lg,
    gap: 4,
  },
  backBtn: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  backBtnText: { fontSize: Typography.base, color: 'rgba(245,240,232,0.70)', fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: Colors.cream, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(245,240,232,0.62)' },
  hotlineBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: '#fdf0ee',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(192,57,43,0.2)',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
  },
  hotlineIcon: { fontSize: 15, color: '#922b21' },
  hotlineText: { flex: 1, fontSize: Typography.sm, color: '#922b21', lineHeight: 19, fontWeight: '500' },
  scroll: { padding: Spacing['2xl'] },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, height: 46, fontSize: Typography.base, color: Colors.textPrimary },
  chipsRow: { flexDirection: 'row', marginBottom: Spacing.md },
  chipsScroll: { marginBottom: Spacing.lg },
  centred: { alignItems: 'center', paddingVertical: Spacing['4xl'], gap: Spacing.sm },
  stateTitle: { fontSize: Typography.lg, fontWeight: '700', color: Colors.textPrimary },
  stateDesc: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center' },
})