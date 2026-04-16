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

function computeBalance(transactions, userEmail) {
  let available = 0;
  let pending = 0;
  if (!transactions) return { available: 0, pending: 0 };

  transactions.forEach((tx) => {
    const isReceiver = tx.receiver_email === userEmail;
    const isSender = tx.sender_email === userEmail;
    const amount = Number(tx.amount) || 0;

    if (tx.status === 'released' && isReceiver) {
      available += amount;
    }
    if (['funded', 'sender_confirmed', 'receiver_confirmed'].includes(tx.status) && isReceiver) {
      pending += amount;
    }
  });
  return { available, pending };
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  const { data: transactions, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getAll,
  });

  const { available, pending } = useMemo(
    () => computeBalance(transactions, user?.email),
    [transactions, user?.email]
  );

  const recentTxs = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  }, [transactions]);

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
              style={styles.newEscrowBtn}
            >
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.newEscrowGradient}>
                <Feather name="plus" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Balance Cards */}
        <View style={styles.balanceRow}>
          <GlassCard style={styles.balanceCard}>
            <View style={styles.balanceIconRow}>
              <View style={[styles.balanceIcon, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
                <Feather name="check-circle" size={18} color={colors.emerald} />
              </View>
              <Text style={styles.balanceLabel}>Available</Text>
            </View>
            <Text style={styles.balanceAmount}>AED {Number(available).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </GlassCard>
          <GlassCard style={styles.balanceCard}>
            <View style={styles.balanceIconRow}>
              <View style={[styles.balanceIcon, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                <Feather name="clock" size={18} color={colors.yellow} />
              </View>
              <Text style={styles.balanceLabel}>Pending</Text>
            </View>
            <Text style={styles.balanceAmount}>AED {Number(pending).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </GlassCard>
        </View>

        {/* Quick Actions */}
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
              <Text style={styles.quickActionText}>New Escrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Transactions')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(167,139,250,0.15)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' }]}>
                <Feather name="list" size={22} color={colors.accent} />
              </View>
              <Text style={styles.quickActionText}>View All</Text>
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

        {/* Recent Transactions */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
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
                <Text style={styles.emptySubtitle}>Create your first escrow to get started</Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => navigation.navigate('NewTransaction')}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.emptyBtnGradient}>
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.emptyBtnText}>New Escrow</Text>
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
                onPress={() => navigation.navigate('TransactionDetail', { transactionId: tx.id || tx._id, transaction: tx })}
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
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  greeting: { color: colors.textMuted, fontSize: 14 },
  userName: { color: colors.text, fontSize: 24, fontWeight: '700' },
  newEscrowBtn: { borderRadius: 16, overflow: 'hidden' },
  newEscrowGradient: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 32 },
  balanceRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  balanceCard: { flex: 1 },
  balanceIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  balanceIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  balanceLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  balanceAmount: { color: colors.text, fontSize: 18, fontWeight: '700' },
  quickActionsCard: { marginBottom: 20 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  quickAction: { alignItems: 'center', gap: 8 },
  quickActionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickActionText: { color: colors.textSecondary, fontSize: 12, fontWeight: '500' },
  recentSection: { gap: 0 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  viewAllText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  emptyCard: { padding: 32 },
  emptyContent: { alignItems: 'center' },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  emptyBtn: { borderRadius: 12, overflow: 'hidden' },
  emptyBtnGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
