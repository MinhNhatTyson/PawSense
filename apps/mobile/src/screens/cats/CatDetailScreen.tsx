import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, StatusBar, Alert, ActivityIndicator,
} from 'react-native'
import { catProfileAPI, type CatProfile } from '../../api/catProfileAPI'
import { Button } from '../../components/UI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionLine} />
      </View>
      {children}
    </View>
  )
}

export function CatDetailScreen({ navigation, route }: any) {
  const { catId } = route.params as { catId: string }
  const [cat, setCat] = useState<CatProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  useEffect(() => {
    catProfileAPI.getById(catId)
      .then(setCat)
      .catch(() => Alert.alert('Error', 'Failed to load cat profile'))
      .finally(() => setLoading(false))
  }, [catId])

  const handleDelete = () => {
    if (!cat) return
    Alert.alert(
      `Delete ${cat.name}?`,
      'This will permanently remove this cat profile and all their records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await catProfileAPI.delete(cat.id)
            navigation.goBack()
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.greenSage} />
      </View>
    )
  }

  if (!cat) return null

  const ageDisplay = cat.ageYears != null
    ? `${cat.ageYears} year${cat.ageYears !== 1 ? 's' : ''}${cat.ageMonths ? ` ${cat.ageMonths} months` : ''}`
    : cat.ageMonths != null ? `${cat.ageMonths} months` : null

  const genderLabel = { MALE: 'Male ♂', FEMALE: 'Female ♀', UNKNOWN: 'Unknown' }[cat.gender]

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          {cat.imageUrls.length > 0 ? (
            <Image
              source={{ uri: cat.imageUrls[activeImageIdx] }}
              style={styles.heroImage}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderText}>🐱</Text>
            </View>
          )}

          <View style={styles.heroOverlay}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.heroContent}>
              <Text style={styles.heroName}>{cat.name}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{genderLabel}</Text>
                </View>
                {cat.breed ? (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>{cat.breed}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* Image gallery thumbnails */}
        {cat.imageUrls.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.galleryScroll}
            contentContainerStyle={styles.galleryContent}
          >
            {cat.imageUrls.map((url, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.galleryThumb, idx === activeImageIdx && styles.galleryThumbActive]}
                onPress={() => setActiveImageIdx(idx)}
              >
                <Image source={{ uri: url }} style={styles.galleryThumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Action bar */}
        <View style={styles.actionBar}>
          <Button
            label="Edit profile"
            onPress={() => navigation.navigate('CatForm', { mode: 'edit', cat })}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            label="Delete"
            onPress={handleDelete}
            variant="danger"
            style={{ flex: 0, paddingHorizontal: Spacing.xl } as any}
          />
        </View>

        <View style={styles.content}>
          {/* Vital stats */}
          <Section title="Profile">
            {ageDisplay ? <InfoRow label="Age" value={ageDisplay} /> : null}
            {cat.weightKg != null ? <InfoRow label="Weight" value={`${cat.weightKg} kg`} /> : null}
            {cat.color ? <InfoRow label="Coat colour" value={cat.color} /> : null}
            {cat.breed ? <InfoRow label="Breed" value={cat.breed} /> : null}
            <InfoRow label="Gender" value={genderLabel} />
            {!ageDisplay && cat.weightKg == null && !cat.color && (
              <Text style={styles.emptyText}>No profile details recorded yet.</Text>
            )}
          </Section>

          {/* Notes */}
          {cat.notes ? (
            <Section title="Notes">
              <Text style={styles.notesText}>{cat.notes}</Text>
            </Section>
          ) : null}

          {/* Vaccinations */}
          <Section title={`Vaccination history (${cat.vaccinations.length})`}>
            {cat.vaccinations.length === 0 ? (
              <Text style={styles.emptyText}>No vaccinations recorded.</Text>
            ) : (
              cat.vaccinations.map((v, idx) => (
                <View key={v.id} style={styles.vaccCard}>
                  <View style={styles.vaccHeader}>
                    <Text style={styles.vaccName}>{v.vaccineName}</Text>
                    <View style={styles.vaccDateBadge}>
                      <Text style={styles.vaccDateText}>
                        {new Date(v.dateGiven).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  {v.nextDueDate ? (
                    <Text style={styles.vaccNext}>
                      Next due: {new Date(v.nextDueDate).toLocaleDateString()}
                    </Text>
                  ) : null}
                  {v.veterinarian ? (
                    <Text style={styles.vaccVet}>Dr. {v.veterinarian}</Text>
                  ) : null}
                  {v.notes ? (
                    <Text style={styles.vaccNotes}>{v.notes}</Text>
                  ) : null}
                </View>
              ))
            )}
          </Section>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  loadingWrap: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },

  // ── Hero ──────────────────────────────────────────
  hero: { height: 280, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: { fontSize: 80 },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    padding: Spacing['2xl'],
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26,58,42,0.35)',
  },
  backBtn: { alignSelf: 'flex-start' },
  backBtnText: { fontSize: Typography.base, color: Colors.cream, fontWeight: '500' },
  heroContent: { gap: Spacing.sm },
  heroName: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: -0.5,
  },
  heroMeta: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBadgeText: { fontSize: Typography.sm, color: Colors.cream, fontWeight: '500' },

  // ── Gallery ───────────────────────────────────────
  galleryScroll: { backgroundColor: Colors.greenDeep },
  galleryContent: { padding: Spacing.md, gap: Spacing.sm },
  galleryThumb: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  galleryThumbActive: { borderColor: Colors.gold },
  galleryThumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  // ── Action bar ────────────────────────────────────
  actionBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing['2xl'],
    paddingBottom: 0,
  },

  // ── Content ───────────────────────────────────────
  content: { padding: Spacing['2xl'], gap: Spacing.lg },

  // ── Section ───────────────────────────────────────
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.warmWhite },

  // ── Info rows ─────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ivory,
  },
  infoLabel: {
    fontSize: Typography.sm,
    color: Colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  infoValue: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: '500' },

  emptyText: { fontSize: Typography.base, color: Colors.textLight, fontStyle: 'italic' },
  notesText: {
    fontSize: Typography.base,
    color: Colors.textBody,
    lineHeight: 22,
  },

  // ── Vaccination cards ─────────────────────────────
  vaccCard: {
    padding: Spacing.md,
    backgroundColor: Colors.ivory,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    gap: 4,
  },
  vaccHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  vaccName: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  vaccDateBadge: {
    backgroundColor: Colors.greenPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  vaccDateText: {
    fontSize: Typography.xs,
    color: Colors.greenForest,
    fontWeight: '600',
  },
  vaccNext: { fontSize: Typography.sm, color: Colors.gold, fontWeight: '500' },
  vaccVet: { fontSize: Typography.sm, color: Colors.textMuted },
  vaccNotes: { fontSize: Typography.sm, color: Colors.textLight, fontStyle: 'italic' },
})