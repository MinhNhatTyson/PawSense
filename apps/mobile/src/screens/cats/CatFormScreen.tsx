import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Pressable,
} from 'react-native'
import { catProfileAPI, type CatGender, type CatProfile } from '../../api/catProfileAPI'
import { Button, AlertBanner, Field } from '../../components/UI'
import { TextInput } from '../../components/TextInput'
import * as ImagePicker from 'expo-image-picker'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

// ── Animated form card ────────────────────────────────────────────────────────
function FormCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 11,
        delay,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        cardStyles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
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
    gap: Spacing.xs,
    ...Shadow.sm,
  },
})

// ── Animated section title ────────────────────────────────────────────────────
function SectionHeading({ title }: { title: string }) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.text}>{title}</Text>
      <View style={sectionStyles.line} />
    </View>
  )
}

const sectionStyles = StyleSheet.create({
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

// ── Gender option button ──────────────────────────────────────────────────────
function GenderOption({
  value,
  label,
  emoji,
  selected,
  onSelect,
  disabled,
}: {
  value: CatGender
  label: string
  emoji: string
  selected: boolean
  onSelect: (v: CatGender) => void
  disabled: boolean
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current

  React.useEffect(() => {
    Animated.spring(bgAnim, {
      toValue: selected ? 1 : 0,
      tension: 120,
      friction: 10,
      useNativeDriver: false,
    }).start()
    if (selected) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.93,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [selected])

  const borderColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.warmWhite, Colors.greenSage],
  })
  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.ivory, Colors.greenPale],
  })

  return (
    <Animated.View
      style={[
        genderStyles.option,
        { borderColor, backgroundColor, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={() => !disabled && onSelect(value)}
        style={genderStyles.pressable}
      >
        <Text style={genderStyles.emoji}>{emoji}</Text>
        <Text
          style={[
            genderStyles.label,
            selected && genderStyles.labelSelected,
          ]}
        >
          {label}
        </Text>
        {selected && (
          <View style={genderStyles.checkDot} />
        )}
      </Pressable>
    </Animated.View>
  )
}

const genderStyles = StyleSheet.create({
  option: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  pressable: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  emoji: { fontSize: 22 },
  label: {
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  labelSelected: {
    color: Colors.greenForest,
    fontWeight: '700',
  },
  checkDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.greenForest,
  },
})

// ── Vaccination row ───────────────────────────────────────────────────────────
interface VaccinationEntry {
  vaccineName: string
  dateGiven: string
  nextDueDate: string
  veterinarian: string
  notes: string
}

function VaccinationRow({
  item,
  index,
  onChange,
  onRemove,
  disabled,
}: {
  item: VaccinationEntry
  index: number
  onChange: (i: number, f: keyof VaccinationEntry, v: string) => void
  onRemove: (i: number) => void
  disabled: boolean
}) {
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [expanded, setExpanded] = useState(true)

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        vaccStyles.card,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={vaccStyles.header}>
        <View style={vaccStyles.indexBadge}>
          <Text style={vaccStyles.indexText}>{index + 1}</Text>
        </View>
        <Text style={vaccStyles.headerTitle} numberOfLines={1}>
          {item.vaccineName || 'New vaccination'}
        </Text>
        <TouchableOpacity
          onPress={() => !disabled && onRemove(index)}
          style={vaccStyles.removeBtn}
          disabled={disabled}
        >
          <Text style={vaccStyles.removeBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <Field label="Vaccine name *">
        <TextInput
          value={item.vaccineName}
          onChangeText={v => onChange(index, 'vaccineName', v)}
          placeholder="e.g. FVRCP, Rabies, FeLV"
          editable={!disabled}
        />
      </Field>
      <Field label="Date given *">
        <TextInput
          value={item.dateGiven}
          onChangeText={v => onChange(index, 'dateGiven', v)}
          placeholder="YYYY-MM-DD"
          editable={!disabled}
        />
      </Field>
      <View style={vaccStyles.row}>
        <View style={vaccStyles.rowHalf}>
          <Field label="Next due" optional>
            <TextInput
              value={item.nextDueDate}
              onChangeText={v => onChange(index, 'nextDueDate', v)}
              placeholder="YYYY-MM-DD"
              editable={!disabled}
            />
          </Field>
        </View>
        <View style={vaccStyles.rowHalf}>
          <Field label="Veterinarian" optional>
            <TextInput
              value={item.veterinarian}
              onChangeText={v => onChange(index, 'veterinarian', v)}
              placeholder="Dr. Smith"
              editable={!disabled}
            />
          </Field>
        </View>
      </View>
    </Animated.View>
  )
}

const vaccStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.ivory,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  indexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  indexText: { fontSize: Typography.xs, fontWeight: '700', color: Colors.cream },
  headerTitle: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textBody,
  },
  removeBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
  },
  removeBtnText: { fontSize: Typography.xs, color: Colors.error, fontWeight: '600' },
  row: { flexDirection: 'row', gap: Spacing.sm },
  rowHalf: { flex: 1 },
})

