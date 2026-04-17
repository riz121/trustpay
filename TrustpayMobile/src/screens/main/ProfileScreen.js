import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { transactionApi, authApi } from '../../api/apiClient';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

function getPlanBadge(plan) {
  switch ((plan || '').toLowerCase()) {
    case 'standard':
      return { label: 'Standard', bg: 'rgba(99,102,241,0.2)', color: colors.primary };
    case 'pro':
      return { label: 'Pro', bg: 'rgba(167,139,250,0.2)', color: colors.accent };
    case 'free':
    default:
      return {
        label: plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free',
        bg: 'rgba(100,116,139,0.2)',
        color: colors.textMuted,
      };
  }
}

function getInitials(fullName, email) {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '??';
}

function MenuItem({ icon, label, onPress, color, showChevron = true }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.menuItem}>
      <View style={[styles.menuIconWrap, { backgroundColor: color ? `${color}22` : colors.inputBg }]}>
        <Feather name={icon} size={18} color={color || colors.textSecondary} />
      </View>
      <Text style={[styles.menuLabel, color && { color }]}>{label}</Text>
      {showChevron && (
        <Feather name="chevron-right" size={18} color={colors.textMuted} style={styles.menuChevron} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getAll,
  });

  const stats = useMemo(() => {
    const myTx = transactions.filter(
      (t) => t.sender_email === user?.email || t.receiver_email === user?.email
    );
    const active = myTx.filter(
      (t) => !['released', 'cancelled', 'disputed'].includes(t.status)
    ).length;
    const totalVolume = myTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    return { total: myTx.length, active, totalVolume };
  }, [transactions, user?.email]);

  const initials = getInitials(user?.full_name, user?.email);
  const planBadge = getPlanBadge(user?.plan);
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete your account and all associated data. Active transactions may be affected. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await authApi.deleteMe();
            } catch {
              // Proceed with logout regardless
            } finally {
              logout();
            }
          },
        },
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'TrustPay collects and processes your personal data in accordance with the UAE Data Protection Law and GDPR. We do not share your data with third parties without your consent.',
      [{ text: 'OK' }]
    );
  };

  const handleSecurity = () => {
    Alert.alert(
      'Security',
      'Your account is protected with AES-256 encryption and bank-level security. All funds are held in segregated accounts at a licensed UAE bank.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient colors={['#1a1a2e', '#0a0a0f']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          {/* Avatar + User Info */}
          <View style={styles.profileCard}>
            <LinearGradient colors={['#6366f1', '#a78bfa']} style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              {user?.username ? (
                <Text style={styles.profileUsername}>@{user.username}</Text>
              ) : null}
              <Text style={styles.profileEmail} numberOfLines={1}>{user?.email || ''}</Text>
              <View style={[styles.planBadge, { backgroundColor: planBadge.bg }]}>
                <Text style={[styles.planBadgeText, { color: planBadge.color }]}>
                  {planBadge.label} Plan
                </Text>
              </View>
            </View>
          </View>

          {/* Edit profile link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editProfileBtn}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={12} color={colors.primary} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid (matches web) */}
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats.totalVolume >= 1000
                ? `${(stats.totalVolume / 1000).toFixed(1)}K`
                : stats.totalVolume.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Volume</Text>
          </GlassCard>
        </View>

        {/* Menu: Account */}
        <GlassCard style={styles.menuCard}>
          <Text style={styles.menuGroupLabel}>Account</Text>
          <MenuItem
            icon="edit-2"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="list"
            label="Transaction History"
            onPress={() => navigation.navigate('Home', { screen: 'Dashboard' })}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="credit-card"
            label="Payments & Withdrawals"
            onPress={() => navigation.navigate('Payments')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="shield"
            label="Security"
            onPress={handleSecurity}
          />
        </GlassCard>

        {/* Menu: Support */}
        <GlassCard style={styles.menuCard}>
          <Text style={styles.menuGroupLabel}>Support</Text>
          <MenuItem
            icon="help-circle"
            label="Help & FAQ"
            onPress={() => navigation.navigate('FAQ')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="file-text"
            label="Terms & Conditions"
            onPress={() => navigation.navigate('Terms')}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="lock"
            label="Privacy Policy"
            onPress={handlePrivacy}
          />
        </GlassCard>

        {/* Logout */}
        <GlassCard style={styles.menuCard}>
          <MenuItem
            icon="log-out"
            label="Sign Out"
            onPress={handleLogout}
            color={colors.destructive}
            showChevron={false}
          />
        </GlassCard>

        {/* Delete Account */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
          style={styles.deleteBtn}
        >
          <Feather name="trash-2" size={16} color={colors.textMuted} />
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TrustPay · UAE</Text>
          <Text style={styles.footerSubText}>Secure payments, simplified</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { paddingBottom: 16 },
  headerContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },

  profileCard: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, gap: 16 },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  profileInfo: { flex: 1, paddingTop: 4 },
  profileName: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 2 },
  profileUsername: { color: colors.primary, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  profileEmail: { color: colors.textMuted, fontSize: 13, marginBottom: 8 },
  planBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  planBadgeText: { fontSize: 12, fontWeight: '700' },

  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  editProfileText: { color: colors.primary, fontSize: 12, fontWeight: '600' },

  scroll: { padding: 16, paddingBottom: 40 },

  // Stats grid
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 16 },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  menuCard: { marginBottom: 12, padding: 0, overflow: 'hidden' },
  menuGroupLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '500' },
  menuChevron: { marginLeft: 'auto' },
  menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: 64 },

  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginBottom: 8,
  },
  deleteBtnText: { color: colors.textMuted, fontSize: 14 },

  footer: { alignItems: 'center', marginTop: 8 },
  footerText: { color: colors.textMuted, fontSize: 11 },
  footerSubText: { color: colors.textMuted, fontSize: 10, opacity: 0.5, marginTop: 2 },
});
