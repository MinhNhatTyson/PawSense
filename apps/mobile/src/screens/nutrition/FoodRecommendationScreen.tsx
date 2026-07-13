import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { catProfileAPI, type CatProfile } from '../../api/catProfileAPI'
import { catBreedAPI, type CatBreedSummary } from '../../api/catBreedAPI'
import { diseaseAPI, type DiseaseSummary } from '../../api/diseaseAPI'
import {
  foodRecommendationAPI,
  type FoodRecommendationResult,
  type FoodCategory,
} from '../../api/foodRecommendationAPI'
import { Button, Field } from '../../components/UI'
import { TextInput } from '../../components/TextInput'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'
import { PressableScale, EmptyState } from '../../components/Motion'

type Source = 'cat' | 'manual'
type Stage = 'form' | 'loading' | 'result'

const CATEGORY_STYLE: Record<FoodCategory, { bg: string; color: string; label: string }> = {
  KITTEN: { bg: '#fdf7ed', color: '#8b6340', label: 'Kitten' },
  ADULT: { bg: '#edf7f1', color: '#2d7a4f', label: 'Adult' },
  SENIOR: { bg: '#e0f2fe', color: '#0369a1', label: 'Senior' },
  PRESCRIPTION: { bg: '#fdf0ee', color: '#c0392b', label: 'Prescription' },
}

// ── Shared bits ────────────────────────────────────────────────────────────────

function SourceTabs({ source, onChange }: { source: Source; onChange: (s: Source) => void }) {
  return (
    <View style={tabStyles.wrap}>
      <PressableScale onPress={() => onChange('cat')} scaleTo={0.96} style={[tabStyles.tab, source === 'cat' && tabStyles.tabActive] as any}>
        <Text style={[tabStyles.tabText, source === 'cat' && tabStyles.tabTextActive]}>🐱 My cats</Text>
      </PressableScale>
      <PressableScale onPress={() => onChange('manual')} scaleTo={0.96} style={[tabStyles.tab, source === 'manual' && tabStyles.tabActive] as any}>
        <Text style={[tabStyles.tabText, source === 'manual' && tabStyles.tabTextActive]}>✎ Manual entry</Text>
      </PressableScale>
    </View>
  )
}

const tabStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.ivory,
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
  },
  tab: { flex: 1, paddingVertical: Spacing.sm + 2, alignItems: 'center', borderRadius: Radius.full },
  tabActive: { backgroundColor: Colors.greenDeep, ...Shadow.sm },
  tabText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: Colors.cream },
})

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.93} style={[chipStyles.chip, selected && chipStyles.chipSelected] as any}>
      <Text style={[chipStyles.text, selected && chipStyles.textSelected]}>{label}</Text>
    </PressableScale>
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
  text: { fontSize: Typography.xs, fontWeight: '700', color: Colors.textLight, letterSpacing: 0.8, textTransform: 'uppercase' },
  line: { flex: 1, height: 1, backgroundColor: Colors.warmWhite },
})

