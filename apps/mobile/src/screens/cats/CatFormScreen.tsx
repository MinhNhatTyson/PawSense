import React, { useState, useRef } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native'
import { catProfileAPI, type CatGender, type CatProfile } from '../../api/catProfileAPI'
import { Button, AlertBanner, SectionTitle, Field } from '../../components/UI'
import { TextInput } from '../../components/TextInput'
import { Colors, Typography, Spacing, Radius, Shadow } from '../../theme'

type GenderOption = { value: CatGender; label: string; emoji: string }
const GENDER_OPTIONS: GenderOption[] = [
  { value: 'MALE', label: 'Male', emoji: '♂' },
  { value: 'FEMALE', label: 'Female', emoji: '♀' },
  { value: 'UNKNOWN', label: 'Unknown', emoji: '?' },
]

interface VaccinationEntry {
  vaccineName: string
  dateGiven: string
  nextDueDate: string
  veterinarian: string
  notes: string
}

function VaccinationItem({
  item,
  index,
  onChange,
  onRemove,
  disabled,
}: {
  item: VaccinationEntry
  index: number
  onChange: (index: number, field: keyof VaccinationEntry, value: string) => void
  onRemove: (index: number) => void
  disabled: boolean
}) {
  return (
    <View style={vaccStyles.card}>
      <View style={vaccStyles.header}>
        <View style={vaccStyles.num}>
          <Text style={vaccStyles.numText}>{index + 1}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onRemove(index)}
          disabled={disabled}
          style={vaccStyles.removeBtn}
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
      <Field label="Next due date" optional>
        <TextInput
          value={item.nextDueDate}
          onChangeText={v => onChange(index, 'nextDueDate', v)}
          placeholder="YYYY-MM-DD"
          editable={!disabled}
        />
      </Field>
      <Field label="Veterinarian" optional>
        <TextInput
          value={item.veterinarian}
          onChangeText={v => onChange(index, 'veterinarian', v)}
          placeholder="Dr. Smith"
          editable={!disabled}
        />
      </Field>
    </View>
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
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontSize: Typography.sm, fontWeight: '700', color: Colors.cream },
  removeBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
  },
  removeBtnText: { fontSize: Typography.sm, color: Colors.error, fontWeight: '500' },
})

