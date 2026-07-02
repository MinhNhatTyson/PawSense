import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { Card, DetailRow } from '../components/UI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme'

export function ProfileScreen({ navigation }: any) {
  const { user, logout, isLoading } = useAuth()

  const initials = (
    user?.profile?.fullName?.charAt(0) ||
    user?.email?.charAt(0) ||
    '?'
  ).toUpperCase()

  function handleLogout() {
    if (Platform.OS === 'web') {
      // Custom styled confirmation instead of bare window.confirm
      const modal = document.createElement('div')
      modal.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(26, 58, 42, 0.45);
        backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, 'DM Sans', sans-serif;
      `
      modal.innerHTML = `
        <div style="
          background: #faf7f2;
          border-radius: 20px;
          padding: 32px 28px 24px;
          width: 320px;
          box-shadow: 0 24px 64px rgba(26,58,42,0.18);
          text-align: center;
        ">
          <div style="
            width: 52px; height: 52px; border-radius: 50%;
            background: #fdf0ee;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 18px;
            font-size: 22px;
          ">🐾</div>
          <h2 style="
            margin: 0 0 8px;
            font-size: 18px; font-weight: 700;
            color: #1a1a18; letter-spacing: -0.3px;
          ">Sign out of PawSense?</h2>
          <p style="
            margin: 0 0 28px;
            font-size: 14px; color: #6b6b63; line-height: 1.5;
          ">Your cats and health records will be waiting when you return.</p>
          <div style="display: flex; gap: 10px;">
            <button id="ps-cancel" style="
              flex: 1; padding: 13px;
              border-radius: 12px; border: 1.5px solid #ede8df;
              background: #fff; font-size: 15px; font-weight: 600;
              color: #3d3d38; cursor: pointer;
            ">Cancel</button>
            <button id="ps-confirm" style="
              flex: 1; padding: 13px;
              border-radius: 12px; border: none;
              background: #c03a2b; font-size: 15px; font-weight: 600;
              color: #fff; cursor: pointer;
            ">Sign out</button>
          </div>
        </div>
      `
      document.body.appendChild(modal)

      const cleanup = () => document.body.removeChild(modal)
      document.getElementById('ps-cancel')!.onclick = cleanup
      document.getElementById('ps-confirm')!.onclick = () => { cleanup(); logout() }
      modal.onclick = (e) => { if (e.target === modal) cleanup() }
      return
    }

    Alert.alert(
      'Sign out of PawSense?',
      'Your cats and health records will be waiting when you return.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: logout },
      ]
    )
  }

  if (!user) return null

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      {/* Hero banner */}
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.heroName}>
          {user.profile?.fullName || 'Pet Owner'}
        </Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>Pet Owner</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>

        {/* Contact info */}
        <Text style={styles.sectionHeading}>Contact information</Text>
        <Card>
          <DetailRow label="Email" value={user.email} />
          {user.profile?.phone ? (
            <DetailRow label="Phone" value={user.profile.phone} />
          ) : null}
          {user.profile?.address ? (
            <DetailRow label="Address" value={user.profile.address} />
          ) : null}
          {!user.profile?.phone && !user.profile?.address && (
            <Text style={styles.emptyHint}>
              No additional contact information added yet.
            </Text>
          )}
        </Card>

        {/* Account actions */}
        <Text style={styles.sectionHeading}>Account</Text>

        <ActionRow
          emoji="✎"
          title="Edit profile"
          desc="Update your name, phone, and address"
          onPress={() => navigation.navigate('EditProfile')}
        />

        <ActionRow
          emoji="🐱"
          title="My cats"
          desc="Manage cat profiles and health records"
          onPress={() => navigation.navigate('CatList')}
        />

        <ActionRow
          emoji="🔒"
          title="Change password"
          desc="Update your login credentials"
          onPress={() => navigation.navigate('ChangePassword')}
        />

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.signOutText}>
            {isLoading ? 'Signing out…' : 'Sign out'}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  )
}

// ── Reusable action row ───────────────────────────────────────────────────────
function ActionRow({
  emoji,
  title,
  desc,
  onPress,
}: {
  emoji: string
  title: string
  desc: string
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={styles.actionRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionIcon}>
        <Text style={styles.actionIconText}>{emoji}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{desc}</Text>
      </View>
      <Text style={styles.actionChevron}>›</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    paddingBottom: Spacing['4xl'],
  },

  // ── Hero ──────────────────────────────────────────
  hero: {
    backgroundColor: Colors.greenDeep,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['4xl'],
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.greenPale,
    borderWidth: 3,
    borderColor: Colors.greenSage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: Typography['3xl'],
    fontWeight: '500',
    color: Colors.greenForest,
  },
  heroName: {
    fontSize: Typography.xl,
    fontWeight: '600',
    color: Colors.cream,
    letterSpacing: -0.3,
  },
  rolePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rolePillText: {
    fontSize: Typography.sm,
    color: Colors.cream,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // ── Content ───────────────────────────────────────
  content: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
  },
  sectionHeading: {
    fontSize: Typography.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textLight,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyHint: {
    fontSize: Typography.base,
    color: Colors.textLight,
    fontStyle: 'italic',
    paddingVertical: Spacing.md,
  },

  // ── Action rows ───────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionIconText: { fontSize: 18 },
  actionContent: { flex: 1 },
  actionTitle: {
    fontSize: Typography.base,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  actionChevron: {
    fontSize: 22,
    color: Colors.textLight,
    lineHeight: 26,
  },

  // ── Sign out ──────────────────────────────────────
  signOutBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(192,58,43,0.18)',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.error,
  },
})