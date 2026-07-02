import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { catProfileAPI, type CatProfile } from '../../api/catProfileAPI'
import {
  symptomDiagnosisAPI,
  type DiagnosisResult,
  type RiskLevel,
} from '../../api/symptomDiagnosisAPI'
import { Button, Field } from '../../components/UI'
import { TextInput } from '../../components/TextInput'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

type Stage = 'form' | 'loading' | 'result'

const COMMON_SYMPTOMS = [
  'Vomiting', 'Diarrhoea', 'Lethargy', 'Loss of appetite', 'Coughing',
  'Sneezing', 'Fever', 'Limping', 'Itching', 'Hair loss',
  'Straining to urinate', 'Increased thirst', 'Nasal discharge',
  'Ocular discharge', 'Weight loss', 'Bad breath',
]

const RISK_STYLE: Record<RiskLevel, { bg: string; color: string; label: string }> = {
  LOW: { bg: '#edf7f1', color: '#2d7a4f', label: 'Low risk' },
  MEDIUM: { bg: '#fdf7ed', color: '#8b6340', label: 'Medium risk' },
  HIGH: { bg: '#fdf0ee', color: '#c0392b', label: 'High risk' },
  CRITICAL: { bg: '#fce8e6', color: '#922b21', label: 'Critical risk' },
}

// ── Symptom chip ───────────────────────────────────────────────────────────────
function SymptomChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[chipStyles.chip, selected && chipStyles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[chipStyles.text, selected && chipStyles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  )
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    backgroundColor: Colors.ivory,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipSelected: { borderColor: Colors.greenSage, backgroundColor: Colors.greenPale },
  text: { fontSize: Typography.sm, fontWeight: '500', color: Colors.textBody },
  textSelected: { color: Colors.greenForest, fontWeight: '700' },
})

// ── Section card ───────────────────────────────────────────────────────────────
function FormCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(16)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 11, delay, useNativeDriver: true }),
    ]).start()
  }, [])
  return (
    <Animated.View style={[cardStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  )
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
})

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={headingStyles.wrap}>
      <Text style={headingStyles.text}>{title}</Text>
      <View style={headingStyles.line} />
    </View>
  )
}

const headingStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  text: {
    fontSize: Typography.xs, fontWeight: '700', color: Colors.textLight,
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.warmWhite },
})

// ── Result: likelihood bar ────────────────────────────────────────────────────
function LikelihoodBar({ value }: { value: number }) {
  const widthAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: value, duration: 700, useNativeDriver: false }).start()
  }, [value])
  return (
    <View style={barStyles.track}>
      <Animated.View
        style={[
          barStyles.fill,
          { width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  )
}

const barStyles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: Colors.warmWhite, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: Colors.greenSage, borderRadius: 3 },
})

