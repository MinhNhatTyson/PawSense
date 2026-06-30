import React, { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { catProfileAPI, type CatProfile } from '../../api/catProfileAPI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'
import { Button } from '../../components/UI'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Skeleton pulse animation ──────────────────────────────────────────────────
function SkeletonBlock({
  width,
  height,
  style,
}: {
  width: number | string
  height: number
  style?: any
}) {
  const opacity = useRef(new Animated.Value(0.3)).current

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: Radius.sm,
          backgroundColor: Colors.warmWhite,
          opacity,
        },
        style,
      ]}
    />
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <SkeletonBlock width="100%" height={160} style={{ borderRadius: 0 }} />
      <View style={skeletonStyles.body}>
        <SkeletonBlock width="55%" height={22} />
        <View style={{ gap: 8, marginTop: 8 }}>
          <SkeletonBlock width="80%" height={14} />
          <SkeletonBlock width="60%" height={14} />
        </View>
      </View>
    </View>
  )
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  body: { padding: Spacing.lg, gap: 6 },
})

// ── Gender badge ──────────────────────────────────────────────────────────────
function GenderBadge({ gender }: { gender: string }) {
  const cfg =
    {
      MALE: { label: '♂ Male', bg: '#E8F4FA', color: '#1A5276' },
      FEMALE: { label: '♀ Female', bg: '#FAEAEA', color: '#78281F' },
      UNKNOWN: { label: '? Unknown', bg: Colors.ivory, color: Colors.textLight },
    }[gender] ?? { label: gender, bg: Colors.ivory, color: Colors.textLight }

  return (
    <View style={[gBadge.wrap, { backgroundColor: cfg.bg }]}>
      <Text style={[gBadge.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  )
}

const gBadge = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  text: { fontSize: Typography.xs, fontWeight: '700', letterSpacing: 0.3 },
})

// ── Animated cat card ─────────────────────────────────────────────────────────
function CatCard({
  cat,
  index,
  onPress,
  onEdit,
  onDelete,
}: {
  cat: CatProfile
  index: number
  onPress: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(24)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start()
  }

  const primaryImage = cat.imageUrls[0]
  const ageDisplay =
    cat.ageYears != null
      ? `${cat.ageYears}y${cat.ageMonths ? ` ${cat.ageMonths}m` : ''}`
      : cat.ageMonths != null
      ? `${cat.ageMonths}mo`
      : null

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={cardStyles.card}
      >
        {/* Image */}
        <View style={cardStyles.imageWrap}>
          {primaryImage ? (
            <Image
              source={{ uri: primaryImage }}
              style={cardStyles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={cardStyles.imagePlaceholder}>
              <Text style={cardStyles.imagePlaceholderEmoji}>🐱</Text>
              <Text style={cardStyles.imagePlaceholderText}>No photo yet</Text>
            </View>
          )}
          <GenderBadge gender={cat.gender} />
          {cat.imageUrls.length > 1 && (
            <View style={cardStyles.imageCountPill}>
              <Text style={cardStyles.imageCountText}>
                +{cat.imageUrls.length - 1}
              </Text>
            </View>
          )}
          {/* Gradient overlay for readability */}
          <View style={cardStyles.imageGradient} />
        </View>

        {/* Body */}
        <View style={cardStyles.body}>
          <Text style={cardStyles.name}>{cat.name}</Text>

          <View style={cardStyles.metaGrid}>
            {cat.breed ? (
              <View style={cardStyles.metaItem}>
                <Text style={cardStyles.metaLabel}>Breed</Text>
                <Text style={cardStyles.metaValue} numberOfLines={1}>
                  {cat.breed}
                </Text>
              </View>
            ) : null}
            {ageDisplay ? (
              <View style={cardStyles.metaItem}>
                <Text style={cardStyles.metaLabel}>Age</Text>
                <Text style={cardStyles.metaValue}>{ageDisplay}</Text>
              </View>
            ) : null}
            {cat.weightKg != null ? (
              <View style={cardStyles.metaItem}>
                <Text style={cardStyles.metaLabel}>Weight</Text>
                <Text style={cardStyles.metaValue}>{cat.weightKg} kg</Text>
              </View>
            ) : null}
          </View>

          {cat.vaccinations.length > 0 && (
            <View style={cardStyles.vaccinePill}>
              <Text style={cardStyles.vaccinePillText}>
                💉 {cat.vaccinations.length} vaccination
                {cat.vaccinations.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={cardStyles.footer}>
          <TouchableOpacity
            style={cardStyles.footerActionBtn}
            onPress={onEdit}
            activeOpacity={0.75}
          >
            <Text style={cardStyles.footerActionText}>Edit</Text>
          </TouchableOpacity>
          <View style={cardStyles.footerDivider} />
          <TouchableOpacity
            style={[cardStyles.footerActionBtn, cardStyles.viewBtn]}
            onPress={onPress}
            activeOpacity={0.75}
          >
            <Text style={[cardStyles.footerActionText, cardStyles.viewBtnText]}>
              View profile →
            </Text>
          </TouchableOpacity>
          <View style={cardStyles.footerDivider} />
          <TouchableOpacity
            style={[cardStyles.footerActionBtn, cardStyles.deleteBtn]}
            onPress={onDelete}
            activeOpacity={0.75}
          >
            <Text style={cardStyles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    overflow: 'hidden',
    ...Shadow.md,
  },
  imageWrap: { width: '100%', height: 200, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  imagePlaceholderEmoji: { fontSize: 52 },
  imagePlaceholderText: {
    fontSize: Typography.sm,
    color: Colors.greenSage,
    fontWeight: '500',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  imageCountPill: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(26,58,42,0.80)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  imageCountText: { fontSize: Typography.xs, color: Colors.cream, fontWeight: '600' },
  body: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  name: {
    fontSize: Typography['2xl'],
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 2,
  },
  metaItem: {
    backgroundColor: Colors.ivory,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    minWidth: 72,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.textLight,
    marginBottom: 1,
  },
  metaValue: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textBody,
  },
  vaccinePill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.greenPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(74,124,95,0.2)',
    marginTop: 2,
  },
  vaccinePillText: {
    fontSize: Typography.xs,
    color: Colors.greenForest,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.ivory,
  },
  footerActionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerActionText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  viewBtn: { flex: 2 },
  viewBtnText: { color: Colors.greenForest },
  deleteBtn: { flex: 0.7 },
  deleteBtnText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.error,
  },
  footerDivider: { width: 1, backgroundColor: Colors.ivory, marginVertical: 8 },
})

// ── Empty state with animation ────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  const bounceAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start()
  }, [])

  return (
    <Animated.View style={[emptyStyles.wrap, { opacity: fadeAnim }]}>
      <Animated.Text
        style={[emptyStyles.emoji, { transform: [{ translateY: bounceAnim }] }]}
      >
        🐾
      </Animated.Text>
      <Text style={emptyStyles.title}>No cats yet</Text>
      <Text style={emptyStyles.desc}>
        Add your first cat to start tracking their health, vaccinations, and more.
      </Text>
      <Button
        label="Add my first cat"
        onPress={onAdd}
        style={{ marginTop: Spacing.xl, width: '100%' } as any}
      />
    </Animated.View>
  )
}

const emptyStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
  },
  emoji: { fontSize: 72, marginBottom: Spacing.md },
  title: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  desc: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
})

// ── Main screen ───────────────────────────────────────────────────────────────
export function CatListScreen({ navigation }: any) {
  const [cats, setCats] = useState<CatProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const headerAnim = useRef(new Animated.Value(0)).current

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

  useFocusEffect(
    useCallback(() => {
      // Animate header in on focus
      headerAnim.setValue(0)
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }).start()
      loadCats()
    }, [loadCats])
  )

  const handleDelete = (cat: CatProfile) => {
    Alert.alert(
      `Delete ${cat.name}?`,
      'This will permanently remove this cat profile and all their health records. This cannot be undone.',
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
              Alert.alert('Error', 'Failed to delete cat profile. Please try again.')
            }
          },
        },
      ]
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      {/* Animated header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-12, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Top row: back + add button */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('CatForm', { mode: 'create' })}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ New cat</Text>
          </TouchableOpacity>
        </View>

        {/* Title row */}
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>My Cats</Text>
          <Text style={styles.headerSubtitle}>
            {loading
              ? 'Loading…'
              : cats.length > 0
              ? `${cats.length} cat${cats.length !== 1 ? 's' : ''} in your family`
              : 'Your cat family lives here'}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              loadCats()
            }}
            tintColor={Colors.greenSage}
            colors={[Colors.greenForest]}
          />
        }
      >
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorDesc}>{error}</Text>
            <Button
              label="Try again"
              onPress={loadCats}
              variant="secondary"
              style={{ marginTop: Spacing.lg } as any}
            />
          </View>
        ) : cats.length === 0 ? (
          <EmptyState
            onAdd={() => navigation.navigate('CatForm', { mode: 'create' })}
          />
        ) : (
          cats.map((cat, index) => (
            <CatCard
              key={cat.id}
              cat={cat}
              index={index}
              onPress={() => navigation.navigate('CatDetail', { catId: cat.id })}
              onEdit={() => navigation.navigate('CatForm', { mode: 'edit', cat })}
              onDelete={() => handleDelete(cat)}
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
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: Spacing.xs,
  },
  backBtnText: {
    fontSize: Typography.base,
    color: 'rgba(245,240,232,0.70)',
    fontWeight: '500',
  },
  headerText: {},
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Typography.base,
    color: 'rgba(245,240,232,0.62)',
  },
  addBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    flexShrink: 0,
    ...Shadow.sm,
  },
  addBtnText: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  scroll: {
    padding: Spacing['2xl'],
    gap: Spacing.lg,
  },
  errorWrap: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    gap: Spacing.md,
  },
  errorEmoji: { fontSize: 48 },
  errorTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  errorDesc: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center' },
})