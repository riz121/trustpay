import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { transactionApi, api, paymentApi } from '../../api/apiClient';
import { useStripe } from '@stripe/stripe-react-native';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

const EMPTY_FORM = {
  title: '', amount: '', receiver_email: '', receiver_username: '',
  receiver_name: '', notes: '', release_date: '',
};

export default function NewTransactionScreen({ navigation }) {
  const queryClient = useQueryClient();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [lookupLoading, setLookupLoading] = useState(false);
  const [receiverMode, setReceiverMode] = useState('email'); // 'email' | 'username'
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Reset form every time this screen is focused (handles back-navigation & tab press)
  useFocusEffect(
    useCallback(() => {
      setForm(EMPTY_FORM);
      setErrors({});
      setLookupLoading(false);
      setReceiverMode('email');
    }, [])
  );

  const setField = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  // Look up a user by @username and auto-fill email + name
  const handleUsernameLookup = async () => {
    const username = form.receiver_username.replace(/^@/, '').trim();
    if (!username) {
      setErrors((e) => ({ ...e, receiver_username: 'Enter a username to look up' }));
      return;
    }
    setLookupLoading(true);
    try {
      const result = await api.get(`/api/user/lookup?username=${encodeURIComponent(username)}`);
      if (result?.email) {
        setForm((p) => ({
          ...p,
          receiver_email: result.email,
          receiver_name: result.full_name || p.receiver_name,
        }));
        setErrors((e) => ({ ...e, receiver_username: '' }));
        Alert.alert('User Found', `Found: ${result.full_name || result.email}`);
      }
    } catch (e) {
      setErrors((e2) => ({ ...e2, receiver_username: 'User not found. Check the username.' }));
    } finally {
      setLookupLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount.trim()) {
      e.amount = 'Amount is required';
    } else if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      e.amount = 'Enter a valid amount';
    } else if (Number(form.amount) < 2) {
      e.amount = 'Minimum amount is £2.00';
    }
    if (!form.receiver_email.trim()) {
      e.receiver_email = 'Receiver email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.receiver_email.trim())) {
      e.receiver_email = 'Enter a valid email address';
    }
    return e;
  };

  const createMutation = useMutation({
    mutationFn: () =>
      transactionApi.createEscrow({
        title: form.title.trim(),
        amount: Number(form.amount),
        receiver_email: form.receiver_email.trim().toLowerCase(),
        receiver_name: form.receiver_name.trim() || undefined,
        notes: form.notes.trim() || undefined,
        release_date: form.release_date.trim() || undefined,
      }),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      const txId = data?.id || data?._id || data?.transaction?.id;
      const txData = data?.transaction || data;

      if (!txId) {
        Alert.alert('Error', 'Transaction created but ID missing.');
        navigation.getParent()?.navigate('Home');
        return;
      }

      setPaymentProcessing(true);
      try {
        // Step 1 — create Stripe PaymentIntent (manual capture)
        const { clientSecret, paymentIntentId } = await paymentApi.createPaymentIntent(
          Number(form.amount),
          txId
        );

        // Step 2 — initialise Payment Sheet
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'TrustDepo',
          style: 'alwaysDark',
        });
        if (initError) {
          Alert.alert('Payment Error', initError.message);
          navigation.getParent()?.navigate('Home', {
            screen: 'TransactionDetail',
            params: { transactionId: txId, transaction: txData },
          });
          return;
        }

        // Step 3 — present Payment Sheet
        const { error: paymentError } = await presentPaymentSheet();
        if (paymentError) {
          if (paymentError.code !== 'Canceled') {
            Alert.alert('Payment Failed', paymentError.message);
          }
          // Still navigate to transaction — user can pay later from TransactionDetail
          navigation.getParent()?.navigate('Home', {
            screen: 'TransactionDetail',
            params: { transactionId: txId, transaction: txData },
          });
          return;
        }

        // Step 4 — mark transaction funded in our backend
        const funded = await paymentApi.fundTransaction(txId, paymentIntentId);
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        Alert.alert('Funds Held!', 'Payment authorised. Funds are held securely until you release.', [
          {
            text: 'View Transaction',
            onPress: () =>
              navigation.getParent()?.navigate('Home', {
                screen: 'TransactionDetail',
                params: { transactionId: txId, transaction: funded },
              }),
          },
        ]);
      } catch (err) {
        Alert.alert('Error', err.message || 'Payment processing failed');
        navigation.getParent()?.navigate('Home', {
          screen: 'TransactionDetail',
          params: { transactionId: txId, transaction: txData },
        });
      } finally {
        setPaymentProcessing(false);
      }
    },
    onError: (e) => Alert.alert('Error', e.message || 'Failed to create transaction'),
  });

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    createMutation.mutate();
  };

  const formatReleaseDateHint = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0f0f1a' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info banner */}
          <GlassCard style={styles.infoBanner}>
            <View style={styles.infoBannerContent}>
              <View style={styles.infoIcon}>
                <Feather name="shield" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoBannerTitle}>How it Works</Text>
                <Text style={styles.infoBannerText}>
                  Funds are held securely until both parties confirm. Create the transaction, add funds, and release when satisfied.
                </Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={styles.formCard}>
            <Text style={styles.sectionLabel}>Transaction Info</Text>

            <InputField
              label="Title *"
              icon="tag"
              placeholder="e.g. Website Design Project"
              value={form.title}
              onChangeText={(v) => setField('title', v)}
              error={errors.title}
            />

            <InputField
              label="Amount (£) *"
              icon="dollar-sign"
              placeholder="0.00"
              value={form.amount}
              onChangeText={(v) => setField('amount', v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              error={errors.amount}
            />

            <View style={styles.divider} />

            {/* Receiver section with email/username toggle */}
            <View style={styles.receiverHeader}>
              <Text style={styles.sectionLabel}>Receiver</Text>
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  onPress={() => setReceiverMode('email')}
                  style={[styles.modeBtn, receiverMode === 'email' && styles.modeBtnActive]}
                >
                  <Text style={[styles.modeBtnText, receiverMode === 'email' && styles.modeBtnTextActive]}>
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setReceiverMode('username')}
                  style={[styles.modeBtn, receiverMode === 'username' && styles.modeBtnActive]}
                >
                  <Text style={[styles.modeBtnText, receiverMode === 'username' && styles.modeBtnTextActive]}>
                    @Username
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {receiverMode === 'username' ? (
              <View style={{ marginBottom: 14 }}>
                <Text style={inputStyles.label}>@Username *</Text>
                <View style={[inputStyles.wrapper, errors.receiver_username && inputStyles.wrapperError]}>
                  <Feather name="at-sign" size={18} color={colors.textMuted} style={inputStyles.icon} />
                  <TextInput
                    style={inputStyles.input}
                    placeholder="username"
                    placeholderTextColor={colors.textMuted}
                    value={form.receiver_username}
                    onChangeText={(v) => setField('receiver_username', v.replace(/^@+/, ''))}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={handleUsernameLookup}
                    disabled={lookupLoading}
                    style={styles.lookupBtn}
                  >
                    {lookupLoading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.lookupBtnText}>Find</Text>
                    )}
                  </TouchableOpacity>
                </View>
                {errors.receiver_username ? (
                  <Text style={inputStyles.errorText}>{errors.receiver_username}</Text>
                ) : null}
                {form.receiver_email ? (
                  <Text style={styles.resolvedEmail}>
                    <Feather name="check-circle" size={12} color={colors.emerald} /> Resolved: {form.receiver_email}
                  </Text>
                ) : null}
              </View>
            ) : (
              <InputField
                label="Receiver Email *"
                icon="mail"
                placeholder="receiver@example.com"
                value={form.receiver_email}
                onChangeText={(v) => setField('receiver_email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.receiver_email}
              />
            )}

            <InputField
              label="Receiver Name (Optional)"
              icon="user"
              placeholder="John Doe"
              value={form.receiver_name}
              onChangeText={(v) => setField('receiver_name', v)}
              autoCapitalize="words"
              error={errors.receiver_name}
            />

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Additional Info</Text>

            <View style={{ marginBottom: 14 }}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <View style={[styles.textAreaWrapper, errors.notes && styles.inputError]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Any additional details about this transaction..."
                  placeholderTextColor={colors.textMuted}
                  value={form.notes}
                  onChangeText={(v) => setField('notes', v)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <InputField
              label="Release Date (Optional)"
              icon="calendar"
              placeholder={`e.g. ${formatReleaseDateHint()}`}
              value={form.release_date}
              onChangeText={(v) => setField('release_date', v)}
              error={errors.release_date}
            />
            <Text style={styles.fieldHint}>Format: YYYY-MM-DD</Text>
          </GlassCard>

          {/* Summary */}
          {(form.title || form.amount || form.receiver_email) ? (
            <GlassCard style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              {form.title ? <SummaryRow label="Title" value={form.title} /> : null}
              {form.amount ? (
                <SummaryRow
                  label="Amount"
                  value={`£${Number(form.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                />
              ) : null}
              {form.receiver_email ? <SummaryRow label="To" value={form.receiver_email} /> : null}
            </GlassCard>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={createMutation.isPending || paymentProcessing}
            style={{ marginTop: 8 }}
          >
            <LinearGradient colors={['#059669', '#10b981']} style={styles.submitBtn}>
              {createMutation.isPending || paymentProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="shield" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>Create Transaction</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function InputField({ label, icon, error, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={[inputStyles.wrapper, error && inputStyles.wrapperError]}>
        <Feather name={icon} size={18} color={colors.textMuted} style={inputStyles.icon} />
        <TextInput
          style={inputStyles.input}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
      </View>
      {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={summaryStyles.row}>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.value}>{value}</Text>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 6 },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
  },
  wrapperError: { borderColor: colors.destructive },
  icon: { marginLeft: 14, marginRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: 15, padding: 14, paddingLeft: 0 },
  errorText: { color: colors.destructive, fontSize: 12, marginTop: 4 },
});

const summaryStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { color: colors.textMuted, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },
  infoBanner: { marginBottom: 16, padding: 14 },
  infoBannerContent: { flexDirection: 'row', gap: 12 },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerTitle: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  infoBannerText: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  formCard: { marginBottom: 16 },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  inputLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 6 },
  textAreaWrapper: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 14,
  },
  textArea: { color: colors.text, fontSize: 15, height: 100 },
  inputError: { borderColor: colors.destructive },
  fieldHint: { color: colors.textMuted, fontSize: 12, marginTop: -10, marginBottom: 14, marginLeft: 2 },
  summaryCard: { marginBottom: 16 },
  summaryTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 10 },
  submitBtn: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  // Receiver mode toggle
  receiverHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modeToggle: { flexDirection: 'row', backgroundColor: colors.inputBg, borderRadius: 8, padding: 2 },
  modeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  modeBtnTextActive: { color: '#fff' },
  lookupBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 1,
    borderLeftColor: colors.inputBorder,
  },
  lookupBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  resolvedEmail: { color: colors.emerald, fontSize: 12, marginTop: 4, marginLeft: 2 },
});