// ── Photo thumbnail ───────────────────────────────────────────────────────────
function PhotoThumbnail({
  uri,
  onRemove,
  label,
  isNew = false,
  disabled,
}: {
  uri: string
  onRemove: () => void
  label?: string
  isNew?: boolean
  disabled: boolean
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View
      style={[photoStyles.thumb, { transform: [{ scale: scaleAnim }] }]}
    >
      <Image source={{ uri }} style={photoStyles.image} resizeMode="cover" />
      <TouchableOpacity
        style={photoStyles.remove}
        onPress={onRemove}
        disabled={disabled}
      >
        <Text style={photoStyles.removeText}>×</Text>
      </TouchableOpacity>
      {label ? (
        <View style={[photoStyles.label, isNew && photoStyles.labelNew]}>
          <Text style={photoStyles.labelText}>{label}</Text>
        </View>
      ) : null}
    </Animated.View>
  )
}

const photoStyles = StyleSheet.create({
  thumb: {
    width: 88,
    height: 88,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.warmWhite,
    flexShrink: 0,
  },
  image: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(26,58,42,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: Colors.white, fontSize: 16, lineHeight: 20, fontWeight: '700' },
  label: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(26,58,42,0.80)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labelNew: { backgroundColor: 'rgba(74,124,95,0.90)' },
  labelText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
})

