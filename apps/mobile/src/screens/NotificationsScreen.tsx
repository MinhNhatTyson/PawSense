import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { notificationAPI, type AppNotification } from '../api/notificationAPI'
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme'
import { SkeletonBlock, FadeSlideIn, EmptyState } from '../components/Motion'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function NotificationRow({
  n,
  onPress,
}: {
  n: AppNotification
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[rowStyles.card, !n.read && rowStyles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {!n.read && <View style={rowStyles.unreadDot} />}
      <View style={rowStyles.body}>
        <Text style={rowStyles.title}>{n.title}</Text>
        <Text style={rowStyles.message}>{n.message}</Text>
        <Text style={rowStyles.time}>{timeAgo(n.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const rowStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.warmWhite,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  cardUnread: {
    backgroundColor: Colors.greenPale,
    borderColor: 'rgba(74,124,95,0.25)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.greenForest,
    marginTop: 6,
    flexShrink: 0,
  },
  body: { flex: 1, gap: 3 },
  title: { fontSize: Typography.base, fontWeight: '700', color: Colors.textPrimary },
  message: { fontSize: Typography.sm, color: Colors.textBody, lineHeight: 19 },
  time: { fontSize: Typography.xs, color: Colors.textLight, marginTop: 2 },
})

/** Skeleton placeholder row, shown while the list is first loading. */
function NotificationSkeletonRow() {
  return (
    <View style={rowStyles.card}>
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBlock width="55%" height={16} />
        <SkeletonBlock width="90%" height={14} />
        <SkeletonBlock width="30%" height={11} />
      </View>
    </View>
  )
}

export function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setError('')
      const res = await notificationAPI.list()
      setNotifications(res.data)
      setUnreadCount(res.unreadCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // silent — user can retry
    }
  }

  const handlePress = async (n: AppNotification) => {
    if (!n.read) {
      try {
        await notificationAPI.markRead(n.id)
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
        setUnreadCount(c => Math.max(0, c - 1))
      } catch {
        // silent
      }
    }
    if (n.contentType === 'APPOINTMENT') {
      navigation.navigate('MyAppointments')
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.greenDeep} />

      <FadeSlideIn distance={-16}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </Text>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </FadeSlideIn>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load() }}
            tintColor={Colors.greenSage}
          />
        }
      >
        {loading ? (
          <>
            <NotificationSkeletonRow />
            <NotificationSkeletonRow />
            <NotificationSkeletonRow />
          </>
        ) : error ? (
          <View style={styles.centred}>
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <EmptyState
            emoji="🔔"
            title="No notifications yet"
            desc="Appointment updates and record approvals will show up here."
          />
        ) : (
          notifications.map((n, i) => (
            <FadeSlideIn key={n.id} delay={i * 60} distance={14}>
              <NotificationRow n={n} onPress={() => handlePress(n)} />
            </FadeSlideIn>
          ))
        )}
        <View style={{ height: Spacing['4xl'] }} />
      </ScrollView>
    </View>
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
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: Colors.cream, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: Typography.sm, color: 'rgba(245,240,232,0.62)', marginTop: 2 },
  markAllText: { fontSize: Typography.sm, color: Colors.gold, fontWeight: '600' },
  scroll: { padding: Spacing['2xl'] },
  centred: { alignItems: 'center', paddingVertical: Spacing['4xl'], gap: Spacing.sm },
  stateText: { fontSize: Typography.base, color: Colors.textMuted, textAlign: 'center' },
})