export function CatFormScreen({ navigation, route }: any) {
  const { mode, cat } = route.params as { mode: 'create' | 'edit'; cat?: CatProfile }
  const isEditing = mode === 'edit' && !!cat

  const [name, setName] = useState(cat?.name ?? '')
  const [gender, setGender] = useState<CatGender>(cat?.gender ?? 'UNKNOWN')
  const [ageYears, setAgeYears] = useState(cat?.ageYears != null ? String(cat.ageYears) : '')
  const [ageMonths, setAgeMonths] = useState(cat?.ageMonths != null ? String(cat.ageMonths) : '')
  const [weightKg, setWeightKg] = useState(cat?.weightKg != null ? String(cat.weightKg) : '')
  const [breed, setBreed] = useState(cat?.breed ?? '')
  const [color, setColor] = useState(cat?.color ?? '')
  const [notes, setNotes] = useState(cat?.notes ?? '')

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(cat?.imageUrls ?? [])
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

  // ── Image picking (simulated — real app uses expo-image-picker) ───────────
  const pickImage = () => {
    Alert.alert(
      'Add Photo',
      'In production this opens the camera roll. For now, enter an image URL:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use placeholder',
          onPress: () => {
            const placeholder = `https://placekitten.com/400/${300 + newImageUris.length * 10}`
            setNewImageUris(prev => [...prev, placeholder])
          },
        },
      ]
    )
  }

  const removeExistingImage = (url: string) => {
    setExistingImageUrls(prev => prev.filter(u => u !== url))
  }
  const removeNewImage = (idx: number) => {
    setNewImageUris(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Vaccinations ──────────────────────────────────
  const addVaccination = () => {
    setVaccinations(prev => [...prev, {
      vaccineName: '', dateGiven: '', nextDueDate: '', veterinarian: '', notes: '',
    }])
  }
  const updateVaccination = (index: number, field: keyof VaccinationEntry, value: string) => {
    setVaccinations(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v))
  }
  const removeVaccination = (index: number) => {
    setVaccinations(prev => prev.filter((_, i) => i !== index))
  }

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim()) { setError('Cat name is required.'); return }
    const validVaccinations = vaccinations.filter(v => v.vaccineName.trim() && v.dateGiven.trim())
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
        await catProfileAPI.create(payload, newImageUris.length > 0 ? newImageUris : undefined)
      }
      navigation.goBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save cat profile')
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? `Edit ${cat!.name}` : 'Add New Cat'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isEditing ? 'Update your cat\'s profile' : 'Fill in your cat\'s details'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? <AlertBanner type="error" message={error} /> : null}

        {/* ── Basic Info ──────────────────────────── */}
        <View style={styles.card}>
          <SectionTitle title="Basic information" />

          <Field label="Cat's name *">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Luna, Mochi, Oliver"
              editable={!loading}
            />
          </Field>

          {/* Gender selector */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDER_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.genderOption, gender === opt.value && styles.genderOptionSelected]}
                  onPress={() => setGender(opt.value)}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.genderEmoji}>{opt.emoji}</Text>
                  <Text style={[
                    styles.genderLabel,
                    gender === opt.value && styles.genderLabelSelected,
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
        </View>

        {/* ── Age & Weight ────────────────────────── */}
        <View style={styles.card}>
          <SectionTitle title="Age & weight" />

          <View style={styles.rowFields}>
            <View style={styles.rowField}>
              <Field label="Age (years)" optional>
                <TextInput
                  value={ageYears}
                  onChangeText={setAgeYears}
                  placeholder="0"
                  keyboardType="numeric"
                  editable={!loading}
                />
              </Field>
            </View>
            <View style={styles.rowField}>
              <Field label="Age (months)" optional>
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
        </View>

        {/* ── Photos ──────────────────────────────── */}
        <View style={styles.card}>
          <SectionTitle title={`Photos (${totalImages}/5)`} />

          {totalImages > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {existingImageUrls.map((url, idx) => (
                <View key={`existing-${idx}`} style={styles.imageThumbnail}>
                  <Image source={{ uri: url }} style={styles.thumbnailImg} />
                  <TouchableOpacity
                    style={styles.thumbnailRemove}
                    onPress={() => removeExistingImage(url)}
                    disabled={loading}
                  >
                    <Text style={styles.thumbnailRemoveText}>×</Text>
                  </TouchableOpacity>
                  {idx === 0 && existingImageUrls.length > 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Main</Text>
                    </View>
                  )}
                </View>
              ))}
              {newImageUris.map((uri, idx) => (
                <View key={`new-${idx}`} style={[styles.imageThumbnail, styles.imageThumbnailNew]}>
                  <Image source={{ uri }} style={styles.thumbnailImg} />
                  <TouchableOpacity
                    style={styles.thumbnailRemove}
                    onPress={() => removeNewImage(idx)}
                    disabled={loading}
                  >
                    <Text style={styles.thumbnailRemoveText}>×</Text>
                  </TouchableOpacity>
                  <View style={[styles.primaryBadge, styles.primaryBadgeNew]}>
                    <Text style={styles.primaryBadgeText}>New</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {totalImages < 5 && (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={pickImage}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadLabel}>
                {totalImages === 0 ? 'Add photos of your cat' : 'Add more photos'}
              </Text>
              <Text style={styles.uploadHint}>Up to {5 - totalImages} more photo{5 - totalImages !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Vaccination History ──────────────────── */}
        <View style={styles.card}>
          <SectionTitle title={`Vaccination history${vaccinations.length > 0 ? ` (${vaccinations.length})` : ''}`} />

          {vaccinations.length === 0 && (
            <Text style={styles.emptyHint}>
              No vaccinations recorded yet. Tap below to add vaccination records.
            </Text>
          )}

          {vaccinations.map((v, idx) => (
            <VaccinationItem
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
            <Text style={styles.addVaccineBtnText}>+ Add vaccination</Text>
          </TouchableOpacity>
        </View>

        {/* ── Notes ───────────────────────────────── */}
        <View style={styles.card}>
          <SectionTitle title="Additional notes" />
          <Field label="Notes" optional>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Any other important information about your cat…"
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top', paddingTop: Spacing.md }}
              editable={!loading}
            />
          </Field>
        </View>

        {/* ── Actions ─────────────────────────────── */}
        <Button
          label={loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add cat'}
          onPress={handleSubmit}
          loading={loading}
        />
        <Button
          label="Cancel"
          onPress={() => navigation.goBack()}
          variant="secondary"
          disabled={loading}
          style={{ marginTop: Spacing.md }}
        />

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
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  backBtn: { marginBottom: Spacing.sm },
  backBtnText: { fontSize: Typography.base, color: 'rgba(245,240,232,0.7)', fontWeight: '500' },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: '600',
    color: Colors.cream,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: Typography.base, color: 'rgba(245,240,232,0.65)' },

  // ── Scroll ────────────────────────────────────────
  scroll: { padding: Spacing['2xl'], gap: Spacing.lg, paddingBottom: Spacing['4xl'] },

  // ── Card ─────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    gap: Spacing.xs,
    ...Shadow.sm,
  },

  // ── Field ─────────────────────────────────────────
  fieldWrap: { marginBottom: Spacing.lg },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  // ── Gender selector ───────────────────────────────
  genderRow: { flexDirection: 'row', gap: Spacing.sm },
  genderOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.ivory,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    gap: 4,
  },
  genderOptionSelected: {
    backgroundColor: Colors.greenPale,
    borderColor: Colors.greenSage,
  },
  genderEmoji: { fontSize: 20 },
  genderLabel: { fontSize: Typography.sm, fontWeight: '500', color: Colors.textBody },
  genderLabelSelected: { color: Colors.greenForest, fontWeight: '600' },

  // ── Row fields ────────────────────────────────────
  rowFields: { flexDirection: 'row', gap: Spacing.md },
  rowField: { flex: 1 },

  // ── Photos ────────────────────────────────────────
  imageScroll: { marginBottom: Spacing.md },
  imageThumbnail: {
    width: 90,
    height: 90,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.warmWhite,
    position: 'relative',
  },
  imageThumbnailNew: { borderColor: Colors.greenPale },
  thumbnailImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  thumbnailRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(26,58,42,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailRemoveText: { color: Colors.white, fontSize: 14, lineHeight: 18 },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(26,58,42,0.75)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeNew: { backgroundColor: 'rgba(74,124,95,0.85)' },
  primaryBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '700' },
  uploadArea: {
    borderWidth: 2,
    borderColor: Colors.warmWhite,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  uploadIcon: { fontSize: 32 },
  uploadLabel: {
    fontSize: Typography.base,
    fontWeight: '500',
    color: Colors.textBody,
  },
  uploadHint: { fontSize: Typography.sm, color: Colors.textLight },

  // ── Vaccination ───────────────────────────────────
  emptyHint: {
    fontSize: Typography.base,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  addVaccineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  addVaccineBtnText: {
    fontSize: Typography.base,
    color: Colors.greenSage,
    fontWeight: '600',
  },
})