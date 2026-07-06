import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native'
import { emergencyGuideAPI, type EmergencyGuide, type Urgency } from '../../api/emergencyGuideAPI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

const URGENCY_STYLE: Record<Urgency, { bg: string; color: string; label: string }> = {
  CRITICAL: { bg: '#922b21', color: '#fce8e6', label: 'Critical emergency' },
  URGENT: { bg: '#8b6340', color: '#fdf7ed', label: 'Urgent — seek care soon' },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.wrap}>
      <View style={sectionStyles.headingRow}>
        <Text style={sectionStyles.heading}>{title}</Text>
        <View style={sectionStyles.line} />
      </View>
      {children}
    </View>
  )
}

const sectionStyles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  heading: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, textTransform: 'uppercase' },
  line: { flex: 1, height: 1, backgroundColor: Colors.warmWhite },
})

export function EmergencyGuideDetailScreen({ navigation, route }: any) {
  const { guideId } = route.params as { guideId: string }
  const [guide, setGuide] = useState<EmergencyGuide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    emergencyGuideAPI
      .getById(guideId)
      .then(setGuide)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load guide'))
      .finally(() => setLoading(false))
  }, [guideId])

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color={Colors.greenSage} />
      </View>
    )
  }

  if (error || !guide) {
    return (
      <View style={styles.centred}>
        <Text style={styles.errorText}>{error || 'Guide not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const urgencyStyle = URGENCY_STYLE[guide.urgency]

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={urgencyStyle.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: urgencyStyle.bg }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.urgencyPill}>
            <Text style={[styles.urgencyPillText, { color: urgencyStyle.color }]}>{urgencyStyle.label}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: urgencyStyle.color }]}>{guide.title}</Text>
          <Text style={[styles.heroSummary, { color: urgencyStyle.color }]}>{guide.summary}</Text>
        </View>

        <View style={styles.content}>
          {guide.emergencySymptoms.length > 0 && (
            <Section title="Emergency symptoms to watch for">
              {guide.emergencySymptoms.map((s, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}
            </Section>
          )}

          {guide.firstAidSteps.length > 0 && (
            <Section title="First-aid steps">
              {guide.firstAidSteps.map((s, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              ))}
            </Section>
          )}

          {guide.doNots.length > 0 && (
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Text style={styles.warningIcon}>⚠</Text>
                <Text style={styles.warningTitle}>Do NOT</Text>
              </View>
              {guide.doNots.map((s, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: '#c0392b' }]} />
                  <Text style={[styles.bulletText, { color: '#922b21' }]}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.vetCallCard}>
            <Text style={styles.vetCallLabel}>When to seek veterinary care</Text>
            <Text style={styles.vetCallText}>{guide.whenToSeekVet}</Text>
          </View>

          <View style={{ height: Spacing['4xl'] }} />
        </View>
      </ScrollView>
    </View>
  )
}

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
  backLinkText: { fontSize: Typography.base, color: Colors.greenForest, fontWeight: '600' },

  hero: { padding: Spacing['2xl'], paddingTop: Spacing['3xl'], gap: Spacing.sm },
  backBtn: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  backBtnText: { fontSize: Typography.base, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  urgencyPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  urgencyPillText: { fontSize: Typography.xs, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginTop: Spacing.sm },
  heroSummary: { fontSize: Typography.base, lineHeight: 22, opacity: 0.9 },

  content: { padding: Spacing['2xl'] },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold, marginTop: 8, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: Typography.base, color: Colors.textBody, lineHeight: 22 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: { fontSize: Typography.xs, fontWeight: '700', color: Colors.cream },
  stepText: { flex: 1, fontSize: Typography.base, color: Colors.textBody, lineHeight: 22 },

  warningCard: {
    backgroundColor: '#fdf0ee',
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1.5,
    borderColor: 'rgba(192,57,43,0.2)',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  warningIcon: { fontSize: 16, color: '#c0392b' },
  warningTitle: { fontSize: Typography.xs, fontWeight: '700', color: '#c0392b', letterSpacing: 0.6, textTransform: 'uppercase' },

  vetCallCard: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(74,124,95,0.2)',
  },
  vetCallLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.greenForest, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  vetCallText: { fontSize: Typography.base, color: Colors.greenDeep, lineHeight: 22 },
})