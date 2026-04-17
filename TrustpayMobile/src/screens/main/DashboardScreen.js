import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { transactionApi } from '../../api/apiClient';
import TransactionCard from '../../components/TransactionCard';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function computeStats(transactions, userEmail) {
  if (!transactions) return { totalHeld: 0, totalReleased: 0, activeCount: 0 };

  const myTx = transactions.filter(
    (tx) => tx.sender_email === userEmail || tx.receiver_email === userEmail
  );

  const activeTx = myTx.filter((tx) => !['released', 'cancelled'].includes(tx.status));
  const releasedTx = myTx.filter((tx) => tx.status === 'released');

  return {
    totalHeld: activeTx.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
    totalReleased: releasedTx.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
    activeCount: activeTx.length,
  };
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  const { data: transactions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getAll,
  });

  const { totalHeld, totalReleased, activeCount } = useMemo(
    () => computeStats(transactions, user?.email),
    [transactions, user?.email]
  );

  const recentTxs = useMemo(() => {
    if (!transactions) return [];
    return [...transactions]
      .filter((tx) => tx.sender_email === user?.email || tx.receiver_email === user?.email)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [transactions, user?.email]);

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#0a0a0f']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewTransaction')}
              style={styles.newBtn}
            >
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.newBtnGradient}>
                <Feather name="plus" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* ── Balance Card (matches web BalanceCard) ── */}
        <GlassCard style={styles.balanceCard}>
          {/* Decorative orbs */}
          <View style={styles.orbTopRight} />
          <View style={styles.orbBottomLeft} />

          <View style={styles.balanceHeader}>
            <Feather name="shield" size={16} color={colors.primary} />
            <Text style={styles.balanceHeaderText}>TrustPay Balance</Text>
          </View>

          <View style={styles.balanceAmountRow}>
            <Text style={styles.balanceCurrency}>AED</Text>
            <Text style={styles.balanceAmount}>
              {totalHeld.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.balanceStatsRow}>
            <View style={styles.balanceStat}>
              <View style={styles.balanceStatIcon}>
                <Feather name="arrow-down-left" size={14} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.balanceStatLabel}>Held</Text>
                <Text style={styles.balanceStatValue}>
                  {activeCount} active
                </Text>
              </View>
            </View>
            <View style={styles.balanceStat}>
              <View style={[styles.balanceStatIcon, { backgroundColor: 'rgba(167,139,250,0.15)' }]}>
                <Feather name="arrow-up-right" size={14} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.balanceStatLabel}>Released</Text>
                <Text style={styles.balanceStatValue}>
                  AED {totalReleased.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* ── New Transaction Quick Action (web-style) ── */}
        <TouchableOpacity
          style={styles.newTxCard}
          onPress={() => navigation.navigate('NewTransaction')}
          activeOpacity={0.8}
        >
          <GlassCard style={styles.newTxCardInner}>
            <View style={styles.newTxIconWrap}>
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.newTxIcon}>
                <Feather name="plus" size={22} color="#fff" />
              </LinearGradient>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.newTxTitle}>New Transaction</Text>
              <Text style={styles.newTxSubtitle}>Create a secure payment</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </GlassCard>
        </TouchableOpacity>

        {/* ── Quick Actions ── */}
        <GlassCard style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('NewTransaction')}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.quickActionIcon}>
                <Feather name="plus-circle" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>New</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Transactions')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(167,139,250,0.15)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' }]}>
                <Feather name="list" size={22} color={colors.accent} />
              </View>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Payments')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(52,211,153,0.15)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' }]}>
                <Feather name="dollar-sign" size={22} color={colors.emerald} />
              </View>
              <Text style={styles.quickActionText}>Payments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(251,191,36,0.15)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)' }]}>
                <Feather name="user" size={22} color={colors.yellow} />
              </View>
              <Text style={styles.quickActionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* ── Recent Transactions ── */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : recentTxs.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Feather name="inbox" size={40} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptySubtitle}>Create your first payment to get started</Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('NewTransaction')}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.emptyBtnGradient}>
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.emptyBtnText}>New Transaction</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ) : (
            recentTxs.map((tx) => (
              <TransactionCard
                key={tx.id || tx._id}
                transaction={tx}
                currentUserEmail={user?.email}
                onPress={() =>
                  navigation.navigate('TransactionDetail', {
                    transactionId: tx.id || tx._id,
                    transaction: tx,
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingBottom: 20 },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  greeting: { color: colors.textMuted, fontSize: 14 },
  userName: { color: colors.text, fontSize: 24, fontWeight: '700' },
  newBtn: { borderRadius: 16, overflow: 'hidden' },
  newBtnGradient: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 32 },

  // Balance card (web-style)
  balanceCard: { marginBottom: 14, padding: 24, overflow: 'hidden' },
  orbTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(167,139,250,0.08)',
  },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  balanceHeaderText: { color: colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 20 },
  balanceCurrency: { color: colors.textMuted, fontSize: 16, marginBottom: 6 },
  balanceAmount: { color: colors.text, fontSize: 38, fontWeight: '800', letterSpacing: -1 },
  balanceStatsRow: { flexDirection: 'row', gap: 28 },
  balanceStat: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  balanceStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceStatLabel: { color: colors.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6 },
  balanceStatValue: { color: colors.text, fontSize: 13, fontWeight: '600', marginTop: 1 },

  // New Transaction card (web-style)
  newTxCard: { marginBottom: 14 },
  newTxCardInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  newTxIconWrap: { borderRadius: 14, overflow: 'hidden' },
  newTxIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  newTxTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  newTxSubtitle: { color: colors.textMuted, fontSize: 13 },

  // Quick actions
  quickActionsCard: { marginBottom: 20 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  quickAction: { alignItems: 'center', gap: 10 },
  quickActionIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickActionText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },

  // Recent transactions
  recentSection: { gap: 0 },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  viewAllText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  loadingContainer: { padding: 40, alignItems: 'center' },

  emptyCard: { padding: 32 },
  emptyContent: { alignItems: 'center' },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  emptyBtn: { borderRadius: 12, overflow: 'hidden' },
  emptyBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
