import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar, ActivityIndicator, Platform } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { vetDirectoryAPI, type VetSummary } from '../../api/vetDirectoryAPI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

function VetCard({ vet, onPress }: { vet: VetSummary; onPress: () => void }) {
  const name = vet.profile?.fullName || vet.email
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.85}>
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
      </View>
      <Text style={cardStyles.chevron}>›</Text>
    </TouchableOpacity>
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

export function VetDirectoryScreen({ navigation }: any) {
  const [vets, setVets] = useState<VetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (q = '') => {
    try {
      setError('')
      const data = await vetDirectoryAPI.list(q || undefined)
      setVets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vets')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { setLoading(true); load(search) }, []))

  const handleSearch = (text: string) => {
    setSearch(text)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(text), 350)
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Vet</Text>
        <Text style={styles.headerSubtitle}>Search by name or clinic, then book an open slot</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
          <View style={styles.centred}><ActivityIndicator size="large" color={Colors.greenSage} /></View>
        ) : error ? (
          <View style={styles.centred}><Text style={styles.stateText}>{error}</Text></View>
        ) : vets.length === 0 ? (
          <View style={styles.centred}><Text style={styles.stateText}>No vets found.</Text></View>
        ) : (
          vets.map(vet => (
            <VetCard
              key={vet.id}
              vet={vet}
              onPress={() => navigation.navigate('VetAvailability', { vetId: vet.id, vetName: vet.profile?.fullName || vet.email })}
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
  header: { backgroundColor: Colors.greenDeep, paddingHorizontal: Spacing['2xl'], paddingTop: Platform.OS === 'ios' ? 56 : Spacing['3xl'], paddingBottom: Spacing['2xl'], gap: 4 },
  backBtn: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  backBtnText: { fontSize: Typography.base, color: 'rgba(245,240,232,0.70)', fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: Colors.cream, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(245,240,232,0.62)', lineHeight: 20 },
  scroll: { padding: Spacing['2xl'] },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.warmWhite, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg, gap: Spacing.sm },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, height: 46, fontSize: Typography.base, color: Colors.textPrimary },
  centred: { alignItems: 'center', paddingVertical: Spacing['4xl'] },
  stateText: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center' },
})