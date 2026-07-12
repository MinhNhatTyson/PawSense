import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { medicineAPI, type Medicine } from '../../api/medicineAPI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'
import { SkeletonBlock, FadeSlideIn } from '../../components/Motion'

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={sectionStyles.header}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.line} />
    </View>
  )
}

const sectionStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.warmWhite },
})

function InfoCard({ children }: { children: React.ReactNode }) {
  return <View style={infoCardStyles.card}>{children}</View>
}

const infoCardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
})

function BulletItem({ text, danger = false }: { text: string; danger?: boolean }) {
  return (
    <View style={bulletStyles.row}>
      <View style={[bulletStyles.dot, danger && bulletStyles.dotDanger]} />
      <Text style={[bulletStyles.text, danger && bulletStyles.textDanger]}>{text}</Text>
    </View>
  )
}

const bulletStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.greenSage,
    marginTop: 7,
    flexShrink: 0,
  },
  dotDanger: { backgroundColor: '#c0392b' },
  text: {
    fontSize: Typography.base,
    color: Colors.textBody,
    lineHeight: 22,
    flex: 1,
  },
  textDanger: { color: '#922b21' },
})

const SEV_STYLE: Record<string, { bg: string; color: string }> = {
  LOW:      { bg: '#edf7f1', color: '#2d7a4f' },
  MEDIUM:   { bg: '#fdf7ed', color: '#8b6340' },
  HIGH:     { bg: '#fdf0ee', color: '#c0392b' },
  CRITICAL: { bg: '#fce8e6', color: '#922b21' },
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function MedicineDetailScreen({ navigation, route }: any) {
  const { medicineId } = route.params as { medicineId: string }
  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    medicineAPI
      .getById(medicineId)
      .then(setMedicine)
      .catch(err =>
        setError(err instanceof Error ? err.message : 'Failed to load medicine')
      )
      .finally(() => setLoading(false))
  }, [medicineId])

  if (loading) {
    return (
      <View style={styles.root}>
        <View style={[styles.hero, { backgroundColor: Colors.greenPale }]}>
          <SkeletonBlock width="100%" height={220} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
        </View>
        <View style={styles.content}>
          <SkeletonBlock width="60%" height={22} style={{ marginBottom: Spacing.md }} />
          <SkeletonBlock width="100%" height={80} style={{ marginBottom: Spacing.lg, borderRadius: Radius.xl }} />
          <SkeletonBlock width="100%" height={60} style={{ borderRadius: Radius.xl }} />
        </View>
      </View>
    )
  }

  if (error || !medicine) {
    return (
      <View style={styles.centred}>
        <Text style={styles.errorText}>{error || 'Medicine not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const linkedDiseases = medicine.diseaseMedicines ?? []

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          {medicine.imageUrl ? (
            <Image source={{ uri: medicine.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderIcon}>💊</Text>
            </View>
          )}
          <View style={styles.heroOverlay}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.heroContent}>
              <Text style={styles.heroName}>{medicine.name}</Text>
              {medicine.manufacturer ? (
                <Text style={styles.heroManufacturer}>{medicine.manufacturer}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Top disclaimer banner */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerIcon}>⚕</Text>
          <Text style={styles.disclaimerText}>
            This information is for reference only. Never administer any medication to your pet without consulting a licensed veterinarian.
          </Text>
        </View>

        <View style={styles.content}>

          {/* Description */}
          <FadeSlideIn delay={40}>
            <InfoCard>
              <SectionHeader title="About this medicine" />
              <Text style={styles.bodyText}>{medicine.description}</Text>
            </InfoCard>
          </FadeSlideIn>

          {/* Dosage */}
          <FadeSlideIn delay={90}>
            <InfoCard>
              <SectionHeader title="Dosage" />
              <View style={styles.dosageBox}>
                <Text style={styles.dosageIcon}>📋</Text>
                <Text style={styles.dosageText}>{medicine.dosage}</Text>
              </View>
            </InfoCard>
          </FadeSlideIn>

          {/* Usage instructions */}
          <FadeSlideIn delay={140}>
            <InfoCard>
              <SectionHeader title="How to use" />
              <Text style={styles.bodyText}>{medicine.usageInstructions}</Text>
            </InfoCard>
          </FadeSlideIn>

          {/* Side effects */}
          {medicine.sideEffects.length > 0 && (
            <FadeSlideIn delay={190}>
              <InfoCard>
                <SectionHeader title={`Side effects (${medicine.sideEffects.length})`} />
                <View style={styles.bulletList}>
                  {medicine.sideEffects.map((effect, i) => (
                    <BulletItem key={i} text={effect} />
                  ))}
                </View>
              </InfoCard>
            </FadeSlideIn>
          )}

          {/* Warnings — distinct red card */}
          {medicine.warnings.length > 0 && (
            <FadeSlideIn delay={240}>
              <View style={styles.warningCard}>
                <View style={styles.warningCardHeader}>
                  <Text style={styles.warningCardIcon}>⚠</Text>
                  <Text style={styles.warningCardTitle}>
                    Warnings & Contraindications
                  </Text>
                </View>
                <View style={styles.bulletList}>
                  {medicine.warnings.map((warn, i) => (
                    <BulletItem key={i} text={warn} danger />
                  ))}
                </View>
              </View>
            </FadeSlideIn>
          )}

          {/* Linked diseases */}
          {linkedDiseases.length > 0 && (
            <FadeSlideIn delay={290}>
              <InfoCard>
                <SectionHeader title={`Used for (${linkedDiseases.length})`} />
                <View style={styles.diseaseList}>
                  {linkedDiseases.map(dm => {
                    const s = SEV_STYLE[dm.disease.severity] ?? SEV_STYLE.MEDIUM
                    return (
                      <View key={dm.id} style={styles.diseaseRow}>
                        <Text style={styles.diseaseName}>{dm.disease.name}</Text>
                        <View style={[styles.sevBadge, { backgroundColor: s.bg }]}>
                          <Text style={[styles.sevBadgeText, { color: s.color }]}>
                            {dm.disease.severity}
                          </Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </InfoCard>
            </FadeSlideIn>
          )}

          {/* Footer note */}
          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              PawSense medicine information is sourced from veterinary references and is intended for educational purposes only. Always seek professional veterinary advice for your pet's health.
            </Text>
          </View>

          <View style={{ height: Spacing['4xl'] }} />
        </View>
      </ScrollView>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  centred: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing['2xl'],
  },
  errorText: { fontSize: Typography.base, color: Colors.error, textAlign: 'center' },
  backLink: { padding: Spacing.md },
  backLinkText: {
    fontSize: Typography.base,
    color: Colors.greenForest,
    fontWeight: '600',
  },

  // Hero
  hero: { height: 220, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderIcon: { fontSize: 72 },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    padding: Spacing['2xl'],
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26,58,42,0.45)',
  },
  backBtn: { alignSelf: 'flex-start' },
  backBtnText: {
    fontSize: Typography.base,
    color: Colors.cream,
    fontWeight: '500',
  },
  heroContent: { gap: 4 },
  heroName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  heroManufacturer: {
    fontSize: Typography.sm,
    color: 'rgba(245,240,232,0.75)',
    fontStyle: 'italic',
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
  disclaimerIcon: { fontSize: 15, lineHeight: 21, flexShrink: 0 },
  disclaimerText: {
    fontSize: Typography.sm,
    color: '#7a5a2a',
    lineHeight: 19,
    flex: 1,
    fontWeight: '500',
  },

  // Content
  content: { padding: Spacing['2xl'], gap: 0 },

  bodyText: {
    fontSize: Typography.base,
    color: Colors.textBody,
    lineHeight: 23,
  },

  // Dosage
  dosageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(74,124,95,0.2)',
  },
  dosageIcon: { fontSize: 20, flexShrink: 0 },
  dosageText: {
    fontSize: Typography.base,
    color: Colors.greenDeep,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },

  bulletList: { gap: Spacing.sm },

  // Warning card
  warningCard: {
    backgroundColor: '#fdf0ee',
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1.5,
    borderColor: 'rgba(192,57,43,0.2)',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  warningCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  warningCardIcon: { fontSize: 18, color: '#c0392b' },
  warningCardTitle: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: '#c0392b',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Disease list
  diseaseList: { gap: 0 },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ivory,
  },
  diseaseName: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.md,
  },
  sevBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    flexShrink: 0,
  },
  sevBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Footer note
  footerNote: {
    backgroundColor: Colors.ivory,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    marginBottom: Spacing.lg,
  },
  footerNoteText: {
    fontSize: Typography.xs,
    color: Colors.textLight,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})