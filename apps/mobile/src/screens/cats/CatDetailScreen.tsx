import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
} from 'react-native'
import { catProfileAPI, type CatProfile, type Vaccination } from '../../api/catProfileAPI'
import { Button } from '../../components/UI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const HERO_HEIGHT = 300

// ── Animated section card ─────────────────────────────────────────────────────
function SectionCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        sectionCardStyles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {children}
    </Animated.View>
  )
}

const sectionCardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    ...Shadow.sm,
  },
})

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ title }: { title: string }) {
  return (
    <View style={headingStyles.wrap}>
      <Text style={headingStyles.text}>{title}</Text>
      <View style={headingStyles.line} />
    </View>
  )
}

const headingStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  text: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.warmWhite },
})

// ── Info row with animated underline ─────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  )
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ivory,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.textLight,
  },
  value: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: Spacing.lg,
  },
})

// ── Vaccination card with slide-in ────────────────────────────────────────────
function VaccinationCard({
  vaccination,
  index,
}: {
  vaccination: Vaccination
  index: number
}) {
  const slideAnim = useRef(new Animated.Value(30)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        delay: 400 + index * 70,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        delay: 400 + index * 70,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const dateGiven = new Date(vaccination.dateGiven)
  const nextDue = vaccination.nextDueDate ? new Date(vaccination.nextDueDate) : null
  const isOverdue = nextDue && nextDue < new Date()
  const isDueSoon =
    nextDue &&
    !isOverdue &&
    nextDue.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={vaccCardStyles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Left accent bar colour-coded by status */}
        <View
          style={[
            vaccCardStyles.accentBar,
            {
              backgroundColor: isOverdue
                ? Colors.error
                : isDueSoon
                ? Colors.gold
                : Colors.greenSage,
            },
          ]}
        />

        <View style={vaccCardStyles.body}>
          {/* Top row: name + date badge */}
          <View style={vaccCardStyles.topRow}>
            <Text style={vaccCardStyles.name} numberOfLines={1}>
              {vaccination.vaccineName}
            </Text>
            <View style={vaccCardStyles.dateBadge}>
              <Text style={vaccCardStyles.dateBadgeText}>
                {dateGiven.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Next due */}
          {nextDue && (
            <View style={vaccCardStyles.nextDueRow}>
              <Text
                style={[
                  vaccCardStyles.nextDueLabel,
                  isOverdue && vaccCardStyles.nextDueLabelOverdue,
                  isDueSoon && vaccCardStyles.nextDueLabelSoon,
                ]}
              >
                {isOverdue ? '⚠ Overdue · ' : isDueSoon ? '⏰ Due soon · ' : '🗓 Next · '}
                {nextDue.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

          {/* Vet */}
          {vaccination.veterinarian && (
            <Text style={vaccCardStyles.vet}>
              Dr. {vaccination.veterinarian}
            </Text>
          )}

          {/* Notes */}
          {vaccination.notes && (
            <Text style={vaccCardStyles.notes} numberOfLines={2}>
              {vaccination.notes}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const vaccCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.ivory,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  accentBar: {
    width: 4,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    padding: Spacing.md,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  dateBadge: {
    backgroundColor: Colors.greenPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  dateBadgeText: {
    fontSize: Typography.xs,
    color: Colors.greenForest,
    fontWeight: '700',
  },
  nextDueRow: { flexDirection: 'row', alignItems: 'center' },
  nextDueLabel: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  nextDueLabelOverdue: { color: Colors.error },
  nextDueLabelSoon: { color: '#b87a00' },
  vet: {
    fontSize: Typography.sm,
    color: Colors.textLight,
  },
  notes: {
    fontSize: Typography.sm,
    color: Colors.textLight,
    fontStyle: 'italic',
    lineHeight: 18,
  },
})

// ── Image gallery thumbnail ───────────────────────────────────────────────────
function GalleryThumb({
  uri,
  active,
  onPress,
}: {
  uri: string
  active: boolean
  onPress: () => void
}) {
  const borderAnim = useRef(new Animated.Value(active ? 1 : 0)).current

  useEffect(() => {
    Animated.spring(borderAnim, {
      toValue: active ? 1 : 0,
      tension: 150,
      friction: 10,
      useNativeDriver: false,
    }).start()
  }, [active])

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.warmWhite, Colors.gold],
  })
  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 2.5],
  })

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[galleryStyles.thumb, { borderColor, borderWidth }]}>
        <Image source={{ uri }} style={galleryStyles.thumbImg} resizeMode="cover" />
      </Animated.View>
    </TouchableOpacity>
  )
}

