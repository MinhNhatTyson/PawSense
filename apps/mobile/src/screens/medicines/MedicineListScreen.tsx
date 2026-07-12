import React, { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { medicineAPI, type Medicine } from '../../api/medicineAPI'
import { Button } from '../../components/UI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'
import { diseaseAPI, type DiseaseSummary } from '../../api/diseaseAPI'

// ── Severity colour map ───────────────────────────────────────────────────────

const SEV_STYLE: Record<string, { bg: string; color: string }> = {
  LOW:      { bg: '#edf7f1', color: '#2d7a4f' },
  MEDIUM:   { bg: '#fdf7ed', color: '#8b6340' },
  HIGH:     { bg: '#fdf0ee', color: '#c0392b' },
  CRITICAL: { bg: '#fce8e6', color: '#922b21' },
}

// ── Disease pill ──────────────────────────────────────────────────────────────

function DiseasePill({ name, severity }: { name: string; severity: string }) {
  const s = SEV_STYLE[severity] ?? SEV_STYLE.MEDIUM
  return (
    <View style={[pillStyles.wrap, { backgroundColor: s.bg }]}>
      <Text style={[pillStyles.text, { color: s.color }]}>{name}</Text>
    </View>
  )
}

const pillStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginRight: 5,
    marginBottom: 4,
  },
  text: { fontSize: Typography.xs, fontWeight: '600' },
})

// ── Filter chip ───────────────────────────────────────────────────────────────

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, selected && chipStyles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>
        {label}
      </Text>
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
  chipSelected: {
    borderColor: Colors.greenSage,
    backgroundColor: Colors.greenPale,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.textBody,
  },
  labelSelected: {
    color: Colors.greenForest,
    fontWeight: '700',
  },
})

// ── Medicine card (memoized — avoids re-render on unrelated list state) ───────

