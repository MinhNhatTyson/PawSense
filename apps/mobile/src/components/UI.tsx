import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme'

// ── PawSense Logo ─────────────────────────────────────────────────────────────

export function PawLogo({ size = 36 }: { size?: number }) {
  // SVG-like paw using View shapes
  const pad = size * 0.18
  const toe = size * 0.2
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Main pad */}
      <View style={{
        width: size * 0.55,
        height: size * 0.48,
        borderRadius: size * 0.16,
        backgroundColor: Colors.cream,
        position: 'absolute',
        bottom: size * 0.08,
      }} />
      {/* Top-left toe */}
      <View style={{
        width: toe,
        height: toe,
        borderRadius: toe / 2,
        backgroundColor: Colors.cream,
        position: 'absolute',
        top: size * 0.06,
        left: size * 0.1,
      }} />
      {/* Top-center toe */}
      <View style={{
        width: toe * 1.1,
        height: toe * 1.1,
        borderRadius: toe * 0.55,
        backgroundColor: Colors.cream,
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
      }} />
      {/* Top-right toe */}
      <View style={{
        width: toe,
        height: toe,
        borderRadius: toe / 2,
        backgroundColor: Colors.cream,
        position: 'absolute',
        top: size * 0.06,
        right: size * 0.1,
      }} />
    </View>
  )
}

// ── Primary Button ────────────────────────────────────────────────────────────

interface ButtonProps {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  style?: ViewStyle
}

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  const containerStyle: ViewStyle[] = [
    styles.btn,
    variant === 'primary' && styles.btnPrimary,
    variant === 'secondary' && styles.btnSecondary,
    variant === 'ghost' && styles.btnGhost,
    variant === 'danger' && styles.btnDanger,
    isDisabled && styles.btnDisabled,
    style ?? {},
  ]

  const textStyle: TextStyle[] = [
    styles.btnText,
    variant === 'primary' && styles.btnTextPrimary,
    variant === 'secondary' && styles.btnTextSecondary,
    variant === 'ghost' && styles.btnTextGhost,
    variant === 'danger' && styles.btnTextDanger,
  ]

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.cream : Colors.greenForest}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

// ── Form Field ────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  children: React.ReactNode
  error?: string
  optional?: boolean
}

export function Field({ label, children, error, optional }: FieldProps) {
  return (
    <View style={fieldStyles.wrap}>
      <View style={fieldStyles.labelRow}>
        <Text style={fieldStyles.label}>{label}</Text>
        {optional && <Text style={fieldStyles.optional}>optional</Text>}
      </View>
      {children}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  )
}

// ── Alert Banner ──────────────────────────────────────────────────────────────

export function AlertBanner({
  type,
  message,
}: {
  type: 'error' | 'success'
  message: string
}) {
  const isError = type === 'error'
  return (
    <View style={[alertStyles.wrap, isError ? alertStyles.wrapError : alertStyles.wrapSuccess]}>
      <Text style={[alertStyles.text, isError ? alertStyles.textError : alertStyles.textSuccess]}>
        {message}
      </Text>
    </View>
  )
}

// ── Section Divider ───────────────────────────────────────────────────────────

export function SectionTitle({ title }: { title: string }) {
  return (
    <View style={sectionStyles.wrap}>
      <Text style={sectionStyles.text}>{title}</Text>
      <View style={sectionStyles.line} />
    </View>
  )
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[cardStyles.card, style]}>
      {children}
    </View>
  )
}

// ── Detail row (profile info) ─────────────────────────────────────────────────

export function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value} numberOfLines={2}>
        {value || <Text style={detailStyles.empty}>Not set</Text>}
      </Text>
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btnPrimary: {
    backgroundColor: Colors.greenDeep,
    ...Shadow.sm,
  },
  btnSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.warmWhite,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(192,58,43,0.15)',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    fontSize: Typography.base,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  btnTextPrimary: {
    color: Colors.cream,
  },
  btnTextSecondary: {
    color: Colors.textBody,
  },
  btnTextGhost: {
    color: Colors.textMuted,
  },
  btnTextDanger: {
    color: Colors.error,
  },
})

const fieldStyles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  optional: {
    fontSize: Typography.xs,
    color: Colors.textLight,
    fontStyle: 'italic',
    textTransform: 'none',
    letterSpacing: 0,
  },
  error: {
    fontSize: Typography.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
})

const alertStyles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  wrapError: {
    backgroundColor: Colors.errorBg,
    borderColor: 'rgba(192,58,43,0.15)',
  },
  wrapSuccess: {
    backgroundColor: Colors.successBg,
    borderColor: 'rgba(45,122,79,0.2)',
  },
  text: {
    fontSize: Typography.base,
    lineHeight: 20,
  },
  textError: {
    color: Colors.error,
  },
  textSuccess: {
    color: Colors.success,
  },
})

const sectionStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  text: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.warmWhite,
  },
})

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
})

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ivory,
    gap: Spacing.lg,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.textLight,
    paddingTop: 2,
    flexShrink: 0,
  },
  value: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  empty: {
    color: Colors.textLight,
    fontStyle: 'italic',
    fontWeight: '400',
  },
})