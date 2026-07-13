import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { Button, AlertBanner, Card } from '../components/UI'
import { Field } from '../components/UI'
import { TextInput } from '../components/TextInput'
import { Colors, Typography, Spacing, Shadow } from '../theme'
import { FadeSlideIn } from '../components/Motion'

export function EditProfileScreen({ navigation }: any) {
  const { user, updateProfile, isLoading } = useAuth()

  const [fullName, setFullName] = useState(user?.profile?.fullName || '')
  const [phone, setPhone] = useState(user?.profile?.phone || '')
  const [address, setAddress] = useState(user?.profile?.address || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSave() {
    setError('')
    setSuccess('')
    try {
      await updateProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      })
      setSuccess('Profile updated successfully!')
      setTimeout(() => navigation.goBack(), 1600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed. Please try again.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <FadeSlideIn distance={-16}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit profile</Text>
            <Text style={styles.headerSubtitle}>Update your personal information</Text>
          </View>
        </FadeSlideIn>

        <View style={styles.content}>
          {error ? <AlertBanner type="error" message={error} /> : null}
          {success ? <AlertBanner type="success" message={success} /> : null}

          <FadeSlideIn delay={80}>
          <Card>
            <Text style={styles.sectionTitle}>Personal information</Text>

            <Field label="Full name" optional>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Jane Smith"
                autoComplete="name"
                editable={!isLoading}
                autoCapitalize="words"
              />
            </Field>

            <Field label="Phone" optional>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+84 90 000 0000"
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={!isLoading}
              />
            </Field>

            <Field label="Address" optional>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="123 Street, Ho Chi Minh City"
                autoComplete="street-address"
                editable={!isLoading}
                autoCapitalize="words"
              />
            </Field>
          </Card>
          </FadeSlideIn>

          <Button
            label="Save changes"
            onPress={handleSave}
            loading={isLoading}
          />

          <Button
            label="Cancel"
            onPress={() => navigation.goBack()}
            variant="secondary"
            disabled={isLoading}
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: Spacing['4xl'],
  },

  // ── Header ────────────────────────────────────────
  header: {
    backgroundColor: Colors.greenDeep,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: '600',
    color: Colors.cream,
    letterSpacing: -0.4,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.base,
    color: 'rgba(245,240,232,0.65)',
  },

  // ── Content ───────────────────────────────────────
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: Typography.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textLight,
    marginBottom: Spacing.xl,
  },
  cancelBtn: {
    marginTop: Spacing.md,
  },
})