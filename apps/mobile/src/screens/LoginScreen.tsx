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
import { Button, AlertBanner, PawLogo } from '../components/UI'
import { TextInput } from '../components/TextInput'
import { Field } from '../components/UI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme'

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
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
        {/* Hero panel */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <PawLogo size={44} />
          </View>
          <Text style={styles.brandName}>
            Paw<Text style={styles.brandAccent}>Sense</Text>
          </Text>
          <Text style={styles.tagline}>Your pet's health companion</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          {error ? <AlertBanner type="error" message={error} /> : null}

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
              autoComplete="password"
              editable={!isLoading}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
          </Field>

          <Button
            label="Sign in"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to PawSense? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacer */}
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
    paddingTop: Spacing['4xl'] + Spacing.xl,
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
    fontFamily: 'System',
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