const galleryStyles = StyleSheet.create({
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  thumbImg: { width: '100%', height: '100%' },
})

// ── Gender badge ──────────────────────────────────────────────────────────────
function GenderBadge({ gender }: { gender: string }) {
  const cfg =
    {
      MALE: { label: '♂ Male', bg: 'rgba(26,82,138,0.12)', color: '#1a3a5e' },
      FEMALE: { label: '♀ Female', bg: 'rgba(120,40,31,0.12)', color: '#6b1f1a' },
      UNKNOWN: { label: '? Unknown', bg: 'rgba(255,255,255,0.15)', color: Colors.cream },
    }[gender] ?? { label: gender, bg: 'rgba(255,255,255,0.15)', color: Colors.cream }

  return (
    <View style={[gbStyles.wrap, { backgroundColor: cfg.bg }]}>
      <Text style={[gbStyles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  )
}

const gbStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  text: { fontSize: Typography.sm, fontWeight: '700', letterSpacing: 0.2 },
})

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Animated.View
        style={[skeleStyles.hero, { opacity }]}
      />
      <View style={skeleStyles.content}>
        <Animated.View style={[skeleStyles.titleBlock, { opacity }]} />
        <Animated.View style={[skeleStyles.card, { opacity }]} />
        <Animated.View style={[skeleStyles.card, { opacity, height: 140 }]} />
      </View>
    </View>
  )
}

const skeleStyles = StyleSheet.create({
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: Colors.greenPale,
  },
  content: { padding: Spacing['2xl'], gap: Spacing.lg },
  titleBlock: {
    height: 32,
    width: '50%',
    borderRadius: Radius.md,
    backgroundColor: Colors.warmWhite,
  },
  card: {
    height: 100,
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
  },
})

