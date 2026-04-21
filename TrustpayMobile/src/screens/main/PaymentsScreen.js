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
import { transactionApi, bankApi, withdrawalApi, paymentApi, connectApi } from '../../api/apiClient';
import { useStripe } from '@stripe/stripe-react-native';
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
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showBankForm, setShowBankForm] = useState(false);
  const [holderName, setHolderName] = useState('');
  const [iban, setIban] = useState('');

  const { data: connectStatus, isLoading: loadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['connectStatus'],
    queryFn: connectApi.getStatus,
  });

  const connectMutation = useMutation({
    mutationFn: () => connectApi.addBankAccount(holderName.trim(), iban.trim()),
    onSuccess: () => {
      setShowBankForm(false);
      setHolderName('');
      setIban('');
      refetchStatus();
      Alert.alert('Bank Connected!', 'Your bank account has been connected via Stripe. You can now request withdrawals.');
    },
    onError: (e) => Alert.alert('Connection Failed', e.message || 'Failed to connect bank account'),
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount) => withdrawalApi.request(amount),
    onSuccess: () => {
      setWithdrawAmount('');
      Alert.alert('Withdrawal Requested', 'Your request has been submitted. Admin will approve and Stripe will transfer to your bank within 1-3 business days.');
    },
    onError: (e) => Alert.alert('Error', e.message || 'Failed to submit withdrawal request'),
  });

  const handleConnectSubmit = () => {
    if (!holderName.trim()) {
      Alert.alert('Required', 'Please enter the account holder name.');
      return;
    }
    const cleanIban = iban.trim().toUpperCase().replace(/\s/g, '');
    if (cleanIban.length < 15) {
      Alert.alert('Invalid IBAN', 'Please enter a valid IBAN.');
      return;
    }
    connectMutation.mutate();
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
    Alert.alert(
      'Confirm Withdrawal',
      `Request withdrawal of AED ${formatAmount(amount)}?\n\nAdmin will approve and Stripe will transfer to your bank.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => withdrawMutation.mutate(amount) },
      ]
    );
  };

  if (loadingStatus) {
    return <View style={styles.centerContainer}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  const isOnboarded = connectStatus?.onboarded;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.withdrawScroll}>
      {/* Available Balance */}
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

      {/* Stripe Connect Status / Bank Form */}
      <GlassCard style={styles.connectCard}>
        <View style={styles.connectRow}>
          <View style={[styles.connectIcon, { backgroundColor: isOnboarded ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)' }]}>
            <Feather name={isOnboarded ? 'check-circle' : 'credit-card'} size={20} color={isOnboarded ? colors.emerald : colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.connectTitle}>Bank Account</Text>
            <Text style={styles.connectSubtitle}>
              {isOnboarded ? 'Connected via Stripe ✓' : 'Add your bank account to receive withdrawals'}
            </Text>
          </View>
          {!isOnboarded && !showBankForm && (
            <TouchableOpacity
              onPress={() => setShowBankForm(true)}
              style={styles.connectBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.connectBtnText}>Add Bank</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* In-app bank details form */}
        {!isOnboarded && showBankForm && (
          <View style={{ marginTop: 16 }}>
            <BankInputField
              label="Account Holder Name"
              icon="user"
              placeholder="Full name as on bank account"
              value={holderName}
              onChangeText={setHolderName}
              autoCapitalize="words"
            />
            <BankInputField
              label="IBAN"
              icon="hash"
              placeholder="AE07 0331 2345 6789 0123 456"
              value={iban}
              onChangeText={(v) => setIban(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => { setShowBankForm(false); setHolderName(''); setIban(''); }}
                style={[styles.connectFormBtn, { backgroundColor: 'rgba(255,255,255,0.06)', flex: 1 }]}
                activeOpacity={0.8}
              >
                <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConnectSubmit}
                disabled={connectMutation.isPending}
                style={[styles.connectFormBtn, { backgroundColor: colors.accent, flex: 2 }]}
                activeOpacity={0.8}
              >
                {connectMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Connect Bank Account</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.connectNote, { marginTop: 10 }]}>
              Your bank details are securely stored by Stripe. One-time setup — required for withdrawal payouts.
            </Text>
          </View>
        )}
      </GlassCard>

      {/* Withdrawal Amount — only show if connected */}
      {isOnboarded && (
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
      )}
    </ScrollView>
  );
}

// ── Tab: Deposit via Stripe ────────────────────────────────────────────────────
function DepositTab() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const PRESETS = [100, 250, 500, 1000];

  const handleDeposit = async () => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num < 2) {
      Alert.alert('Invalid Amount', 'Minimum deposit is AED 2.00');
      return;
    }

    setLoading(true);
    try {
      const { clientSecret } = await paymentApi.createPaymentIntent(num);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Trustdepo',
        style: 'alwaysDark',
        appearance: {
          colors: {
            primary: '#10b981',
            background: '#0a0a0f',
            componentBackground: '#13131f',
            componentBorder: '#1e1e2e',
            componentDivider: '#1e1e2e',
            primaryText: '#ffffff',
            secondaryText: '#94a3b8',
            componentText: '#ffffff',
            placeholderText: '#64748b',
          },
        },
      });

      if (initError) {
        Alert.alert('Error', initError.message);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment Failed', presentError.message);
        }
      } else {
        Alert.alert('Deposit Successful!', `AED ${formatAmount(num)} has been added to your account.`);
        setAmount('');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.withdrawScroll}>
      <GlassCard style={styles.depositCard}>
        <View style={styles.depositIconRow}>
          <View style={[styles.depositIconWrap, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
            <Feather name="arrow-down-circle" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.depositTitle}>Deposit Funds</Text>
            <Text style={styles.depositSubtitle}>Add money via credit or debit card</Text>
          </View>
        </View>

        {/* Preset amounts */}
        <View style={styles.presetsRow}>
          {PRESETS.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setAmount(String(p))}
              style={[styles.presetBtn, amount === String(p) && styles.presetBtnActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, amount === String(p) && styles.presetTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom amount input */}
        <View style={styles.amountInputRow}>
          <View style={styles.amountInputWrap}>
            <Text style={styles.currencyLabel}>AED</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleDeposit}
          disabled={loading || !amount}
          activeOpacity={0.8}
          style={{ marginTop: 16 }}
        >
          <LinearGradient
            colors={amount ? ['#059669', '#34d399'] : ['#374151', '#1f2937']}
            style={styles.withdrawBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="credit-card" size={20} color="#fff" />
                <Text style={styles.withdrawBtnText}>Pay with Card</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

      <View style={styles.secureNote}>
        <Feather name="lock" size={13} color={colors.textMuted} />
        <Text style={styles.secureNoteText}>Payments are secured by Stripe</Text>
      </View>
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
export default function PaymentsScreen({ navigation }) {
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
            {navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Feather name="arrow-left" size={22} color={colors.text} />
              </TouchableOpacity>
            ) : null}
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
                History
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'deposit' && styles.tabActive]}
              onPress={() => setActiveTab('deposit')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'deposit' && styles.tabTextActive]}>
                Deposit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'withdraw' && styles.tabActive]}
              onPress={() => setActiveTab('withdraw')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === 'withdraw' && styles.tabTextActive]}>
                Withdraw
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
        ) : activeTab === 'deposit' ? (
          <DepositTab />
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
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },

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

  connectCard: { marginBottom: 16, padding: 16 },
  connectRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  connectIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  connectTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  connectSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  connectBtn: { backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  connectBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  connectNote: { color: colors.textMuted, fontSize: 12, marginTop: 10, lineHeight: 18 },
  connectFormBtn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
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

  // Deposit tab
  depositCard: { marginBottom: 16, padding: 16 },
  depositIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  depositIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  depositTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  depositSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  presetsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  presetBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.inputBg,
  },
  presetBtnActive: { borderColor: colors.primary, backgroundColor: 'rgba(16,185,129,0.15)' },
  presetText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  presetTextActive: { color: colors.primary },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 },
  secureNoteText: { color: colors.textMuted, fontSize: 12 },

  // Common
  centerContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyState: { padding: 48, alignItems: 'center', gap: 10 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  emptySubtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
