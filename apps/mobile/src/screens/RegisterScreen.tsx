import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { Button, AlertBanner, PawLogo, SectionTitle } from '../components/UI'
import { Field } from '../components/UI'
import { TextInput } from '../components/TextInput'
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme'
import { FadeSlideIn } from '../components/Motion'

export function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const { register, isLoading } = useAuth()

  // Password strength: 0 = empty, 1 = weak, 2 = fair, 3 = strong
  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength] ?? ''
  const strengthColor = [
    Colors.warmWhite,
    Colors.error,
    Colors.gold,
    Colors.success,
  ][strength] ?? Colors.warmWhite

  async function handleRegister() {
    if (!email.trim()) { setError('Email is required.'); return }
    if (!password) { setError('Password is required.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setError('')
    try {
      await register(email.trim(), password, {
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
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
        {/* Hero */}
        <FadeSlideIn distance={-16}>
          <View style={styles.hero}>
            <View style={styles.logoWrap}>
              <PawLogo size={44} />
            </View>
            <Text style={styles.brandName}>
              Paw<Text style={styles.brandAccent}>Sense</Text>
            </Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>
        </FadeSlideIn>

        {/* Form card */}
        <FadeSlideIn delay={120}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join PawSense</Text>
          <Text style={styles.cardSubtitle}>Track and manage your pet's health in one place</Text>

          {error ? <AlertBanner type="error" message={error} /> : null}

          {/* Personal information */}
          <SectionTitle title="Personal information" />

          <Field label="Full name" optional>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Jane Smith"
              autoComplete="name"
              editable={!isLoading}
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
            />
          </Field>

          {/* Login credentials */}
          <SectionTitle title="Login credentials" />

          <Field label="Email address">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
            />
          </Field>

          <Field label="Password">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              secureToggle
              autoComplete="new-password"
              editable={!isLoading}
            />
            {/* Strength meter */}
            {password.length > 0 && (
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

          <Field label="Confirm password">
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              secureToggle
              autoComplete="new-password"
              editable={!isLoading}
              onSubmitEditing={handleRegister}
              returnKeyType="done"
            />
            {/* Match indicator */}
            {confirmPassword.length > 0 && (
              <Text style={[
                styles.matchText,
                { color: confirmPassword === password ? Colors.success : Colors.error },
              ]}>
                {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
            )}
          </Field>

          <Button
            label="Create account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
        </FadeSlideIn>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.greenDeep,
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Hero ──────────────────────────────────────────
  hero: {
    paddingTop: Spacing['4xl'] + Spacing.lg,
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  brandName: {
    fontFamily: 'System',
    fontSize: Typography['3xl'],
    fontWeight: '300',
    color: Colors.cream,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: Colors.gold,
    fontWeight: '300',
  },
  tagline: {
    fontSize: Typography.base,
    color: 'rgba(245,240,232,0.65)',
    letterSpacing: 0.2,
  },

  // ── Card ─────────────────────────────────────────
  card: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    ...Shadow.lg,
  },
  cardTitle: {
    fontSize: Typography['2xl'],
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
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

  // ── Actions ───────────────────────────────────────
  submitBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.base,
    color: Colors.textMuted,
  },
  footerLink: {
    fontSize: Typography.base,
    color: Colors.greenForest,
    fontWeight: '600',
  },
})