import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import * as Location from 'expo-location'
import { vetDirectoryAPI, type VetSummary, type Coordinates } from '../../api/vetDirectoryAPI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'
import { SkeletonBlock, FadeSlideIn, EmptyState, PressableScale } from '../../components/Motion'

function DistanceBadge({ distanceKm }: { distanceKm?: number | null }) {
  if (distanceKm == null) return null
  const label = distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m away` : `${distanceKm.toFixed(1)} km away`
  return (
    <View style={distStyles.wrap}>
      <Text style={distStyles.text}>📍 {label}</Text>
    </View>
  )
}

const distStyles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', backgroundColor: Colors.greenPale, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, marginTop: 6 },
  text: { fontSize: 11, fontWeight: '700', color: Colors.greenForest },
})

function VetCard({ vet, onPress }: { vet: VetSummary; onPress: () => void }) {
  const name = vet.profile?.fullName || vet.email
  return (
    <PressableScale onPress={onPress} scaleTo={0.98} style={cardStyles.card as any}>
      <View style={cardStyles.avatar}>
        <Text style={cardStyles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={cardStyles.name} numberOfLines={1}>{name}</Text>
        {vet.profile?.clinicName ? <Text style={cardStyles.clinic} numberOfLines={1}>{vet.profile.clinicName}</Text> : null}
        {vet.profile?.address ? <Text style={cardStyles.address} numberOfLines={1}>📍 {vet.profile.address}</Text> : null}
        {vet.profile?.specialization ? (
          <View style={cardStyles.specPill}>
            <Text style={cardStyles.specPillText}>{vet.profile.specialization}</Text>
          </View>
        ) : null}
        <DistanceBadge distanceKm={vet.distanceKm} />
      </View>
      <Text style={cardStyles.chevron}>›</Text>
    </PressableScale>
  )
}

/** Skeleton placeholder matching VetCard's layout, shown while the directory first loads. */
function VetSkeletonCard() {
  return (
    <View style={cardStyles.card}>
      <SkeletonBlock width={48} height={48} style={{ borderRadius: 24, flexShrink: 0 }} />
      <View style={{ flex: 1, gap: 6, marginLeft: Spacing.md }}>
        <SkeletonBlock width="55%" height={16} />
        <SkeletonBlock width="40%" height={13} />
        <SkeletonBlock width="70%" height={12} />
      </View>
    </View>
  )
}

const cardStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.warmWhite, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadow.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.greenPale, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: Typography.lg, fontWeight: '700', color: Colors.greenForest },
  name: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  clinic: { fontSize: Typography.sm, color: Colors.textMuted, marginTop: 1 },
  address: { fontSize: Typography.xs, color: Colors.textLight, marginTop: 2 },
  specPill: { alignSelf: 'flex-start', backgroundColor: Colors.greenPale, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, marginTop: 6 },
  specPillText: { fontSize: 10, fontWeight: '700', color: Colors.greenForest },
  chevron: { fontSize: 22, color: Colors.textLight },
})

const RADIUS_OPTIONS = [5, 10, 25, 50]

export function VetDirectoryScreen({ navigation }: any) {
  const [vets, setVets] = useState<VetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [locationState, setLocationState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')
  const [radiusKm, setRadiusKm] = useState<number | null>(null)

  const load = useCallback(async (q = '', useCoords: Coordinates | null = null, radius: number | null = null) => {
    try {
      setError('')
      const data = await vetDirectoryAPI.list(q || undefined, useCoords || undefined, radius || undefined)
      setVets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vets')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { setLoading(true); load(search, coords, radiusKm) }, []))

  const handleSearch = (text: string) => {
    setSearch(text)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setLoading(true); load(text, coords, radiusKm) }, 350)
  }

  async function handleEnableLocation() {
    if (Platform.OS === 'web') {
      setError('Location search is not supported in this preview — try it on a device or simulator.')
      return
    }
    setLocationState('requesting')
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocationState('denied')
        return
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const next: Coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude }
      setCoords(next)
      setLocationState('granted')
      setLoading(true)
      load(search, next, radiusKm)
    } catch {
      setLocationState('denied')
      setError('Could not determine your location. Please try again.')
    }
  }

  function handleClearLocation() {
    setCoords(null)
    setRadiusKm(null)
    setLocationState('idle')
    setLoading(true)
    load(search, null, null)
  }

  function handleRadiusSelect(km: number) {
    const next = radiusKm === km ? null : km
    setRadiusKm(next)
    setLoading(true)
    load(search, coords, next)
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />
      <FadeSlideIn distance={-16}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find a Vet</Text>
          <Text style={styles.headerSubtitle}>
            {coords ? 'Showing vets sorted by distance from you' : 'Search by name or clinic, then book an open slot'}
          </Text>
        </View>
      </FadeSlideIn>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Location prompt */}
        {locationState !== 'granted' && (
          <View style={styles.locationBanner}>
            <Text style={styles.locationBannerText}>
              {locationState === 'denied'
                ? 'Location access was denied. Enable it in your device settings to see distances to vets.'
                : 'Enable location to find veterinarians nearest to you.'}
            </Text>
            <PressableScale onPress={handleEnableLocation} style={styles.locationBtn as any}>
              <Text style={styles.locationBtnText}>
                {locationState === 'requesting' ? 'Locating…' : '📍 Use my location'}
              </Text>
            </PressableScale>
          </View>
        )}

        {/* Radius filter — only meaningful once we have coordinates */}
        {locationState === 'granted' && (
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map(km => (
              <TouchableOpacity
                key={km}
                style={[styles.radiusChip, radiusKm === km && styles.radiusChipSelected]}
                onPress={() => handleRadiusSelect(km)}
              >
                <Text style={[styles.radiusChipText, radiusKm === km && styles.radiusChipTextSelected]}>
                  Within {km} km
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.radiusClear} onPress={handleClearLocation}>
              <Text style={styles.radiusClearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search vets or clinics…"
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={handleSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {loading ? (
          <>
            <VetSkeletonCard />
            <VetSkeletonCard />
            <VetSkeletonCard />
          </>
        ) : error ? (
          <View style={styles.centred}><Text style={styles.stateText}>{error}</Text></View>
        ) : vets.length === 0 ? (
          <EmptyState
            emoji="🩺"
            title="No vets found"
            desc={radiusKm ? `No vets found within ${radiusKm} km. Try a wider radius.` : 'Try a different search term.'}
          />
        ) : (
          vets.map((vet, i) => (
            <FadeSlideIn key={vet.id} delay={i * 50} distance={14}>
              <VetCard
                vet={vet}
                onPress={() => navigation.navigate('VetAvailability', { vetId: vet.id, vetName: vet.profile?.fullName || vet.email })}
              />
            </FadeSlideIn>
          ))
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
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(245,240,232,0.62)', lineHeight: 20 },
  scroll: { padding: Spacing['2xl'] },

  locationBanner: {
    backgroundColor: Colors.ivory, borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.warmWhite, marginBottom: Spacing.lg, gap: Spacing.sm,
  },
  locationBannerText: { fontSize: Typography.sm, color: Colors.textBody, lineHeight: 20 },
  locationBtn: {
    alignSelf: 'flex-start', backgroundColor: Colors.greenDeep, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2, borderRadius: Radius.full,
  },
  locationBtnText: { fontSize: Typography.sm, fontWeight: '700', color: Colors.cream },

  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md, alignItems: 'center' },
  radiusChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm - 1, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.warmWhite, backgroundColor: Colors.white },
  radiusChipSelected: { borderColor: Colors.greenSage, backgroundColor: Colors.greenPale },
  radiusChipText: { fontSize: Typography.sm, fontWeight: '500', color: Colors.textBody },
  radiusChipTextSelected: { color: Colors.greenForest, fontWeight: '700' },
  radiusClear: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  radiusClearText: { fontSize: Typography.sm, color: Colors.error, fontWeight: '600' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.warmWhite, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, height: 46, fontSize: Typography.base, color: Colors.textPrimary },
  centred: { alignItems: 'center', paddingVertical: Spacing['4xl'] },
  stateText: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center' },
})