// ── Main form screen ──────────────────────────────────────────────────────────
export function CatFormScreen({ navigation, route }: any) {
  const { mode, cat } = route.params as { mode: 'create' | 'edit'; cat?: CatProfile }
  const isEditing = mode === 'edit' && !!cat

  // ── State ─────────────────────────────────────────
  const [name, setName] = useState(cat?.name ?? '')
  const [gender, setGender] = useState<CatGender>(cat?.gender ?? 'UNKNOWN')
  const [ageYears, setAgeYears] = useState(
    cat?.ageYears != null ? String(cat.ageYears) : ''
  )
  const [ageMonths, setAgeMonths] = useState(
    cat?.ageMonths != null ? String(cat.ageMonths) : ''
  )
  const [weightKg, setWeightKg] = useState(
    cat?.weightKg != null ? String(cat.weightKg) : ''
  )
  const [breed, setBreed] = useState(cat?.breed ?? '')
  const [color, setColor] = useState(cat?.color ?? '')
  const [notes, setNotes] = useState(cat?.notes ?? '')

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    cat?.imageUrls ?? []
  )
  const [newImageUris, setNewImageUris] = useState<string[]>([])

  const [vaccinations, setVaccinations] = useState<VaccinationEntry[]>(
    cat?.vaccinations.map(v => ({
      vaccineName: v.vaccineName,
      dateGiven: v.dateGiven.substring(0, 10),
      nextDueDate: v.nextDueDate?.substring(0, 10) ?? '',
      veterinarian: v.veterinarian ?? '',
      notes: v.notes ?? '',
    })) ?? []
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<ScrollView>(null)

  // ── Header animation ──────────────────────────────
  const headerAnim = useRef(new Animated.Value(0)).current
  React.useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start()
  }, [])

  // ── Image picking ─────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'PawSense needs access to your photo library to add cat photos. Please enable it in your device settings.'
      )
      return
    }

    const remaining = 5 - (existingImageUrls.length + newImageUris.length)
    if (remaining <= 0) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    })

    if (result.canceled) return

    const pickedUris = result.assets.map(asset => asset.uri)
    setNewImageUris(prev => [...prev, ...pickedUris].slice(0, prev.length + remaining))
  }

  // ── Vaccinations ──────────────────────────────────
  const addVaccination = () => {
    setVaccinations(prev => [
      ...prev,
      { vaccineName: '', dateGiven: '', nextDueDate: '', veterinarian: '', notes: '' },
    ])
    // Scroll down after a tick
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }

  const updateVaccination = useCallback(
    (i: number, f: keyof VaccinationEntry, v: string) => {
      setVaccinations(prev => prev.map((item, idx) => (idx === i ? { ...item, [f]: v } : item)))
    },
    []
  )

  const removeVaccination = useCallback((i: number) => {
    setVaccinations(prev => prev.filter((_, idx) => idx !== i))
  }, [])

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Cat's name is required.")
      scrollRef.current?.scrollTo({ y: 0, animated: true })
      return
    }
    const validVaccinations = vaccinations.filter(
      v => v.vaccineName.trim() && v.dateGiven.trim()
    )
    setError('')
    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        gender,
        ageYears: ageYears ? parseInt(ageYears) : undefined,
        ageMonths: ageMonths ? parseInt(ageMonths) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        breed: breed.trim() || undefined,
        color: color.trim() || undefined,
        notes: notes.trim() || undefined,
        vaccinations: validVaccinations,
      }

      if (isEditing && cat) {
        await catProfileAPI.update(
          cat.id,
          { ...payload, existingImageUrls },
          newImageUris.length > 0 ? newImageUris : undefined
        )
      } else {
        await catProfileAPI.create(
          payload,
          newImageUris.length > 0 ? newImageUris : undefined
        )
      }
      navigation.goBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cat profile')
      scrollRef.current?.scrollTo({ y: 0, animated: true })
    } finally {
      setLoading(false)
    }
  }

  const totalImages = existingImageUrls.length + newImageUris.length

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? `Edit ${cat!.name}` : 'Add new cat'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isEditing
            ? "Update your cat's health profile"
            : 'Fill in what you know — you can always add more later'}
        </Text>
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <Animated.View>
            <AlertBanner type="error" message={error} />
          </Animated.View>
        ) : null}

        {/* ── Basic info ── */}
        <FormCard delay={80}>
          <SectionHeading title="About your cat" />

          <Field label="Name *">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Luna, Mochi, Oliver"
              editable={!loading}
              autoFocus={!isEditing}
            />
          </Field>

          <View style={styles.fieldLabel}>
            <Text style={styles.labelText}>Gender</Text>
          </View>
          <View style={styles.genderRow}>
            {([
              { value: 'MALE', label: 'Male', emoji: '♂️' },
              { value: 'FEMALE', label: 'Female', emoji: '♀️' },
              { value: 'UNKNOWN', label: 'Unknown', emoji: '❓' },
            ] as const).map(opt => (
              <GenderOption
                key={opt.value}
                {...opt}
                selected={gender === opt.value}
                onSelect={setGender}
                disabled={loading}
              />
            ))}
          </View>

          <Field label="Breed" optional>
            <TextInput
              value={breed}
              onChangeText={setBreed}
              placeholder="e.g. Persian, Siamese, Maine Coon"
              editable={!loading}
            />
          </Field>

          <Field label="Coat colour" optional>
            <TextInput
              value={color}
              onChangeText={setColor}
              placeholder="e.g. Orange tabby, Black & white"
              editable={!loading}
            />
          </Field>
        </FormCard>

        {/* ── Age & weight ── */}
        <FormCard delay={160}>
          <SectionHeading title="Age & weight" />

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Field label="Years" optional>
                <TextInput
                  value={ageYears}
                  onChangeText={setAgeYears}
                  placeholder="0"
                  keyboardType="numeric"
                  editable={!loading}
                />
              </Field>
            </View>
            <View style={styles.col}>
              <Field label="Months" optional>
                <TextInput
                  value={ageMonths}
                  onChangeText={setAgeMonths}
                  placeholder="0"
                  keyboardType="numeric"
                  editable={!loading}
                />
              </Field>
            </View>
          </View>

          <Field label="Weight (kg)" optional>
            <TextInput
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="e.g. 4.5"
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </Field>
        </FormCard>

        {/* ── Photos ── */}
        <FormCard delay={240}>
          <SectionHeading title={`Photos ${totalImages > 0 ? `(${totalImages}/5)` : ''}`} />

          {totalImages > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoScroll}
              contentContainerStyle={{ gap: Spacing.sm, paddingVertical: 4 }}
            >
              {existingImageUrls.map((url, idx) => (
                <PhotoThumbnail
                  key={`e-${idx}`}
                  uri={url}
                  label={idx === 0 ? 'Main' : undefined}
                  onRemove={() =>
                    setExistingImageUrls(prev => prev.filter(u => u !== url))
                  }
                  disabled={loading}
                />
              ))}
              {newImageUris.map((uri, idx) => (
                <PhotoThumbnail
                  key={`n-${idx}`}
                  uri={uri}
                  label="New"
                  isNew
                  onRemove={() =>
                    setNewImageUris(prev => prev.filter((_, i) => i !== idx))
                  }
                  disabled={loading}
                />
              ))}
            </ScrollView>
          )}

          {totalImages < 5 ? (
            <TouchableOpacity
              style={styles.uploadZone}
              onPress={pickImage}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.uploadZoneIcon}>📷</Text>
              <Text style={styles.uploadZoneLabel}>
                {totalImages === 0 ? 'Add photos of your cat' : 'Add more photos'}
              </Text>
              <Text style={styles.uploadZoneHint}>
                Up to {5 - totalImages} more · PNG, JPG, HEIC
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.uploadFull}>
              <Text style={styles.uploadFullText}>Maximum 5 photos reached</Text>
            </View>
          )}
        </FormCard>

        {/* ── Vaccinations ── */}
        <FormCard delay={320}>
          <SectionHeading
            title={
              vaccinations.length > 0
                ? `Vaccination history (${vaccinations.length})`
                : 'Vaccination history'
            }
          />

          {vaccinations.length === 0 && (
            <Text style={styles.emptyHint}>
              No vaccinations recorded yet. Keep track of your cat's shots below.
            </Text>
          )}

          {vaccinations.map((v, idx) => (
            <VaccinationRow
              key={idx}
              item={v}
              index={idx}
              onChange={updateVaccination}
              onRemove={removeVaccination}
              disabled={loading}
            />
          ))}

          <TouchableOpacity
            style={styles.addVaccineBtn}
            onPress={addVaccination}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.addVaccineBtnText}>+ Add vaccination record</Text>
          </TouchableOpacity>
        </FormCard>

        {/* ── Notes ── */}
        <FormCard delay={400}>
          <SectionHeading title="Notes" />
          <Field label="Any other details" optional>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Allergies, special diet, favourite toys, vet clinic…"
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top', paddingTop: Spacing.md }}
              editable={!loading}
            />
          </Field>
        </FormCard>

        {/* ── Actions ── */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
            gap: Spacing.md,
          }}
        >
          <Button
            label={isEditing ? 'Save changes' : 'Add cat'}
            onPress={handleSubmit}
            loading={loading}
          />
          <Button
            label="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
            disabled={loading}
          />
        </Animated.View>

        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  // ── Header ────────────────────────────────────────
  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'ios' ? 56 : Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  backBtn: { marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  backBtnText: {
    fontSize: Typography.base,
    color: 'rgba(245,240,232,0.70)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.cream,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Typography.sm,
    color: 'rgba(245,240,232,0.60)',
    lineHeight: 20,
  },

  // ── Scroll ────────────────────────────────────────
  scroll: {
    padding: Spacing['2xl'],
    gap: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },

  // ── Fields ────────────────────────────────────────
  fieldLabel: { marginBottom: Spacing.sm },
  labelText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  twoCol: { flexDirection: 'row', gap: Spacing.md },
  col: { flex: 1 },

  // ── Photos ────────────────────────────────────────
  photoScroll: { marginBottom: Spacing.md },
  uploadZone: {
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.ivory,
  },
  uploadZoneIcon: { fontSize: 28 },
  uploadZoneLabel: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textBody,
  },
  uploadZoneHint: { fontSize: Typography.sm, color: Colors.textLight },
  uploadFull: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.ivory,
    borderRadius: Radius.md,
  },
  uploadFullText: {
    fontSize: Typography.sm,
    color: Colors.textLight,
    fontStyle: 'italic',
  },

  // ── Vaccinations ──────────────────────────────────
  emptyHint: {
    fontSize: Typography.base,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  addVaccineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.greenPale,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
    backgroundColor: 'rgba(232,240,235,0.4)',
  },
  addVaccineBtnText: {
    fontSize: Typography.base,
    color: Colors.greenForest,
    fontWeight: '600',
  },
})