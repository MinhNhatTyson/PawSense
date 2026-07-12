import React, { useEffect, useRef } from 'react'
import { Animated, TouchableOpacity, ViewStyle, Text, StyleSheet } from 'react-native'
import { Colors, Radius, Spacing, Typography } from '../theme'

/** Pulsing placeholder block — replaces ad-hoc SkeletonBlock copies in each screen. */
export function SkeletonBlock({ width, height, style }: { width: number | 'auto' | `${number}%`; height: number; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.3)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])
  return <Animated.View style={[{ width, height, borderRadius: Radius.sm, backgroundColor: Colors.warmWhite, opacity }, style]} />
}

/** Fade + slide-up entrance wrapper for list items / cards, with optional stagger delay. */
export function FadeSlideIn({ children, delay = 0, distance = 20 }: { children: React.ReactNode; delay?: number; distance?: number }) {
  const fade = useRef(new Animated.Value(0)).current
  const slide = useRef(new Animated.Value(distance)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 350, delay, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 65, friction: 11, delay, useNativeDriver: true }),
    ]).start()
  }, [])
  return <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>{children}</Animated.View>
}

/** Press-scale wrapper — replaces manual scaleAnim boilerplate for tappable cards. */
export function PressableScale({
  children, onPress, style, scaleTo = 0.97,
}: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle; scaleTo?: number }) {
  const scale = useRef(new Animated.Value(1)).current
  const pressIn = () => Animated.spring(scale, { toValue: scaleTo, tension: 200, friction: 10, useNativeDriver: true }).start()
  const pressOut = () => Animated.spring(scale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start()
  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </TouchableOpacity>
  )
}

/** Bouncing-icon empty state — replaces per-screen duplicated markup. */
export function EmptyState({ emoji, title, desc, actionLabel, onAction }: {
  emoji: string; title: string; desc: string; actionLabel?: string; onAction?: () => void
}) {
  const bounce = useRef(new Animated.Value(0)).current
  const fade = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -10, duration: 1200, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start()
  }, [])
  return (
    <Animated.View style={[s.wrap, { opacity: fade }]}>
      <Animated.Text style={[s.emoji, { transform: [{ translateY: bounce }] }]}>{emoji}</Animated.Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.desc}>{desc}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={s.btn} activeOpacity={0.85}>
          <Text style={s.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: Spacing['4xl'], paddingHorizontal: Spacing['2xl'], gap: Spacing.md },
  emoji: { fontSize: 64, marginBottom: Spacing.md },
  title: { fontSize: Typography.xl, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },
  desc: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  btn: { marginTop: Spacing.md, backgroundColor: Colors.greenDeep, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full },
  btnText: { color: Colors.cream, fontWeight: '700', fontSize: Typography.base },
})