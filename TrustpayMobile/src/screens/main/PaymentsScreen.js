import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { transactionApi, bankApi, withdrawalApi } from '../../api/apiClient';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function computeBalance(transactions, userEmail) {
  let available = 0;
  let pending = 0;
  if (!transactions) return { available: 0, pending: 0 };

  transactions.forEach((tx) => {
    const isReceiver = tx.receiver_email === userEmail;
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

function StatusIcon({ status }) {
  const iconMap = {
    released: { name: 'check-circle', color: colors.emerald },
    funded: { name: 'shield', color: colors.primary },
    sender_confirmed: { name: 'check', color: colors.primaryLight },
    receiver_confirmed: { name: 'check-circle', color: colors.accent },
    pending_deposit: { name: 'clock', color: colors.yellow },
    disputed: { name: 'alert-triangle', color: colors.destructive },
    cancelled: { name: 'x-circle', color: colors.textMuted },
  };
  const cfg = iconMap[status] || { name: 'circle', color: colors.textMuted };
  return <Feather name={cfg.name} size={16} color={cfg.color} />;
}

// ── Tab: Transaction Log ────────────────────────────────────────────────────────
function TransactionLogTab({ transactions, userEmail, isLoading, refetch, isRefetching }) {
  const sorted = useMemo(() => {
    if (!transactions) return [];
    return [...transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [transactions]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (sorted.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="inbox" size={48} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptySubtitle}>Your transaction history will appear here</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.logList}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      {sorted.map((tx) => {
        const isSender = tx.sender_email === userEmail;
        const isReceiver = tx.receiver_email === userEmail;
        const sign = isSender ? '-' : '+';
        const amountColor = isSender ? colors.destructive : colors.emerald;
        const counterparty = isSender
          ? (tx.receiver_name || tx.receiver_email || 'Unknown')
          : (tx.sender_name || tx.sender_email || 'Unknown');

        return (
          <View key={tx.id || tx._id} style={styles.logRow}>
            <View style={styles.logIconWrap}>
              <StatusIcon status={tx.status} />
            </View>
            <View style={styles.logInfo}>
              <Text style={styles.logTitle} numberOfLines={1}>
                {tx.title || 'Transaction'}
              </Text>
              <Text style={styles.logCounterparty} numberOfLines={1}>
                {isSender ? 'To: ' : 'From: '}{counterparty}
              </Text>
              <Text style={styles.logDate}>{formatDate(tx.created_at)}</Text>
            </View>
            <View style={styles.logRight}>
              <Text style={[styles.logAmount, { color: amountColor }]}>
                {sign} AED {formatAmount(tx.amount)}
              </Text>
              <Text style={styles.logStatus}>
                {(tx.status || '').replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ── Tab: Withdraw to Bank ──────────────────────────────────────────────────────
function WithdrawTab({ availableBalance }) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [bankForm, setBankForm] = useState({ bank_name: '', iban: '', account_name: '' });
  const [bankErrors, setBankErrors] = useState({});
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const { data: bankAccounts, isLoading: loadingBanks, refetch: refetchBanks } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankApi.getAll,
  });

  const addBankMutation = useMutation({
    mutationFn: bankApi.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      setBankForm({ bank_name: '', iban: '', account_name: '' });
      setShowAddForm(false);
      Alert.alert('Success', 'Bank account added successfully!');
    },
    onError: (e) => Alert.alert('Error', e.message || 'Failed to add bank account'),
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount) => withdrawalApi.request(amount),
    onSuccess: () => {
      setWithdrawAmount('');
      Alert.alert('Withdrawal Requested', 'Your withdrawal request has been submitted. Funds will be transferred within 1-3 business days.');
    },
    onError: (e) => Alert.alert('Error', e.message || 'Failed to submit withdrawal request'),
  });

  const setBankField = (key, val) => {
    setBankForm((p) => ({ ...p, [key]: val }));
    setBankErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateBankForm = () => {
    const e = {};
    if (!bankForm.bank_name.trim()) e.bank_name = 'Bank name is required';
    if (!bankForm.iban.trim()) e.iban = 'IBAN is required';
    else if (bankForm.iban.trim().length < 15) e.iban = 'Enter a valid IBAN';
    if (!bankForm.account_name.trim()) e.account_name = 'Account name is required';
    return e;
  };

  const handleAddBank = () => {
    const e = validateBankForm();
    if (Object.keys(e).length) { setBankErrors(e); return; }
    addBankMutation.mutate({
      bank_name: bankForm.bank_name.trim(),
      iban: bankForm.iban.trim().toUpperCase(),
      account_name: bankForm.account_name.trim(),
    });
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!withdrawAmount.trim() || isNaN(amount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (amount < 100) {
      Alert.alert('Minimum Amount', 'The minimum withdrawal amount is AED 100.');
      return;
    }
    if (amount > availableBalance) {
      Alert.alert('Insufficient Balance', `Your available balance is AED ${formatAmount(availableBalance)}.`);
      return;
    }
    if (!selectedAccountId) {
      Alert.alert('Select Account', 'Please select a bank account to withdraw to.');
      return;
    }
    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw AED ${formatAmount(amount)} to your selected bank account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => withdrawMutation.mutate(amount) },
      ]
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.withdrawScroll}>
      {/* Available Balance Summary */}
      <GlassCard style={styles.availableCard}>
        <View style={styles.availableRow}>
          <View style={[styles.availableIconWrap, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
            <Feather name="check-circle" size={20} color={colors.emerald} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.availableLabel}>Available to Withdraw</Text>
            <Text style={styles.availableAmount}>AED {formatAmount(availableBalance)}</Text>
          </View>
        </View>
        <Text style={styles.availableNote}>Min. withdrawal: AED 100.00</Text>
      </GlassCard>

      {/* Bank Accounts Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bank Accounts</Text>
        <TouchableOpacity
          onPress={() => setShowAddForm((p) => !p)}
          style={styles.addBankBtn}
          activeOpacity={0.8}
        >
          <Feather name={showAddForm ? 'x' : 'plus'} size={16} color={colors.primary} />
          <Text style={styles.addBankBtnText}>{showAddForm ? 'Cancel' : 'Add Account'}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Bank Account Form */}
      {showAddForm && (
        <GlassCard style={styles.addBankCard}>
          <Text style={styles.addBankTitle}>Add Bank Account</Text>

          <BankInputField
            label="Bank Name *"
            icon="briefcase"
            placeholder="e.g. Emirates NBD"
            value={bankForm.bank_name}
            onChangeText={(v) => setBankField('bank_name', v)}
            error={bankErrors.bank_name}
          />
          <BankInputField
            label="IBAN *"
            icon="hash"
            placeholder="AE070331234567890123456"
            value={bankForm.iban}
            onChangeText={(v) => setBankField('iban', v.replace(/\s/g, ''))}
            autoCapitalize="characters"
            error={bankErrors.iban}
          />
          <BankInputField
            label="Account Holder Name *"
            icon="user"
            placeholder="Full name as on account"
            value={bankForm.account_name}
            onChangeText={(v) => setBankField('account_name', v)}
            autoCapitalize="words"
            error={bankErrors.account_name}
          />

          <TouchableOpacity
            onPress={handleAddBank}
            disabled={addBankMutation.isPending}
            activeOpacity={0.8}
            style={{ marginTop: 4 }}
          >
            <LinearGradient colors={['#059669', '#10b981']} style={styles.addBankSubmitBtn}>
              {addBankMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="plus" size={18} color="#fff" />
                  <Text style={styles.addBankSubmitText}>Add Bank Account</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      )}

      {/* Existing Bank Accounts */}
      {loadingBanks ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !bankAccounts || bankAccounts.length === 0 ? (
        <GlassCard style={styles.noBanksCard}>
          <Feather name="credit-card" size={32} color={colors.textMuted} />
          <Text style={styles.noBanksText}>No bank accounts added</Text>
          <Text style={styles.noBanksSubtext}>Add a bank account to withdraw funds</Text>
        </GlassCard>
      ) : (
        <View style={styles.bankList}>
          {bankAccounts.map((acct) => {
            const id = acct.id || acct._id;
            const isSelected = selectedAccountId === id;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => setSelectedAccountId(isSelected ? null : id)}
                activeOpacity={0.8}
                style={[styles.bankAccountCard, isSelected && styles.bankAccountCardSelected]}
              >
                <View style={[styles.bankIconWrap, isSelected && { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                  <Feather name="credit-card" size={20} color={isSelected ? colors.primary : colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bankName}>{acct.bank_name}</Text>
                  <Text style={styles.bankIban}>
                    {acct.iban
                      ? `${acct.iban.slice(0, 4)} •••• •••• ${acct.iban.slice(-4)}`
                      : 'IBAN not available'}
                  </Text>
                  <Text style={styles.bankAccountName}>{acct.account_name}</Text>
                </View>
                {isSelected && (
                  <View style={styles.selectedCheckWrap}>
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Withdrawal Amount */}
      <GlassCard style={styles.withdrawCard}>
        <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
        <Text style={styles.withdrawHint}>Minimum: AED 100.00</Text>
        <View style={styles.amountInputRow}>
          <View style={styles.amountInputWrap}>
            <Text style={styles.currencyLabel}>AED</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={withdrawAmount}
              onChangeText={(v) => setWithdrawAmount(v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
            />
          </View>
          <TouchableOpacity
            onPress={() => setWithdrawAmount(String(Math.floor(availableBalance)))}
            style={styles.maxBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.maxBtnText}>MAX</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleWithdraw}
          disabled={withdrawMutation.isPending || availableBalance <= 0}
          activeOpacity={0.8}
          style={{ marginTop: 16 }}
        >
          <LinearGradient
            colors={availableBalance > 0 ? ['#059669', '#34d399'] : ['#374151', '#1f2937']}
            style={styles.withdrawBtn}
          >
            {withdrawMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="arrow-up-circle" size={20} color="#fff" />
                <Text style={styles.withdrawBtnText}>Request Withdrawal</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>
    </ScrollView>
  );
}

// ── Input Field Helper ─────────────────────────────────────────────────────────
function BankInputField({ label, icon, error, ...props }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <Feather name={icon} size={18} color={colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
      </View>
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function PaymentsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('log');

  const {
    data: transactions,
    isLoading: loadingTx,
    refetch: refetchTx,
    isRefetching,
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionApi.getAll,
  });

  const { available, pending } = useMemo(
    () => computeBalance(transactions, user?.email),
    [transactions, user?.email]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a2e', '#0a0a0f']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Payments</Text>
          </View>

          {/* Balance Cards */}
          <View style={styles.balanceRow}>
            <GlassCard style={styles.balanceCard}>
              <View style={styles.balanceIconRow}>
                <View style={[styles.balanceIcon, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
                  <Feather name="check-circle" size={16} color={colors.emerald} />
                </View>
                <Text style={styles.balanceLabel}>Available</Text>
              </View>
              <Text style={styles.balanceAmount}>AED {formatAmount(available)}</Text>
            </GlassCard>
            <GlassCard style={styles.balanceCard}>
              <View style={styles.balanceIconRow}>
                <View style={[styles.balanceIcon, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                  <Feather name="clock" size={16} color={colors.yellow} />
                </View>
                <Text style={styles.balanceLabel}>Pending</Text>
              </View>
              <Text style={styles.balanceAmount}>AED {formatAmount(pending)}</Text>
            </GlassCard>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'log' && styles.tabActive]}
              onPress={() => setActiveTab('log')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'log' && styles.tabTextActive]}>
                Transaction Log
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'withdraw' && styles.tabActive]}
              onPress={() => setActiveTab('withdraw')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'withdraw' && styles.tabTextActive]}>
                Withdraw to Bank
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tab Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {activeTab === 'log' ? (
          <TransactionLogTab
            transactions={transactions}
            userEmail={user?.email}
            isLoading={loadingTx}
            refetch={refetchTx}
            isRefetching={isRefetching}
          />
        ) : (
          <WithdrawTab availableBalance={available} />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: { paddingBottom: 0 },
  headerContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },

  // Balance row
  balanceRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  balanceCard: { flex: 1 },
  balanceIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  balanceIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  balanceLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  balanceAmount: { color: colors.text, fontSize: 16, fontWeight: '700' },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: colors.primary },

  // Transaction Log
  logList: { padding: 16, paddingBottom: 32 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,46,0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
  },
  logIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logInfo: { flex: 1, marginRight: 8 },
  logTitle: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  logCounterparty: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  logDate: { color: colors.textMuted, fontSize: 11 },
  logRight: { alignItems: 'flex-end' },
  logAmount: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  logStatus: { color: colors.textMuted, fontSize: 11, textTransform: 'capitalize' },

  // Withdraw tab
  withdrawScroll: { padding: 16, paddingBottom: 40 },

  availableCard: { marginBottom: 20, padding: 16 },
  availableRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  availableIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  availableLabel: { color: colors.textMuted, fontSize: 13 },
  availableAmount: { color: colors.emerald, fontSize: 22, fontWeight: '800' },
  availableNote: { color: colors.textMuted, fontSize: 12, marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  addBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBankBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  addBankCard: { marginBottom: 16, padding: 16 },
  addBankTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },

  // Input field
  inputGroup: { marginBottom: 12 },
  inputLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
  },
  inputWrapperError: { borderColor: colors.destructive },
  inputIcon: { marginLeft: 14, marginRight: 8 },
  textInput: { flex: 1, color: colors.text, fontSize: 15, padding: 13, paddingLeft: 0 },
  inputError: { color: colors.destructive, fontSize: 12, marginTop: 4 },

  addBankSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  addBankSubmitText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  noBanksCard: { alignItems: 'center', padding: 32, marginBottom: 16, gap: 8 },
  noBanksText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  noBanksSubtext: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },

  bankList: { marginBottom: 16 },
  bankAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26,26,46,0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  bankAccountCardSelected: { borderColor: colors.primary, backgroundColor: 'rgba(16,185,129,0.08)' },
  bankIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  bankIban: { color: colors.textMuted, fontSize: 13, marginBottom: 1, letterSpacing: 0.5 },
  bankAccountName: { color: colors.textMuted, fontSize: 12 },
  selectedCheckWrap: { marginLeft: 'auto' },

  withdrawCard: { padding: 16 },
  withdrawHint: { color: colors.textMuted, fontSize: 12, marginBottom: 12 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amountInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  currencyLabel: { color: colors.textSecondary, fontSize: 15, fontWeight: '600', marginRight: 8 },
  amountInput: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '600' },
  maxBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  maxBtnText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 15,
    gap: 8,
  },
  withdrawBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Common
  centerContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyState: { padding: 48, alignItems: 'center', gap: 10 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  emptySubtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
