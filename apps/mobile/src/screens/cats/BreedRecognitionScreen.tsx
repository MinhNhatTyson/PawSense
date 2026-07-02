import React, { useState, useRef } from 'react'
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
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { breedRecognitionAPI, type BreedRecognitionResult } from '../../api/breedRecognitionAPI'
import { Button } from '../../components/UI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

type Stage = 'pick' | 'preview' | 'loading' | 'result'

function ConfidenceRing({ value }: { value: number }) {
  const color = value >= 70 ? Colors.success : value >= 40 ? Colors.gold : Colors.error
  return (
    <View style={[ringStyles.wrap, { borderColor: color }]}>
      <Text style={[ringStyles.value, { color }]}>{value}%</Text>
      <Text style={ringStyles.label}>match</Text>
    </View>
  )
}

const ringStyles = StyleSheet.create({
  wrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  value: { fontSize: Typography.lg, fontWeight: '800' },
  label: { fontSize: 9, color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
})

function TagList({ items, tone = 'green' }: { items: string[]; tone?: 'green' | 'gold' }) {
  return (
    <View style={tagStyles.wrap}>
      {items.map((item, i) => (
        <View
          key={i}
          style={[
            tagStyles.tag,
            tone === 'gold' && { backgroundColor: 'rgba(196,149,106,0.15)', borderColor: 'rgba(196,149,106,0.3)' },
          ]}
        >
          <Text style={[tagStyles.tagText, tone === 'gold' && { color: '#8a6238' }]}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

const tagStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.greenPale,
    borderWidth: 1,
    borderColor: 'rgba(74,124,95,0.2)',
  },
  tagText: { fontSize: Typography.sm, color: Colors.greenForest, fontWeight: '600' },
})

function ResultSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={secStyles.wrap}>
      <View style={secStyles.headingRow}>
        <Text style={secStyles.heading}>{title}</Text>
        <View style={secStyles.line} />
      </View>
      {children}
    </View>
  )
}

const secStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  heading: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.warmWhite },
})