// ── Main screen ───────────────────────────────────────────────────────────────
export function CatDetailScreen({ navigation, route }: any) {
  const { catId } = route.params as { catId: string }
  const [cat, setCat] = useState<CatProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  // Animated values
  const heroOpacity = useRef(new Animated.Value(0)).current
  const heroScale = useRef(new Animated.Value(1.04)).current
  const contentFade = useRef(new Animated.Value(0)).current
  const actionBarAnim = useRef(new Animated.Value(0)).current
  const scrollY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    catProfileAPI
      .getById(catId)
      .then(data => {
        setCat(data)
        // Orchestrated entrance after data loads
        Animated.sequence([
          // 1. Hero fades + unscales
          Animated.parallel([
            Animated.timing(heroOpacity, {
              toValue: 1,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.spring(heroScale, {
              toValue: 1,
              tension: 55,
              friction: 10,
              useNativeDriver: true,
            }),
          ]),
          // 2. Content slides up after hero settles
          Animated.parallel([
            Animated.timing(contentFade, {
              toValue: 1,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.timing(actionBarAnim, {
              toValue: 1,
              duration: 280,
              useNativeDriver: true,
            }),
          ]),
        ]).start()
      })
      .catch(() =>
        Alert.alert('Error', 'Failed to load cat profile.', [
          { text: 'Go back', onPress: () => navigation.goBack() },
        ])
      )
      .finally(() => setLoading(false))
  }, [catId])

  const handleDelete = useCallback(() => {
    if (!cat) return
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
              navigation.goBack()
            } catch {
              Alert.alert('Error', 'Failed to delete. Please try again.')
            }
          },
        },
      ]
    )
  }, [cat, navigation])

  if (loading) return <LoadingSkeleton />
  if (!cat) return null

  // Derived display values
  const ageDisplay =
    cat.ageYears != null
      ? `${cat.ageYears} year${cat.ageYears !== 1 ? 's' : ''}${
          cat.ageMonths ? ` ${cat.ageMonths} months` : ''
        }`
      : cat.ageMonths != null
      ? `${cat.ageMonths} month${cat.ageMonths !== 1 ? 's' : ''}`
      : null

  const genderLabel =
    { MALE: 'Male ♂', FEMALE: 'Female ♀', UNKNOWN: 'Unknown' }[cat.gender] ?? cat.gender

  const hasVitals = ageDisplay || cat.weightKg != null || cat.color || cat.breed

  // Parallax: hero image scrolls at 0.4× speed
  const heroTranslate = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [-HERO_HEIGHT * 0.4, 0, HERO_HEIGHT * 0.4],
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Hero (fixed, behind scroll) ── */}
      <Animated.View
        style={[
          styles.heroWrap,
          {
            opacity: heroOpacity,
            transform: [{ scale: heroScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.heroImageWrap,
            { transform: [{ translateY: heroTranslate }] },
          ]}
        >
          {cat.imageUrls.length > 0 ? (
            <Image
              source={{ uri: cat.imageUrls[activeImageIdx] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderEmoji}>🐱</Text>
            </View>
          )}
        </Animated.View>

        {/* Dark gradient overlay at bottom */}
        <View style={styles.heroGradient} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <View style={styles.backBtnInner}>
            <Text style={styles.backBtnText}>← Back</Text>
          </View>
        </TouchableOpacity>

        {/* Hero name + badges */}
        <View style={styles.heroContent}>
          <Text style={styles.heroName}>{cat.name}</Text>
          <View style={styles.heroBadgeRow}>
            <GenderBadge gender={cat.gender} />
            {cat.breed ? (
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{cat.breed}</Text>
              </View>
            ) : null}
            {cat.vaccinations.length > 0 && (
              <View style={[styles.heroBadge, styles.heroBadgeGreen]}>
                <Text style={styles.heroBadgeText}>
                  💉 {cat.vaccinations.length}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable content ── */}
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: HERO_HEIGHT - 20 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Pull-tab notch — gives scrollable feel */}
        <View style={styles.notch}>
          <View style={styles.notchPill} />
        </View>

        <Animated.View
          style={{
            opacity: contentFade,
            transform: [
              {
                translateY: contentFade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          }}
        >
          {/* ── Gallery thumbnails ── */}
          {cat.imageUrls.length > 1 && (
            <SectionCard delay={50}>
              <SectionHeading title="Photos" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.sm }}
              >
                {cat.imageUrls.map((url, idx) => (
                  <GalleryThumb
                    key={idx}
                    uri={url}
                    active={idx === activeImageIdx}
                    onPress={() => setActiveImageIdx(idx)}
                  />
                ))}
              </ScrollView>
            </SectionCard>
          )}

          {/* ── Action bar ── */}
          <Animated.View
            style={[
              styles.actionBar,
              {
                opacity: actionBarAnim,
                transform: [
                  {
                    translateY: actionBarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Button
              label="Edit profile"
              onPress={() => navigation.navigate('CatForm', { mode: 'edit', cat })}
              variant="secondary"
              style={{ flex: 1 } as any}
            />
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Vitals ── */}
          {hasVitals && (
            <SectionCard delay={100}>
              <SectionHeading title="Profile" />
              {ageDisplay ? <InfoRow label="Age" value={ageDisplay} /> : null}
              {cat.weightKg != null ? (
                <InfoRow label="Weight" value={`${cat.weightKg} kg`} />
              ) : null}
              {cat.gender !== 'UNKNOWN' ? (
                <InfoRow label="Gender" value={genderLabel} />
              ) : null}
              {cat.color ? <InfoRow label="Coat colour" value={cat.color} /> : null}
              {cat.breed ? <InfoRow label="Breed" value={cat.breed} /> : null}
            </SectionCard>
          )}

          {/* ── Notes ── */}
          {cat.notes ? (
            <SectionCard delay={180}>
              <SectionHeading title="Notes" />
              <Text style={styles.notesText}>{cat.notes}</Text>
            </SectionCard>
          ) : null}

          {/* ── Vaccinations ── */}
          <SectionCard delay={260}>
            <SectionHeading
              title={
                cat.vaccinations.length > 0
                  ? `Vaccination history (${cat.vaccinations.length})`
                  : 'Vaccination history'
              }
            />

            {cat.vaccinations.length === 0 ? (
              <View style={styles.noVaccinesWrap}>
                <Text style={styles.noVaccinesEmoji}>💉</Text>
                <Text style={styles.noVaccinesTitle}>No vaccinations recorded</Text>
                <Text style={styles.noVaccinesDesc}>
                  Edit this profile to add vaccination records and due dates.
                </Text>
              </View>
            ) : (
              <>
                {/* Status legend */}
                <View style={styles.vaccineLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.greenSage }]} />
                    <Text style={styles.legendText}>Up to date</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.gold }]} />
                    <Text style={styles.legendText}>Due soon</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
                    <Text style={styles.legendText}>Overdue</Text>
                  </View>
                </View>

                {cat.vaccinations.map((v, idx) => (
                  <VaccinationCard key={v.id} vaccination={v} index={idx} />
                ))}
              </>
            )}
          </SectionCard>

          {/* ── Added date footer ── */}
          <Text style={styles.footerDate}>
            Profile created{' '}
            {new Date(cat.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </Animated.View>

        <View style={{ height: Spacing['4xl'] + Spacing['2xl'] }} />
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  // ── Hero ──────────────────────────────────────────
  heroWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    zIndex: 0,
    overflow: 'hidden',
  },
  heroImageWrap: {
    position: 'absolute',
    top: -HERO_HEIGHT * 0.2,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 1.4,
  },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderEmoji: { fontSize: 80 },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.65,
    backgroundColor: 'rgba(26,58,42,0.52)',
  },

  // Back button
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : Spacing['3xl'],
    left: Spacing['2xl'],
  },
  backBtnInner: {
    backgroundColor: 'rgba(26,58,42,0.45)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  backBtnText: {
    fontSize: Typography.base,
    color: Colors.cream,
    fontWeight: '600',
  },

  // Hero name + badges
  heroContent: {
    position: 'absolute',
    bottom: Spacing['2xl'],
    left: Spacing['2xl'],
    right: Spacing['2xl'],
    gap: Spacing.sm,
  },
  heroName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.cream,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  heroBadgeGreen: {
    backgroundColor: 'rgba(74,124,95,0.35)',
    borderColor: 'rgba(74,124,95,0.5)',
  },
  heroBadgeText: {
    fontSize: Typography.sm,
    color: Colors.cream,
    fontWeight: '600',
  },

  // ── Scroll content ────────────────────────────────
  scroll: {
    zIndex: 1,
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.lg,
  },
  notch: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  notchPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.warmWhite,
  },

  // ── Action bar ────────────────────────────────────
  actionBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  deleteBtn: {
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(192,58,43,0.18)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  deleteBtnText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.error,
  },

  // ── Vitals ────────────────────────────────────────
  notesText: {
    fontSize: Typography.base,
    color: Colors.textBody,
    lineHeight: 24,
  },

  // ── Vaccination ───────────────────────────────────
  noVaccinesWrap: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.sm,
  },
  noVaccinesEmoji: { fontSize: 40 },
  noVaccinesTitle: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  noVaccinesDesc: {
    fontSize: Typography.sm,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  vaccineLegend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // ── Footer ────────────────────────────────────────
  footerDate: {
    fontSize: Typography.xs,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
})