function TagList({ items, tone = 'green' }: { items: string[]; tone?: 'green' | 'red' | 'gold' }) {
  return (
    <View style={tagStyles.wrap}>
      {items.map((item, i) => (
        <View key={i} style={[tagStyles.tag, tone === 'red' && tagStyles.tagRed, tone === 'gold' && tagStyles.tagGold]}>
          <Text style={[tagStyles.tagText, tone === 'red' && tagStyles.tagTextRed, tone === 'gold' && tagStyles.tagTextGold]}>
            {item}
          </Text>
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
  tagRed: { backgroundColor: '#fdf0ee', borderColor: 'rgba(192,57,43,0.2)' },
  tagGold: { backgroundColor: 'rgba(196,149,106,0.15)', borderColor: 'rgba(196,149,106,0.3)' },
  tagText: { fontSize: Typography.sm, color: Colors.greenForest, fontWeight: '600' },
  tagTextRed: { color: '#922b21' },
  tagTextGold: { color: '#8a6238' },
})

// ── Matched food card ──────────────────────────────────────────────────────────

function FoodCard({ food }: { food: FoodRecommendationResult['matchedFoods'][number] }) {
  const cat = CATEGORY_STYLE[food.category]
  return (
    <View style={foodCardStyles.card}>
      <View style={foodCardStyles.imageWrap}>
        {food.imageUrl ? (
          <Image source={{ uri: food.imageUrl }} style={foodCardStyles.image} />
        ) : (
          <View style={foodCardStyles.imagePlaceholder}>
            <Text style={foodCardStyles.imagePlaceholderIcon}>🥣</Text>
          </View>
        )}
      </View>
      <View style={foodCardStyles.body}>
        <View style={foodCardStyles.topRow}>
          <Text style={foodCardStyles.name} numberOfLines={2}>{food.name}</Text>
          <View style={[foodCardStyles.catBadge, { backgroundColor: cat.bg }]}>
            <Text style={[foodCardStyles.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
          </View>
        </View>
        <Text style={foodCardStyles.brand}>{food.brand}</Text>
        <Text style={foodCardStyles.desc} numberOfLines={2}>{food.description}</Text>

        {(food.protein != null || food.fat != null || food.fiber != null) && (
          <View style={foodCardStyles.macroRow}>
            {food.protein != null && <Text style={foodCardStyles.macro}>Protein {food.protein}%</Text>}
            {food.fat != null && <Text style={foodCardStyles.macro}>Fat {food.fat}%</Text>}
            {food.fiber != null && <Text style={foodCardStyles.macro}>Fiber {food.fiber}%</Text>}
          </View>
        )}

        {food.matchedConditions.length > 0 && (
          <View style={foodCardStyles.conditionPill}>
            <Text style={foodCardStyles.conditionPillText}>
              ✓ Linked to: {food.matchedConditions.join(', ')}
            </Text>
          </View>
        )}

        {food.prescriptionRequired && (
          <View style={foodCardStyles.rxPill}>
            <Text style={foodCardStyles.rxPillText}>⚕ Prescription diet — requires vet sign-off</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const foodCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  imageWrap: { width: 96 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: 96,
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: { fontSize: 32 },
  body: { flex: 1, padding: Spacing.md, gap: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  name: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  catBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, flexShrink: 0 },
  catBadgeText: { fontSize: 10, fontWeight: '700' },
  brand: { fontSize: Typography.xs, color: Colors.textLight, fontStyle: 'italic' },
  desc: { fontSize: Typography.sm, color: Colors.textMuted, lineHeight: 18 },
  macroRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 2 },
  macro: { fontSize: Typography.xs, color: Colors.greenForest, fontWeight: '600' },
  conditionPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.greenPale,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  conditionPillText: { fontSize: 11, color: Colors.greenForest, fontWeight: '700' },
  rxPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#fdf0ee',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginTop: 4,
  },
  rxPillText: { fontSize: 11, color: '#922b21', fontWeight: '700' },
})

// ── Main screen ────────────────────────────────────────────────────────────────

export function FoodRecommendationScreen({ navigation }: any) {
  const [source, setSource] = useState<Source>('cat')

  const [cats, setCats] = useState<CatProfile[]>([])
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null)
  const [selectedCatDetail, setSelectedCatDetail] = useState<CatProfile | null>(null)

  const [breedOptions, setBreedOptions] = useState<CatBreedSummary[]>([])
  const [breedSearch, setBreedSearch] = useState('')
  const breedSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [manualBreedId, setManualBreedId] = useState<string | null>(null)
  const [manualAgeYears, setManualAgeYears] = useState('')
  const [manualAgeMonths, setManualAgeMonths] = useState('')
  const [manualWeight, setManualWeight] = useState('')

  const [diseaseOptions, setDiseaseOptions] = useState<DiseaseSummary[]>([])
  const [diseaseSearch, setDiseaseSearch] = useState('')
  const diseaseSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [adHocDiseaseIds, setAdHocDiseaseIds] = useState<string[]>([])
  const [healthNotes, setHealthNotes] = useState('')

  const [stage, setStage] = useState<Stage>('form')
  const [error, setError] = useState('')
  const [result, setResult] = useState<FoodRecommendationResult | null>(null)

  const pulseAnim = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    catProfileAPI.list().then(setCats).catch(() => {})
    catBreedAPI.list(30).then(setBreedOptions).catch(() => {})
    diseaseAPI.list(30).then(setDiseaseOptions).catch(() => {})
  }, [])

  // Fetch full detail (including diagnoses) whenever a cat is picked
  useEffect(() => {
    if (!selectedCatId) { setSelectedCatDetail(null); return }
    catProfileAPI.getById(selectedCatId).then(setSelectedCatDetail).catch(() => setSelectedCatDetail(null))
  }, [selectedCatId])

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

  const toggleDisease = (id: string) => {
    setAdHocDiseaseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleDiseaseSearch = (text: string) => {
    setDiseaseSearch(text)
    if (diseaseSearchTimer.current) clearTimeout(diseaseSearchTimer.current)
    diseaseSearchTimer.current = setTimeout(async () => {
      try {
        const list = text.trim() ? await diseaseAPI.search(text.trim()) : await diseaseAPI.list(30)
        setDiseaseOptions(list)
      } catch {
        // keep previous options on error
      }
    }, 350)
  }

  const handleBreedSearch = (text: string) => {
    setBreedSearch(text)
    if (breedSearchTimer.current) clearTimeout(breedSearchTimer.current)
    breedSearchTimer.current = setTimeout(async () => {
      try {
        const list = text.trim() ? await catBreedAPI.search(text.trim()) : await catBreedAPI.list(30)
        setBreedOptions(list)
      } catch {
        // keep previous options on error
      }
    }, 350)
  }

  async function handleSubmit() {
    setError('')

    if (source === 'cat' && !selectedCatId) {
      setError('Please select a cat, or switch to manual entry.')
      return
    }

    const payload =
      source === 'cat'
        ? {
            catProfileId: selectedCatId!,
            healthConditionIds: adHocDiseaseIds,
            healthConditionNotes: healthNotes.trim() || undefined,
          }
        : {
            breedId: manualBreedId || undefined,
            ageYears: manualAgeYears ? parseInt(manualAgeYears, 10) : undefined,
            ageMonths: manualAgeMonths ? parseInt(manualAgeMonths, 10) : undefined,
            weightKg: manualWeight ? parseFloat(manualWeight) : undefined,
            healthConditionIds: adHocDiseaseIds,
            healthConditionNotes: healthNotes.trim() || undefined,
          }

    if (source === 'manual') {
      const hasInput =
        !!payload.breedId || payload.ageYears != null || payload.ageMonths != null ||
        payload.weightKg != null || (payload.healthConditionIds && payload.healthConditionIds.length > 0) ||
        !!payload.healthConditionNotes
      if (!hasInput) {
        setError('Please enter at least breed, age, weight, or a health condition.')
        return
      }
    }

    setStage('loading')
    try {
      const res = await foodRecommendationAPI.analyze(payload)
      setResult(res)
      setStage('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations')
      setStage('form')
    }
  }

  function reset() {
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
        <Text style={styles.headerTitle}>Food Recommendations</Text>
        <Text style={styles.headerSubtitle}>
          Get AI-assisted diet guidance based on breed, age, weight and health condition
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ═══════════════════ FORM ═══════════════════ */}
        {stage === 'form' && (
          <>
            <SourceTabs source={source} onChange={setSource} />

            {source === 'cat' && (
              <FormCard delay={40}>
                <SectionHeading title="Choose a cat" />
                {cats.length === 0 ? (
                  <EmptyState
                    emoji="🐱"
                    title="No cats yet"
                    desc="Add a cat profile to get personalized food recommendations."
                    actionLabel="Add a cat"
                    onAction={() => navigation.navigate('CatForm', { mode: 'create' })}
                  />
                ) : (
                  <>
                    <View style={styles.chipsWrap}>
                      {cats.map((c) => (
                        <Chip key={c.id} label={c.name} selected={selectedCatId === c.id} onPress={() => setSelectedCatId(c.id)} />
                      ))}
                    </View>
                    {selectedCatDetail && (
                      <View style={styles.catSummary}>
                        {selectedCatDetail.breed ? (
                          <Text style={styles.catSummaryText}>Breed: {selectedCatDetail.breed.name}</Text>
                        ) : null}
                        {(selectedCatDetail.ageYears != null || selectedCatDetail.ageMonths != null) && (
                          <Text style={styles.catSummaryText}>
                            Age: {selectedCatDetail.ageYears ?? 0}y {selectedCatDetail.ageMonths ?? 0}m
                          </Text>
                        )}
                        {selectedCatDetail.weightKg != null && (
                          <Text style={styles.catSummaryText}>Weight: {selectedCatDetail.weightKg} kg</Text>
                        )}
                        {selectedCatDetail.diagnoses.length > 0 && (
                          <View style={{ marginTop: Spacing.sm }}>
                            <Text style={styles.catSummaryLabel}>On file from your vet:</Text>
                            <TagList items={selectedCatDetail.diagnoses.map((d) => d.disease.name)} tone="gold" />
                          </View>
                        )}
                      </View>
                    )}
                  </>
                )}
              </FormCard>
            )}

            {source === 'manual' && (
              <FormCard delay={40}>
                <SectionHeading title="Cat details" />
                <View style={{ marginBottom: Spacing.sm }}>
                  <Text style={styles.miniLabel}>Breed (optional)</Text>
                  <TextInput
                    value={breedSearch}
                    onChangeText={handleBreedSearch}
                    placeholder="Search breeds…"
                    style={{ marginBottom: Spacing.sm }}
                  />
                  <View style={styles.chipsWrap}>
                    {breedOptions.map((b) => (
                      <Chip
                        key={b.id}
                        label={b.name}
                        selected={manualBreedId === b.id}
                        onPress={() => setManualBreedId((prev) => (prev === b.id ? null : b.id))}
                      />
                    ))}
                    {breedOptions.length === 0 && breedSearch.trim() !== '' && (
                      <Text style={styles.noMatchText}>No breeds match "{breedSearch}".</Text>
                    )}
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.rowHalf}>
                    <Field label="Age (years)" optional>
                      <TextInput value={manualAgeYears} onChangeText={setManualAgeYears} placeholder="0" keyboardType="numeric" />
                    </Field>
                  </View>
                  <View style={styles.rowHalf}>
                    <Field label="Age (months)" optional>
                      <TextInput value={manualAgeMonths} onChangeText={setManualAgeMonths} placeholder="0" keyboardType="numeric" />
                    </Field>
                  </View>
                </View>
                <Field label="Weight (kg)" optional>
                  <TextInput value={manualWeight} onChangeText={setManualWeight} placeholder="e.g. 4.2" keyboardType="decimal-pad" />
                </Field>
              </FormCard>
            )}

            <FormCard delay={100}>
              <SectionHeading title={source === 'cat' ? 'Additional conditions for this search' : 'Health condition (optional)'} />
              {source === 'cat' && (
                <Text style={styles.helperText}>
                  Anything selected below is used just for this search — it won't be saved to your cat's medical record.
                </Text>
              )}
              <TextInput
                value={diseaseSearch}
                onChangeText={handleDiseaseSearch}
                placeholder="Search conditions… e.g. kidney"
                style={{ marginBottom: Spacing.md, marginTop: Spacing.sm }}
              />
              <View style={styles.chipsWrap}>
                {diseaseOptions.map((d) => (
                  <Chip key={d.id} label={d.name} selected={adHocDiseaseIds.includes(d.id)} onPress={() => toggleDisease(d.id)} />
                ))}
                {diseaseOptions.length === 0 && (
                  <Text style={styles.noMatchText}>No matching conditions found.</Text>
                )}
              </View>
              <Field label="Additional notes" optional>
                <TextInput
                  value={healthNotes}
                  onChangeText={setHealthNotes}
                  placeholder="Anything else the vet has mentioned…"
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: 'top', paddingTop: Spacing.md }}
                />
              </Field>
            </FormCard>

            <Button label="Get food recommendations" onPress={handleSubmit} style={{ marginTop: Spacing.sm } as any} />

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This tool gives general dietary guidance only and is not a prescription. Always confirm significant diet changes with a licensed veterinarian, especially for diagnosed health conditions.
              </Text>
            </View>
          </>
        )}

        {/* ═══════════════════ LOADING ═══════════════════ */}
        {stage === 'loading' && (
          <Animated.View style={[styles.loadingCard, { opacity: pulseAnim }]}>
            <Text style={styles.loadingIcon}>🥣</Text>
            <Text style={styles.loadingTitle}>Building recommendations…</Text>
            <Text style={styles.loadingHint}>Cross-checking the food library</Text>
          </Animated.View>
        )}

        {/* ═══════════════════ RESULT ═══════════════════ */}
        {stage === 'result' && result && (
          <>
            <View style={[styles.catBanner, { backgroundColor: CATEGORY_STYLE[result.recommendedCategory].bg }]}>
              <Text style={[styles.catBannerLabel, { color: CATEGORY_STYLE[result.recommendedCategory].color }]}>
                {CATEGORY_STYLE[result.recommendedCategory].label} diet recommended
              </Text>
            </View>

            {result.urgentWarning && (
              <View style={styles.urgentBanner}>
                <Text style={styles.urgentIcon}>⚠</Text>
                <Text style={styles.urgentText}>{result.urgentWarning}</Text>
              </View>
            )}

            {result.diagnosedConditions.length > 0 && (
              <FormCard delay={20}>
                <SectionHeading title="Based on health conditions" />
                <TagList items={result.diagnosedConditions} tone="gold" />
              </FormCard>
            )}

            <FormCard delay={40}>
              <SectionHeading title="Dietary profile" />
              <Text style={styles.bodyText}>{result.dietaryProfile}</Text>
            </FormCard>

            {result.keyNutrientFocus.length > 0 && (
              <FormCard delay={80}>
                <SectionHeading title="Prioritize" />
                <TagList items={result.keyNutrientFocus} tone="green" />
              </FormCard>
            )}

            {result.avoidIngredients.length > 0 && (
              <FormCard delay={120}>
                <SectionHeading title="Avoid" />
                <TagList items={result.avoidIngredients} tone="red" />
              </FormCard>
            )}

            <FormCard delay={160}>
              <SectionHeading title="Feeding guidance" />
              <View style={{ gap: Spacing.sm }}>
                {result.generalGuidance.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </FormCard>

            <FormCard delay={200}>
              <SectionHeading title={`Foods in our library (${result.matchedFoods.length})`} />
              {result.matchedFoods.length === 0 ? (
                <Text style={styles.noMatchText}>No matching foods found in the library yet — ask your vet for specific product suggestions.</Text>
              ) : (
                result.matchedFoods.map((f) => <FoodCard key={f.id} food={f} />)
              )}
            </FormCard>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                AI-generated guidance for educational purposes only — always consult a licensed veterinarian before changing your cat's diet, especially for diagnosed conditions.
              </Text>
            </View>

            <Button label="Get another recommendation" onPress={reset} style={{ marginTop: Spacing.md } as any} />
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
  row: { flexDirection: 'row', gap: Spacing.md },
  rowHalf: { flex: 1 },

  miniLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  helperText: { fontSize: Typography.xs, color: Colors.textLight, fontStyle: 'italic', marginBottom: Spacing.xs },

  noMatchText: { fontSize: Typography.sm, color: Colors.textLight, fontStyle: 'italic' },

  catSummary: {
    backgroundColor: Colors.ivory,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: 2,
  },
  catSummaryText: { fontSize: Typography.sm, color: Colors.textBody, fontWeight: '500' },
  catSummaryLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },

  disclaimer: {
    backgroundColor: Colors.ivory,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    marginTop: Spacing.lg,
  },
  disclaimerText: { fontSize: Typography.xs, color: Colors.textLight, lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },

  loadingCard: { alignItems: 'center', paddingVertical: Spacing['4xl'], gap: Spacing.sm },
  loadingIcon: { fontSize: 56 },
  loadingTitle: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary },
  loadingHint: { fontSize: Typography.sm, color: Colors.textLight, fontStyle: 'italic' },

  catBanner: { borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center', marginBottom: Spacing.lg },
  catBannerLabel: { fontSize: Typography.lg, fontWeight: '800', letterSpacing: 0.3 },

  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#fdf0ee',
    borderWidth: 1.5,
    borderColor: 'rgba(192,57,43,0.25)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  urgentIcon: { fontSize: 18, color: '#c0392b' },
  urgentText: { flex: 1, fontSize: Typography.base, color: '#922b21', fontWeight: '600', lineHeight: 21 },

  bodyText: { fontSize: Typography.base, color: Colors.textBody, lineHeight: 23 },

  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold, marginTop: 8, flexShrink: 0 },
  tipText: { flex: 1, fontSize: Typography.base, color: Colors.textBody, lineHeight: 22 },
})