export function BreedRecognitionScreen({ navigation }: any) {
  const [stage, setStage] = useState<Stage>('pick')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [result, setResult] = useState<BreedRecognitionResult | null>(null)
  const [error, setError] = useState('')
  const pulseAnim = useRef(new Animated.Value(0.4)).current

  React.useEffect(() => {
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

  async function pickImage(fromCamera: boolean) {
    setError('')
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'PawSense needs access to your camera/photos to identify a breed.')
      return
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, allowsEditing: true, aspect: [1, 1] })

    if (result.canceled) return
    setImageUri(result.assets[0]!.uri)
    setStage('preview')
  }

  async function handleAnalyze() {
    if (!imageUri) return
    setStage('loading')
    setError('')
    try {
      const res = await breedRecognitionAPI.analyze(imageUri)
      setResult(res)
      setStage('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image')
      setStage('preview')
    }
  }

  function reset() {
    setImageUri(null)
    setResult(null)
    setError('')
    setStage('pick')
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Breed Identifier</Text>
        <Text style={styles.headerSubtitle}>Snap or upload a photo — AI will identify the likely breed</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Pick stage ── */}
        {stage === 'pick' && (
          <View style={styles.pickCard}>
            <Text style={styles.pickIcon}>🐾</Text>
            <Text style={styles.pickTitle}>Identify your cat's breed</Text>
            <Text style={styles.pickDesc}>
              Take a clear, well-lit photo of your cat's face and body for the most accurate result.
            </Text>
            <Button label="📷 Take a photo" onPress={() => pickImage(true)} style={{ marginTop: Spacing.xl } as any} />
            <Button label="🖼 Choose from library" onPress={() => pickImage(false)} variant="secondary" style={{ marginTop: Spacing.md } as any} />
          </View>
        )}

        {/* ── Preview / loading stage ── */}
        {(stage === 'preview' || stage === 'loading') && imageUri && (
          <View>
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              {stage === 'loading' && (
                <Animated.View style={[styles.scanOverlay, { opacity: pulseAnim }]}>
                  <Text style={styles.scanText}>Analyzing…</Text>
                </Animated.View>
              )}
            </View>

            {stage === 'preview' ? (
              <>
                <Button label="✨ Identify breed" onPress={handleAnalyze} style={{ marginTop: Spacing.xl } as any} />
                <Button label="Choose a different photo" onPress={reset} variant="secondary" style={{ marginTop: Spacing.md } as any} />
              </>
            ) : (
              <Text style={styles.loadingHint}>This usually takes a few seconds…</Text>
            )}
          </View>
        )}

        {/* ── Result stage ── */}
        {stage === 'result' && result && imageUri && (
          <View>
            <View style={styles.resultHero}>
              <Image source={{ uri: imageUri }} style={styles.resultImage} />
              <View style={styles.resultHeroBody}>
                <Text style={styles.resultBreedName}>{result.breedName}</Text>
                {result.isMixedOrUnclear && (
                  <Text style={styles.resultMixedNote}>Likely a mixed breed / domestic cat</Text>
                )}
              </View>
              <ConfidenceRing value={result.confidence} />
            </View>

            {result.matchedBreed && (
              <View style={styles.matchedBanner}>
                <Text style={styles.matchedBannerText}>
                  ✓ Matches "{result.matchedBreed.name}" in the PawSense breed library ({result.matchedBreed.origin})
                </Text>
              </View>
            )}

            <ResultSection title="About this breed">
              <Text style={styles.bodyText}>{result.description}</Text>
            </ResultSection>

            {result.characteristics.length > 0 && (
              <ResultSection title="Physical characteristics">
                <TagList items={result.characteristics} />
              </ResultSection>
            )}

            {result.temperament.length > 0 && (
              <ResultSection title="Temperament">
                <TagList items={result.temperament} tone="gold" />
              </ResultSection>
            )}

            {result.careInstructions.length > 0 && (
              <ResultSection title="Care instructions">
                <View style={{ gap: Spacing.sm }}>
                  {result.careInstructions.map((tip, i) => (
                    <View key={i} style={styles.careRow}>
                      <View style={styles.careDot} />
                      <Text style={styles.careText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </ResultSection>
            )}

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                AI breed identification is an estimate based on visual traits and is not a substitute for genetic
                testing or veterinary assessment.
              </Text>
            </View>

            <Button label="Scan another photo" onPress={reset} style={{ marginTop: Spacing.md } as any} />
          </View>
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

  // Pick stage
  pickCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    padding: Spacing['2xl'],
    alignItems: 'center',
    ...Shadow.sm,
  },
  pickIcon: { fontSize: 56, marginBottom: Spacing.md },
  pickTitle: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  pickDesc: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },

  // Preview stage
  previewWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.greenPale,
  },
  previewImage: { width: '100%', height: '100%' },
  scanOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(26,58,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: { color: Colors.cream, fontSize: Typography.lg, fontWeight: '700' },
  loadingHint: { textAlign: 'center', color: Colors.textLight, fontSize: Typography.sm, marginTop: Spacing.lg, fontStyle: 'italic' },

  // Result stage
  resultHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  resultImage: { width: 72, height: 72, borderRadius: Radius.md },
  resultHeroBody: { flex: 1 },
  resultBreedName: { fontSize: Typography.xl, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.4 },
  resultMixedNote: { fontSize: Typography.sm, color: Colors.textLight, fontStyle: 'italic', marginTop: 2 },

  matchedBanner: {
    backgroundColor: Colors.greenPale,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(74,124,95,0.2)',
  },
  matchedBannerText: { fontSize: Typography.sm, color: Colors.greenForest, fontWeight: '600' },

  bodyText: { fontSize: Typography.base, color: Colors.textBody, lineHeight: 23 },

  careRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  careDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold, marginTop: 8, flexShrink: 0 },
  careText: { fontSize: Typography.base, color: Colors.textBody, lineHeight: 22, flex: 1 },

  disclaimer: {
    backgroundColor: Colors.ivory,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
  },
  disclaimerText: { fontSize: Typography.xs, color: Colors.textLight, lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },
})