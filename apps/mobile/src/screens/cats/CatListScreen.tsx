import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, StatusBar, RefreshControl, Alert,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { catProfileAPI, type CatProfile } from '../../api/catProfileAPI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'
import { Button } from '../../components/UI'

function GenderBadge({ gender }: { gender: string }) {
  const config = {
    MALE: { label: 'Male', bg: '#e8f0f7', color: '#2a5a8a' },
    FEMALE: { label: 'Female', bg: '#f7e8f0', color: '#8a2a5a' },
    UNKNOWN: { label: 'Unknown', bg: Colors.ivory, color: Colors.textLight },
  }[gender] ?? { label: gender, bg: Colors.ivory, color: Colors.textLight }

  return (
    <View style={[styles.genderBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.genderBadgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  )
}

function CatCard({
  cat,
  onPress,
  onEdit,
  onDelete,
}: {
  cat: CatProfile
  onPress: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const primaryImage = cat.imageUrls[0]
  const ageDisplay = cat.ageYears != null
    ? `${cat.ageYears}y${cat.ageMonths ? ` ${cat.ageMonths}m` : ''}`
    : cat.ageMonths != null ? `${cat.ageMonths}mo` : null

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image */}
      <View style={styles.cardImageWrap}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImagePlaceholderText}>🐱</Text>
          </View>
        )}
        {cat.imageUrls.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Text style={styles.imageCountText}>+{cat.imageUrls.length - 1}</Text>
          </View>
        )}
        <GenderBadge gender={cat.gender} />
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{cat.name}</Text>

        <View style={styles.cardMeta}>
          {cat.breed ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Breed</Text>
              <Text style={styles.metaValue}>{cat.breed}</Text>
            </View>
          ) : null}
          {ageDisplay ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Age</Text>
              <Text style={styles.metaValue}>{ageDisplay}</Text>
            </View>
          ) : null}
          {cat.weightKg != null ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Weight</Text>
              <Text style={styles.metaValue}>{cat.weightKg} kg</Text>
            </View>
          ) : null}
        </View>

        {cat.vaccinations.length > 0 && (
          <View style={styles.vaccineBadge}>
            <Text style={styles.vaccineBadgeText}>
              💉 {cat.vaccinations.length} vaccination{cat.vaccinations.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.footerBtn} onPress={onEdit}>
          <Text style={styles.footerBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, styles.footerBtnDanger]}
          onPress={onDelete}
        >
          <Text style={[styles.footerBtnText, styles.footerBtnTextDanger]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

export function CatListScreen({ navigation }: any) {
  const [cats, setCats] = useState<CatProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadCats = useCallback(async () => {
    try {
      setError('')
      const data = await catProfileAPI.list()
      setCats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { loadCats() }, [loadCats]))

  const handleDelete = (cat: CatProfile) => {
    Alert.alert(
      `Delete ${cat.name}?`,
      'This will permanently remove this cat profile and all their records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await catProfileAPI.delete(cat.id)
              setCats(prev => prev.filter(c => c.id !== cat.id))
            } catch {
              Alert.alert('Error', 'Failed to delete cat profile')
            }
          },
        },
      ]
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Cats</Text>
          <Text style={styles.headerSubtitle}>
            {cats.length > 0
              ? `${cats.length} cat${cats.length !== 1 ? 's' : ''} in your family`
              : 'Manage your cat health profiles'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CatForm', { mode: 'create' })}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ Add Cat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadCats() }}
            tintColor={Colors.greenSage}
          />
        }
      >
        {loading && cats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐱</Text>
            <Text style={styles.emptyTitle}>Loading cats…</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptyDesc}>{error}</Text>
            <Button label="Try again" onPress={loadCats} variant="secondary" style={{ marginTop: Spacing.lg }} />
          </View>
        ) : cats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyTitle}>No cats yet</Text>
            <Text style={styles.emptyDesc}>
              Add your first cat to start tracking their health, vaccinations, and more.
            </Text>
            <Button
              label="Add my first cat"
              onPress={() => navigation.navigate('CatForm', { mode: 'create' })}
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        ) : (
          cats.map(cat => (
            <CatCard
              key={cat.id}
              cat={cat}
              onPress={() => navigation.navigate('CatDetail', { catId: cat.id })}
              onEdit={() => navigation.navigate('CatForm', { mode: 'edit', cat })}
              onDelete={() => handleDelete(cat)}
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  // ── Header ────────────────────────────────────────
  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: Spacing.md,
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
  addBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  addBtnText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.2,
  },

  // ── Scroll ────────────────────────────────────────
  scroll: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
    gap: Spacing.lg,
  },

  // ── Card ─────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardImageWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagePlaceholderText: { fontSize: 56 },
  imageCountBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(26,58,42,0.75)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  imageCountText: {
    fontSize: Typography.xs,
    color: Colors.cream,
    fontWeight: '500',
  },
  genderBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  genderBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── Card body ─────────────────────────────────────
  cardBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardName: {
    fontSize: Typography.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  cardMeta: { gap: 6 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: Typography.sm,
    color: Colors.textLight,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: Typography.base,
    color: Colors.textBody,
    fontWeight: '500',
  },
  vaccineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.greenPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(74,124,95,0.2)',
    marginTop: 4,
  },
  vaccineBadgeText: {
    fontSize: Typography.xs,
    color: Colors.greenForest,
    fontWeight: '600',
  },

  // ── Card footer ────────────────────────────────────
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.ivory,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.ivory,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
  },
  footerBtnDanger: {
    backgroundColor: Colors.errorBg,
    borderColor: 'rgba(192,58,43,0.15)',
    flex: 0,
    paddingHorizontal: Spacing.lg,
  },
  footerBtnText: {
    fontSize: Typography.base,
    fontWeight: '500',
    color: Colors.textBody,
  },
  footerBtnTextDanger: { color: Colors.error },

  // ── Empty state ───────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
})