// ── Main screen ────────────────────────────────────────────────────────────────
export function SymptomCheckerScreen({ navigation }: any) {
  const [stage, setStage] = useState<Stage>('form')

  // Form state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [otherSymptoms, setOtherSymptoms] = useState('')
  const [behaviorChanges, setBehaviorChanges] = useState('')
  const [imageUris, setImageUris] = useState<string[]>([])
  const [cats, setCats] = useState<CatProfile[]>([])
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const pulseAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    catProfileAPI.list().then(setCats).catch(() => {})
  }, [])

  useEffect(() => {
    if (stage !== 'loading') return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [stage])

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]))
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'PawSense needs access to your photos to attach an image of the affected area.')
      return
    }
    const remaining = 3 - imageUris.length
    if (remaining <= 0) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    })
    if (result.canceled) return
    setImageUris(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 3))
  }

  function removeImage(idx: number) {
    setImageUris(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    const freeText = otherSymptoms.trim() ? [otherSymptoms.trim()] : []
    const allSymptoms = [...selectedSymptoms, ...freeText]

    if (allSymptoms.length === 0 && !behaviorChanges.trim()) {
      setError('Please select at least one symptom, or describe a behavior change.')
      return
    }
    setError('')

    const selectedCat = cats.find(c => c.id === selectedCatId)
    const catContext = selectedCat
      ? {
          breed: selectedCat.breed ?? undefined,
          gender: selectedCat.gender,
          ageYears: selectedCat.ageYears ?? undefined,
          ageMonths: selectedCat.ageMonths ?? undefined,
        }
      : undefined

    setStage('loading')
    try {
      const res = await symptomDiagnosisAPI.analyze(allSymptoms, behaviorChanges, imageUris, catContext)
      setResult(res)
      setStage('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze symptoms')
      setStage('form')
    }
  }

  function reset() {
    setSelectedSymptoms([])
    setOtherSymptoms('')
    setBehaviorChanges('')
    setImageUris([])
    setSelectedCatId(null)
    setResult(null)
    setError('')
    setStage('form')
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Symptom Checker</Text>
        <Text style={styles.headerSubtitle}>
          Describe what you're noticing and get an AI-assisted risk assessment
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Form stage ── */}
        {stage === 'form' && (
          <>
            <FormCard delay={40}>
              <SectionHeading title="Symptoms" />
              <View style={styles.chipsWrap}>
                {COMMON_SYMPTOMS.map(s => (
                  <SymptomChip key={s} label={s} selected={selectedSymptoms.includes(s)} onPress={() => toggleSymptom(s)} />
                ))}
              </View>
              <Field label="Other symptoms" optional>
                <TextInput
                  value={otherSymptoms}
                  onChangeText={setOtherSymptoms}
                  placeholder="Anything not listed above…"
                />
              </Field>
            </FormCard>

            <FormCard delay={100}>
              <SectionHeading title="Behavior changes" />
              <Field label="What's different lately?" optional>
                <TextInput
                  value={behaviorChanges}
                  onChangeText={setBehaviorChanges}
                  placeholder="e.g. hiding more, not playing, sleeping in unusual places…"
                  multiline
                  numberOfLines={4}
                  style={{ height: 90, textAlignVertical: 'top', paddingTop: Spacing.md }}
                />
              </Field>
            </FormCard>

            {cats.length > 0 && (
              <FormCard delay={160}>
                <SectionHeading title="Which cat? (optional)" />
                <View style={styles.chipsWrap}>
                  <SymptomChip label="Not specified" selected={selectedCatId === null} onPress={() => setSelectedCatId(null)} />
                  {cats.map(c => (
                    <SymptomChip key={c.id} label={c.name} selected={selectedCatId === c.id} onPress={() => setSelectedCatId(c.id)} />
                  ))}
                </View>
              </FormCard>
            )}

            <FormCard delay={220}>
              <SectionHeading title={`Photos ${imageUris.length > 0 ? `(${imageUris.length}/3)` : '(optional)'}`} />
              {imageUris.length > 0 && (
                <View style={styles.photoRow}>
                  {imageUris.map((uri, idx) => (
                    <View key={idx} style={styles.photoThumb}>
                      <Image source={{ uri }} style={styles.photoImg} />
                      <TouchableOpacity style={styles.photoRemove} onPress={() => removeImage(idx)}>
                        <Text style={styles.photoRemoveText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {imageUris.length < 3 && (
                <TouchableOpacity style={styles.uploadZone} onPress={pickImage} activeOpacity={0.8}>
                  <Text style={styles.uploadZoneIcon}>📷</Text>
                  <Text style={styles.uploadZoneLabel}>Add a photo of the affected area</Text>
                  <Text style={styles.uploadZoneHint}>Up to {3 - imageUris.length} more</Text>
                </TouchableOpacity>
              )}
            </FormCard>

            <Button label="Analyze symptoms" onPress={handleSubmit} style={{ marginTop: Spacing.sm } as any} />

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This tool provides an educational estimate only and is not a diagnosis. Always consult a licensed veterinarian for medical concerns.
              </Text>
            </View>
          </>
        )}

        {/* ── Loading stage ── */}
        {stage === 'loading' && (
          <Animated.View style={[styles.loadingCard, { opacity: pulseAnim }]}>
            <Text style={styles.loadingIcon}>🩺</Text>
            <Text style={styles.loadingTitle}>Analyzing symptoms…</Text>
            <Text style={styles.loadingHint}>Cross-checking against the veterinary knowledge base</Text>
          </Animated.View>
        )}

        {/* ── Result stage ── */}
        {stage === 'result' && result && (
          <>
            <View style={[styles.riskBanner, { backgroundColor: RISK_STYLE[result.riskLevel].bg }]}>
              <Text style={[styles.riskLabel, { color: RISK_STYLE[result.riskLevel].color }]}>
                {RISK_STYLE[result.riskLevel].label}
              </Text>
            </View>

            {result.urgentWarning && (
              <View style={styles.urgentBanner}>
                <Text style={styles.urgentIcon}>⚠</Text>
                <Text style={styles.urgentText}>{result.urgentWarning}</Text>
              </View>
            )}

            <FormCard delay={40}>
              <SectionHeading title={`Possible conditions (${result.possibleDiseases.length})`} />
              {result.possibleDiseases.map((pd, i) => (
                <View key={i} style={styles.diseaseRow}>
                  <View style={styles.diseaseTopRow}>
                    <Text style={styles.diseaseName}>{pd.name}</Text>
                    <Text style={styles.diseaseLikelihood}>{pd.likelihood}%</Text>
                  </View>
                  <LikelihoodBar value={pd.likelihood} />
                  <Text style={styles.diseaseReasoning}>{pd.reasoning}</Text>
                  {pd.matched && (
                    <View style={styles.matchedPill}>
                      <Text style={styles.matchedPillText}>
                        ✓ In library · {pd.matched.severity} severity
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </FormCard>

            <FormCard delay={100}>
              <SectionHeading title="Suggested actions" />
              <View style={{ gap: Spacing.sm }}>
                {result.suggestedActions.map((action, i) => (
                  <View key={i} style={styles.actionRow}>
                    <View style={styles.actionDot} />
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>
            </FormCard>

            {result.recommendedMedicines.length > 0 && (
              <FormCard delay={160}>
                <SectionHeading title="Medicines a vet may consider" />
                {result.recommendedMedicines.map((m, i) => (
                  <View key={i} style={styles.medRow}>
                    <Text style={styles.medName}>{m.name}</Text>
                    {m.matched ? (
                      <View style={styles.matchedPillSmall}>
                        <Text style={styles.matchedPillSmallText}>In library</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </FormCard>
            )}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This is an AI-generated estimate for educational purposes only — never administer medication without a licensed veterinarian's guidance.
              </Text>
            </View>

            <Button label="Check different symptoms" onPress={reset} style={{ marginTop: Spacing.md } as any} />
          </>
        )}

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    gap: 4,
  },
  backBtn: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  backBtnText: { fontSize: Typography.base, color: 'rgba(245,240,232,0.70)', fontWeight: '500' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: Colors.cream, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(245,240,232,0.62)', lineHeight: 20 },

  scroll: { padding: Spacing['2xl'] },

  errorBanner: {
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(192,58,43,0.18)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  errorText: { color: Colors.error, fontSize: Typography.base },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },

  // Photos
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  photoThumb: { width: 76, height: 76, borderRadius: Radius.md, overflow: 'hidden', position: 'relative' },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(26,58,42,0.80)', alignItems: 'center', justifyContent: 'center',
  },
  photoRemoveText: { color: Colors.white, fontSize: 14, lineHeight: 16, fontWeight: '700' },
  uploadZone: {
    borderWidth: 1.5, borderColor: Colors.warmWhite, borderStyle: 'dashed', borderRadius: Radius.lg,
    paddingVertical: Spacing.xl, alignItems: 'center', gap: 4, backgroundColor: Colors.ivory,
  },
  uploadZoneIcon: { fontSize: 24 },
  uploadZoneLabel: { fontSize: Typography.base, fontWeight: '600', color: Colors.textBody },
  uploadZoneHint: { fontSize: Typography.sm, color: Colors.textLight },

  // Disclaimer
  disclaimer: {
    backgroundColor: Colors.ivory, borderRadius: Radius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.warmWhite, marginTop: Spacing.lg,
  },
  disclaimerText: { fontSize: Typography.xs, color: Colors.textLight, lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },

  // Loading
  loadingCard: {
    alignItems: 'center', paddingVertical: Spacing['4xl'], gap: Spacing.sm,
  },
  loadingIcon: { fontSize: 56 },
  loadingTitle: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary },
  loadingHint: { fontSize: Typography.sm, color: Colors.textLight, fontStyle: 'italic' },

  // Result
  riskBanner: { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center', marginBottom: Spacing.lg },
  riskLabel: { fontSize: Typography.lg, fontWeight: '800', letterSpacing: 0.3 },

  urgentBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: '#fdf0ee', borderWidth: 1.5, borderColor: 'rgba(192,57,43,0.25)',
    borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  urgentIcon: { fontSize: 18, color: '#c0392b' },
  urgentText: { flex: 1, fontSize: Typography.base, color: '#922b21', fontWeight: '600', lineHeight: 21 },

  diseaseRow: { marginBottom: Spacing.lg, gap: 6 },
  diseaseTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diseaseName: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  diseaseLikelihood: { fontSize: Typography.sm, fontWeight: '700', color: Colors.greenForest },
  diseaseReasoning: { fontSize: Typography.sm, color: Colors.textMuted, lineHeight: 19 },
  matchedPill: {
    alignSelf: 'flex-start', backgroundColor: Colors.greenPale, paddingHorizontal: Spacing.sm,
    paddingVertical: 3, borderRadius: Radius.full, marginTop: 2,
  },
  matchedPillText: { fontSize: Typography.xs, color: Colors.greenForest, fontWeight: '700' },

  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  actionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold, marginTop: 8, flexShrink: 0 },
  actionText: { flex: 1, fontSize: Typography.base, color: Colors.textBody, lineHeight: 22 },

  medRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: Colors.ivory,
  },
  medName: { fontSize: Typography.base, color: Colors.textPrimary, fontWeight: '500', flex: 1 },
  matchedPillSmall: { backgroundColor: Colors.greenPale, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
  matchedPillSmallText: { fontSize: Typography.xs, color: Colors.greenForest, fontWeight: '700' },
})