const MedicineCard = React.memo(function MedicineCard({ med, onPress }: { med: Medicine; onPress: () => void }) {
  const diseases = med.diseaseMedicines?.slice(0, 2) ?? []
  const extra = (med.diseaseMedicines?.length ?? 0) - 2

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image / placeholder */}
      <View style={cardStyles.imageWrap}>
        {med.imageUrl ? (
          <Image source={{ uri: med.imageUrl }} style={cardStyles.image} />
        ) : (
          <View style={cardStyles.imagePlaceholder}>
            <Feather name="package" size={40} color={Colors.greenSage} />
          </View>
        )}
      </View>

      {/* Body */}
      <View style={cardStyles.body}>
        <Text style={cardStyles.name} numberOfLines={2}>{med.name}</Text>

        {med.manufacturer ? (
          <Text style={cardStyles.manufacturer}>{med.manufacturer}</Text>
        ) : null}

        <Text style={cardStyles.desc} numberOfLines={2}>{med.description}</Text>

        {/* Dosage preview */}
        <View style={cardStyles.dosageRow}>
          <Text style={cardStyles.dosageLabel}>Dosage</Text>
          <Text style={cardStyles.dosageValue} numberOfLines={1}>{med.dosage}</Text>
        </View>

        {/* Linked diseases */}
        {diseases.length > 0 && (
          <View style={cardStyles.pillsRow}>
            {diseases.map(dm => (
              <DiseasePill
                key={dm.id}
                name={dm.disease.name}
                severity={dm.disease.severity}
              />
            ))}
            {extra > 0 && (
              <View style={pillStyles.wrap}>
                <Text style={[pillStyles.text, { color: Colors.textLight }]}>
                  +{extra} more
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Warnings indicator */}
        {med.warnings.length > 0 && (
          <View style={cardStyles.warnRow}>
            <Feather name="alert-triangle" size={12} color="#c0392b" />
            <Text style={cardStyles.warnText}>
              {med.warnings.length} warning{med.warnings.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
})

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  imageWrap: { width: '100%', height: 140 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: Spacing.lg, gap: Spacing.sm },
  name: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  manufacturer: {
    fontSize: Typography.sm,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  desc: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    lineHeight: 21,
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
  },
  dosageLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.greenForest,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingTop: 1,
    flexShrink: 0,
  },
  dosageValue: {
    fontSize: Typography.sm,
    color: Colors.greenDeep,
    fontWeight: '500',
    flex: 1,
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  warnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  warnText: {
    fontSize: Typography.xs,
    color: '#c0392b',
    fontWeight: '600',
  },
})

// ── Main screen ───────────────────────────────────────────────────────────────

export function MedicineListScreen({ navigation }: any) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [diseaseOptions, setDiseaseOptions] = useState<DiseaseSummary[]>([])
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const PER_PAGE = 20
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadMedicines = useCallback(async (searchQ = '', pg = 0, diseaseId?: string) => {
    try {
      setError('')
      const res = await medicineAPI.list(pg * PER_PAGE, PER_PAGE, searchQ || undefined, diseaseId)
      const data = res.data

      setMedicines(pg === 0 ? data : prev => [...prev, ...data])
      setTotal(res.pagination.total)
      setPage(pg)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines')
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      setSearch('')
      setSelectedDiseaseId(null)
      loadMedicines('', 0)
      // Independent of the medicines page — a stable, complete list for filter chips
      diseaseAPI.list(30).then(setDiseaseOptions).catch(() => {})
    }, [loadMedicines])
  )

  const handleSearch = (text: string) => {
    setSearch(text)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setLoading(true)
      loadMedicines(text, 0, selectedDiseaseId ?? undefined)
    }, 400)
  }

  const handleClearSearch = () => {
    setSearch('')
    setLoading(true)
    loadMedicines('', 0, selectedDiseaseId ?? undefined)
  }

  const handleDiseaseFilter = (id: string) => {
    const next = selectedDiseaseId === id ? null : id
    setSelectedDiseaseId(next)
    setLoading(true)
    loadMedicines(search, 0, next ?? undefined)
  }

  const clearDiseaseFilter = () => {
    setSelectedDiseaseId(null)
    setLoading(true)
    loadMedicines(search, 0, undefined)
  }

  const selectedDiseaseName = diseaseOptions.find(d => d.id === selectedDiseaseId)?.name
  const hasMore = medicines.length < total

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return
    setLoadingMore(true)
    loadMedicines(search, page + 1, selectedDiseaseId ?? undefined)
  }, [loading, loadingMore, hasMore, search, page, selectedDiseaseId, loadMedicines])

  const renderMedicine = useCallback(
    ({ item }: { item: Medicine }) => (
      <MedicineCard
        med={item}
        onPress={() => navigation.navigate('MedicineDetail', { medicineId: item.id })}
      />
    ),
    [navigation]
  )
  const keyExtractor = useCallback((item: Medicine) => item.id, [])

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Medicine Lookup</Text>
          <Text style={styles.headerSubtitle}>
            {total > 0
              ? `${total} medicine${total !== 1 ? 's' : ''} in the database`
              : 'Veterinary medicine reference'}
          </Text>
        </View>
      </View>

      {/* Top disclaimer */}
      <View style={styles.disclaimer}>
        <Feather name="info" size={15} color="#7a5a2a" />
        <Text style={styles.disclaimerText}>
          For reference only. Always consult your veterinarian before giving any medicine to your pet.
        </Text>
      </View>

      <FlatList
        data={medicines}
        keyExtractor={keyExtractor}
        renderItem={renderMedicine}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              handleClearSearch()
            }}
            tintColor={Colors.greenSage}
          />
        }
        ListHeaderComponent={
          <>
            {/* Search bar */}
            <View style={styles.searchWrap}>
              <Feather name="search" size={16} color={Colors.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search medicines…"
                placeholderTextColor={Colors.textLight}
                value={search}
                onChangeText={handleSearch}
                clearButtonMode="while-editing"
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
                  <Feather name="x" size={14} color={Colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* Disease filter chips */}
            {diseaseOptions.length > 0 && (
              <FlatList
                horizontal
                data={diseaseOptions}
                keyExtractor={d => d.id}
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
                contentContainerStyle={styles.chipsContent}
                ListHeaderComponent={
                  <FilterChip label="All" selected={selectedDiseaseId === null} onPress={clearDiseaseFilter} />
                }
                renderItem={({ item: d }) => (
                  <FilterChip
                    label={d.name}
                    selected={selectedDiseaseId === d.id}
                    onPress={() => handleDiseaseFilter(d.id)}
                  />
                )}
              />
            )}

            {/* Active filter label */}
            {selectedDiseaseId && (
              <View style={styles.activeFilterRow}>
                <Text style={styles.activeFilterText}>
                  Filtered by: <Text style={styles.activeFilterName}>{selectedDiseaseName}</Text>
                </Text>
                <TouchableOpacity onPress={clearDiseaseFilter}>
                  <Text style={styles.activeFilterClear}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centred}>
              <ActivityIndicator size="large" color={Colors.greenSage} />
              <Text style={styles.loadingText}>Loading medicines…</Text>
            </View>
          ) : error ? (
            <View style={styles.centred}>
              <Feather name="alert-triangle" size={40} color={Colors.textLight} />
              <Text style={styles.stateTitle}>Something went wrong</Text>
              <Text style={styles.stateDesc}>{error}</Text>
              <Button
                label="Try again"
                onPress={() => { setLoading(true); loadMedicines(search, 0, selectedDiseaseId ?? undefined) }}
                variant="secondary"
                style={{ marginTop: Spacing.lg }}
              />
            </View>
          ) : (
            <View style={styles.centred}>
              <Feather name="package" size={40} color={Colors.textLight} />
              <Text style={styles.stateTitle}>No medicines found</Text>
              <Text style={styles.stateDesc}>
                {search
                  ? `No results for "${search}". Try a different search term.`
                  : selectedDiseaseId
                  ? `No medicines linked to ${selectedDiseaseName}.`
                  : 'The medicine database appears to be empty.'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color={Colors.greenSage} style={{ marginVertical: Spacing.lg }} />
          ) : (
            <View style={{ height: Spacing['2xl'] }} />
          )
        }
        windowSize={7}
        removeClippedSubviews={Platform.OS !== 'web'}
      />
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  // Header
  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: '600',
    color: Colors.cream,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Typography.base,
    color: 'rgba(245,240,232,0.65)',
  },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#fdf7ed',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e3c8',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
  },
  disclaimerText: {
    fontSize: Typography.sm,
    color: '#7a5a2a',
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  clearBtn: { padding: Spacing.xs },

  // Disease chips
  chipsScroll: { marginBottom: Spacing.md, marginHorizontal: -Spacing['2xl'] },
  chipsContent: { paddingHorizontal: Spacing['2xl'] },

  // Active filter row
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: 2,
  },
  activeFilterText: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  activeFilterName: {
    color: Colors.greenForest,
    fontWeight: '700',
  },
  activeFilterClear: {
    fontSize: Typography.sm,
    color: Colors.greenSage,
    fontWeight: '600',
  },

  // State screens
  centred: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  loadingText: { fontSize: Typography.base, color: Colors.textMuted },
  stateTitle: {
    fontSize: Typography.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  stateDesc: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Scroll
  scroll: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
})