import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
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
      return { label: plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free', bg: 'rgba(100,116,139,0.2)', color: colors.textMuted };
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

  const initials = getInitials(user?.full_name, user?.email);
  const planBadge = getPlanBadge(user?.plan);
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleFAQ = () => {
    Alert.alert(
      'FAQ',
      'TrustPay escrow service securely holds funds between buyers and sellers until all conditions are met. For more help, visit our website or contact support@trustpay.ae',
      [{ text: 'OK' }]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'By using TrustPay, you agree to our Terms of Service. All escrow transactions are governed by UAE Commercial law. TrustPay acts as a neutral third-party custodian of funds.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'TrustPay collects and processes your personal data in accordance with the UAE Data Protection Law and GDPR. We do not share your data with third parties without your consent.',
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
              <Text style={styles.profileEmail} numberOfLines={1}>{user?.email || ''}</Text>
              <View style={[styles.planBadge, { backgroundColor: planBadge.bg }]}>
                <Text style={[styles.planBadgeText, { color: planBadge.color }]}>
                  {planBadge.label} Plan
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Details Summary */}
        {(user?.phone || user?.city || user?.company) && (
          <GlassCard style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Account Details</Text>
            {user?.phone ? (
              <View style={styles.detailRow}>
                <Feather name="phone" size={15} color={colors.textMuted} />
                <Text style={styles.detailText}>{user.phone}</Text>
              </View>
            ) : null}
            {user?.city ? (
              <View style={styles.detailRow}>
                <Feather name="map-pin" size={15} color={colors.textMuted} />
                <Text style={styles.detailText}>{user.city}</Text>
              </View>
            ) : null}
            {user?.company ? (
              <View style={styles.detailRow}>
                <Feather name="briefcase" size={15} color={colors.textMuted} />
                <Text style={styles.detailText}>{user.company}</Text>
              </View>
            ) : null}
          </GlassCard>
        )}

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
            icon="shield"
            label="Security"
            onPress={() => Alert.alert('Security', 'Your account is protected with bank-level security and encrypted data storage.')}
          />
        </GlassCard>

        {/* Menu: Support */}
        <GlassCard style={styles.menuCard}>
          <Text style={styles.menuGroupLabel}>Support</Text>
          <MenuItem icon="help-circle" label="FAQ" onPress={handleFAQ} />
          <View style={styles.menuDivider} />
          <MenuItem icon="file-text" label="Terms of Service" onPress={handleTerms} />
          <View style={styles.menuDivider} />
          <MenuItem icon="lock" label="Privacy Policy" onPress={handlePrivacy} />
        </GlassCard>

        {/* Logout */}
        <GlassCard style={styles.menuCard}>
          <MenuItem
            icon="log-out"
            label="Logout"
            onPress={handleLogout}
            color={colors.destructive}
            showChevron={false}
          />
        </GlassCard>

        {/* Version */}
        <Text style={styles.versionText}>TrustPay v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: { paddingBottom: 24 },
  headerContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  profileInfo: { flex: 1 },
  profileName: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 2 },
  profileEmail: { color: colors.textMuted, fontSize: 14, marginBottom: 8 },
  planBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  planBadgeText: { fontSize: 12, fontWeight: '700' },

  scroll: { padding: 16, paddingBottom: 40 },

  detailsCard: { marginBottom: 12, padding: 16 },
  detailsTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  detailText: { color: colors.textSecondary, fontSize: 14 },

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

  versionText: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 8 },
});
