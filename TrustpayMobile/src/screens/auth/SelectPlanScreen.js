import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'AED 0',
    period: '/month',
    color: colors.textMuted,
    gradient: ['#374151', '#1f2937'],
    features: ['3 escrow transactions/month', 'Basic dispute resolution', 'Email support'],
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 'AED 49',
    period: '/month',
    color: colors.primary,
    gradient: ['#6366f1', '#8b5cf6'],
    features: ['50 escrow transactions/month', 'Priority dispute resolution', '24/7 support', 'Lower fees'],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'AED 149',
    period: '/month',
    color: colors.emerald,
    gradient: ['#059669', '#34d399'],
    features: ['Unlimited transactions', 'Dedicated account manager', 'API access', 'Custom integrations', 'Lowest fees'],
    popular: false,
  },
];

export default function SelectPlanScreen({ navigation }) {
  const { updateUser, user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [profile, setProfile] = useState({ phone: '', city: '', company: '', emirates_id: '' });
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setProfileField = (key, val) => {
    setProfile((p) => ({ ...p, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };
  const setPaymentField = (key, val) => {
    setPayment((p) => ({ ...p, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateProfile = () => {
    const e = {};
    if (!profile.phone.trim()) e.phone = 'Phone number is required';
    if (!profile.city.trim()) e.city = 'City is required';
    return e;
  };

  const validatePayment = () => {
    const e = {};
    if (selectedPlan !== 'free') {
      if (!payment.cardNumber.trim()) e.cardNumber = 'Card number required';
      if (!payment.expiry.trim()) e.expiry = 'Expiry required';
      if (!payment.cvv.trim()) e.cvv = 'CVV required';
      if (!payment.name.trim()) e.name = 'Cardholder name required';
    }
    return e;
  };

  const next = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const e = validateProfile();
      if (Object.keys(e).length) { setErrors(e); return; }
      if (selectedPlan === 'free') {
        finishSetup();
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      const e = validatePayment();
      if (Object.keys(e).length) { setErrors(e); return; }
      finishSetup();
    }
  };

  const finishSetup = async () => {
    setLoading(true);
    try {
      await updateUser({
        full_name: user?.full_name,
        phone: profile.phone.trim(),
        city: profile.city.trim(),
        company: profile.company.trim(),
        emirates_id: profile.emirates_id.trim(),
        plan: selectedPlan,
        plan_selected_at: new Date().toISOString(),
      });
      // Navigation handled by AppNavigator
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Progress Steps */}
            <View style={styles.stepsRow}>
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <View style={[styles.stepCircle, s <= step ? styles.stepActive : styles.stepInactive]}>
                    {s < step ? (
                      <Feather name="check" size={14} color="#fff" />
                    ) : (
                      <Text style={[styles.stepNum, s === step ? styles.stepNumActive : styles.stepNumInactive]}>{s}</Text>
                    )}
                  </View>
                  {s < 3 && <View style={[styles.stepLine, s < step ? styles.stepLineActive : styles.stepLineInactive]} />}
                </React.Fragment>
              ))}
            </View>
            <Text style={styles.stepLabel}>
              {step === 1 ? 'Choose Your Plan' : step === 2 ? 'Complete Your Profile' : 'Payment Details'}
            </Text>

            {/* Step 1: Plan Selection */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>Select a plan that works for you</Text>
                {PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.planCard,
                      selectedPlan === plan.id && { borderColor: plan.color, borderWidth: 2 },
                    ]}
                  >
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Most Popular</Text>
                      </View>
                    )}
                    <View style={styles.planHeader}>
                      <View>
                        <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
                        <View style={styles.planPriceRow}>
                          <Text style={styles.planPrice}>{plan.price}</Text>
                          <Text style={styles.planPeriod}>{plan.period}</Text>
                        </View>
                      </View>
                      <View style={[styles.planRadio, selectedPlan === plan.id && { borderColor: plan.color }]}>
                        {selectedPlan === plan.id && <View style={[styles.planRadioInner, { backgroundColor: plan.color }]} />}
                      </View>
                    </View>
                    <View style={styles.planFeatures}>
                      {plan.features.map((f, i) => (
                        <View key={i} style={styles.featureRow}>
                          <Feather name="check" size={14} color={plan.color} />
                          <Text style={styles.featureText}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Step 2: Profile Form */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>Tell us about yourself</Text>
                <View style={styles.formCard}>
                  <InputField
                    label="Phone Number *"
                    icon="phone"
                    placeholder="+971 50 123 4567"
                    value={profile.phone}
                    onChangeText={(v) => setProfileField('phone', v)}
                    keyboardType="phone-pad"
                    error={errors.phone}
                  />
                  <InputField
                    label="City *"
                    icon="map-pin"
                    placeholder="Dubai"
                    value={profile.city}
                    onChangeText={(v) => setProfileField('city', v)}
                    error={errors.city}
                  />
                  <InputField
                    label="Company (Optional)"
                    icon="briefcase"
                    placeholder="Your company name"
                    value={profile.company}
                    onChangeText={(v) => setProfileField('company', v)}
                  />
                  <InputField
                    label="Emirates ID (Optional)"
                    icon="credit-card"
                    placeholder="784-XXXX-XXXXXXX-X"
                    value={profile.emirates_id}
                    onChangeText={(v) => setProfileField('emirates_id', v)}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>
                  {selectedPlan === 'free' ? 'No payment required' : 'Enter payment details'}
                </Text>
                {selectedPlan !== 'free' && (
                  <View style={styles.formCard}>
                    <View style={styles.selectedPlanInfo}>
                      <Text style={styles.selectedPlanText}>
                        {PLANS.find((p) => p.id === selectedPlan)?.name} Plan
                      </Text>
                      <Text style={styles.selectedPlanPrice}>
                        {PLANS.find((p) => p.id === selectedPlan)?.price}/month
                      </Text>
                    </View>
                    <View style={styles.divider} />
                    <InputField
                      label="Card Number"
                      icon="credit-card"
                      placeholder="1234 5678 9012 3456"
                      value={payment.cardNumber}
                      onChangeText={(v) => setPaymentField('cardNumber', formatCardNumber(v))}
                      keyboardType="number-pad"
                      error={errors.cardNumber}
                    />
                    <View style={styles.row2}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <InputField
                          label="Expiry"
                          icon="calendar"
                          placeholder="MM/YY"
                          value={payment.expiry}
                          onChangeText={(v) => setPaymentField('expiry', formatExpiry(v))}
                          keyboardType="number-pad"
                          error={errors.expiry}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <InputField
                          label="CVV"
                          icon="lock"
                          placeholder="123"
                          value={payment.cvv}
                          onChangeText={(v) => setPaymentField('cvv', v.replace(/\D/g, '').slice(0, 4))}
                          keyboardType="number-pad"
                          secureTextEntry
                          error={errors.cvv}
                        />
                      </View>
                    </View>
                    <InputField
                      label="Cardholder Name"
                      icon="user"
                      placeholder="John Doe"
                      value={payment.name}
                      onChangeText={(v) => setPaymentField('name', v)}
                      autoCapitalize="words"
                      error={errors.name}
                    />
                    <View style={styles.secureNote}>
                      <Feather name="lock" size={14} color={colors.emerald} />
                      <Text style={styles.secureText}>Payments are secured with 256-bit encryption</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity onPress={next} activeOpacity={0.8} disabled={loading} style={{ marginTop: 16 }}>
              <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.nextBtn}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.nextBtnText}>
                      {step === 3 || (step === 2 && selectedPlan === 'free') ? 'Get Started' : 'Continue'}
                    </Text>
                    <Feather name="arrow-right" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function InputField({ label, icon, error, style, ...props }) {
  return (
    <View style={[{ marginBottom: 14 }, style]}>
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

const inputStyles = StyleSheet.create({
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 6 },
  wrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12 },
  wrapperError: { borderColor: colors.destructive },
  icon: { marginLeft: 14, marginRight: 8 },
  input: { flex: 1, color: colors.text, fontSize: 15, padding: 14, paddingLeft: 0 },
  errorText: { color: colors.destructive, fontSize: 12, marginTop: 4 },
});

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginTop: 8 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: colors.primary },
  stepInactive: { backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 1, borderColor: colors.border },
  stepNum: { fontSize: 14, fontWeight: '700' },
  stepNumActive: { color: '#fff' },
  stepNumInactive: { color: colors.textMuted },
  stepLine: { flex: 1, height: 2, marginHorizontal: 8, maxWidth: 60 },
  stepLineActive: { backgroundColor: colors.primary },
  stepLineInactive: { backgroundColor: colors.border },
  stepLabel: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginBottom: 20 },
  stepContent: { marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  planCard: { backgroundColor: 'rgba(26,26,46,0.8)', borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  popularBadge: { backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  popularText: { color: colors.primary, fontSize: 11, fontWeight: '600' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  planName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  planPrice: { fontSize: 22, fontWeight: '800', color: colors.text },
  planPeriod: { fontSize: 14, color: colors.textMuted },
  planRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  planRadioInner: { width: 12, height: 12, borderRadius: 6 },
  planFeatures: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { color: colors.textSecondary, fontSize: 14 },
  formCard: { backgroundColor: 'rgba(26,26,46,0.8)', borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 20 },
  row2: { flexDirection: 'row' },
  selectedPlanInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  selectedPlanText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  selectedPlanPrice: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  secureText: { color: colors.emerald, fontSize: 13 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, padding: 16, gap: 8 },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
