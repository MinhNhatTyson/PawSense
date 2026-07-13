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
import { Button, AlertBanner, Card, SectionTitle } from '../components/UI'
import { Field } from '../components/UI'
import { TextInput } from '../components/TextInput'
import { Colors, Typography, Spacing } from '../theme'
import { FadeSlideIn } from '../components/Motion'

export function ChangePasswordScreen({ navigation }: any) {
  const { changePassword, isLoading } = useAuth()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Password strength
  const strength =
    next.length === 0 ? 0
    : next.length < 6 ? 1
    : next.length < 10 ? 2
    : 3

  const strengthColor = [
    Colors.warmWhite,
    Colors.error,
    Colors.gold,
    Colors.success,
  ][strength] ?? Colors.warmWhite

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength] ?? ''

  async function handleChange() {
    setError('')
    setSuccess('')

    if (!current) { setError('Please enter your current password.'); return }
    if (!next) { setError('Please enter a new password.'); return }
    if (next.length < 6) { setError('New password must be at least 6 characters.'); return }
    if (next === current) { setError('New password must be different from your current password.'); return }
    if (next !== confirm) { setError('New passwords do not match.'); return }

    try {
      await changePassword(current, next)
      setSuccess('Password changed successfully!')
      setTimeout(() => navigation.goBack(), 1600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed. Please try again.')
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
            <Text style={styles.headerTitle}>Change password</Text>
            <Text style={styles.headerSubtitle}>Keep your account secure with a strong password</Text>
          </View>
        </FadeSlideIn>

        <View style={styles.content}>
          {error ? <AlertBanner type="error" message={error} /> : null}
          {success ? <AlertBanner type="success" message={success} /> : null}

          {/* Current password */}
          <FadeSlideIn delay={60}>
          <Card>
            <SectionTitle title="Current password" />

            <Field label="Current password">
              <TextInput
                value={current}
                onChangeText={setCurrent}
                placeholder="••••••••"
                secureTextEntry
                secureToggle
                autoComplete="current-password"
                editable={!isLoading}
              />
            </Field>
          </Card>
          </FadeSlideIn>

          {/* New password */}
          <FadeSlideIn delay={110}>
          <Card>
            <SectionTitle title="New password" />

            <Field label="New password">
              <TextInput
                value={next}
                onChangeText={setNext}
                placeholder="••••••••"
                secureTextEntry
                secureToggle
                autoComplete="new-password"
                editable={!isLoading}
              />
              {/* Strength meter */}
              {next.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3].map(i => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i <= strength ? strengthColor : Colors.warmWhite },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                    {strengthLabel}
                  </Text>
                </View>
              )}
            </Field>

            <Field label="Confirm new password">
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="••••••••"
                secureTextEntry
                secureToggle
                autoComplete="new-password"
                editable={!isLoading}
                onSubmitEditing={handleChange}
                returnKeyType="done"
              />
              {/* Match indicator */}
              {confirm.length > 0 && (
                <Text style={[
                  styles.matchText,
                  { color: confirm === next ? Colors.success : Colors.error },
                ]}>
                  {confirm === next ? '✓ Passwords match' : '✗ Passwords do not match'}
                </Text>
              )}
            </Field>
          </Card>
          </FadeSlideIn>

          <Button
            label="Update password"
            onPress={handleChange}
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
  cancelBtn: {
    marginTop: Spacing.md,
  },

  // ── Password helpers ──────────────────────────────
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  strengthBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: Typography.sm,
    fontWeight: '500',
  },
  matchText: {
    fontSize: Typography.sm,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
})