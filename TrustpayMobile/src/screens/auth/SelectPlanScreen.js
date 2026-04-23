import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { COUNTRIES } from '../../data/countries';

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'AE');

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '£0',
    period: '/month',
    color: colors.textMuted,
    gradient: ['#374151', '#1f2937'],
    features: ['3 transactions/month', 'Basic dispute resolution', 'Email support'],
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '£49',
    period: '/month',
    color: colors.primary,
    gradient: ['#059669', '#10b981'],
    features: ['50 transactions/month', 'Priority dispute resolution', '24/7 support', 'Lower fees'],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '£149',
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
  const [profile, setProfile] = useState({
    phone: '', city: '', company: '', emirates_id: '', passport_number: '',
    date_of_birth: '', address: '', gender: '', accountType: 'individual',
    howDidYouHear: '', howDidYouHearOther: '', vatNumber: '',
  });
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY);
  const isUAE = selectedCountry?.code === 'AE';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(new Date(2000, 0, 1));
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPhoneCodeModal, setShowPhoneCodeModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  const filteredPhoneCountries = useMemo(() => {
    const q = phoneSearch.toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phoneCode.includes(q)
    );
  }, [phoneSearch]);

  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [countrySearch]);

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
    if (!profile.date_of_birth.trim()) e.date_of_birth = 'Date of birth is required';
    if (!profile.address.trim()) e.address = 'Address is required';
    if (!profile.gender) e.gender = 'Please select your gender';
    if (!selectedCountry) e.country = 'Country is required';
    if (isUAE && !profile.emirates_id.trim()) e.emirates_id = 'Emirates ID is required';
    if (!isUAE && !profile.passport_number.trim()) e.passport_number = 'Passport number is required';
    if (!profile.howDidYouHear) e.howDidYouHear = 'Please tell us how you heard about us';
    if (profile.howDidYouHear === 'Other' && !profile.howDidYouHearOther.trim()) {
      e.howDidYouHearOther = 'Please specify how you heard about us';
    }
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
      setStep(3);
    } else if (step === 3) {
      if (!termsAccepted) {
        Alert.alert('Agreement Required', 'Please accept the Terms & Conditions to continue.');
        return;
      }
      if (selectedPlan === 'free') {
        finishSetup();
      } else {
        setStep(4);
      }
    } else if (step === 4) {
      const e = validatePayment();
      if (Object.keys(e).length) { setErrors(e); return; }
      finishSetup();
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishSetup = async () => {
    setLoading(true);
    try {
      const howHear = profile.howDidYouHear === 'Other'
        ? profile.howDidYouHearOther.trim()
        : profile.howDidYouHear;
      await updateUser({
        full_name: user?.full_name,
        phone: `${phoneCountry.phoneCode}${profile.phone.trim()}`,
        city: profile.city.trim(),
        company: profile.company.trim() || undefined,
        emirates_id: isUAE ? profile.emirates_id.trim() : undefined,
        passport_number: !isUAE ? profile.passport_number.trim() : undefined,
        date_of_birth: profile.date_of_birth.trim(),
        address: profile.address.trim(),
        gender: profile.gender,
        account_type: profile.accountType,
        country: selectedCountry?.name || '',
        how_did_you_hear: howHear || undefined,
        vat_number: profile.vatNumber.trim() || undefined,
        plan: selectedPlan,
        plan_selected_at: new Date().toISOString(),
      });
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

            {/* Back button header */}
            {step > 1 && (
              <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
                <Feather name="arrow-left" size={20} color={colors.text} />
              </TouchableOpacity>
            )}

            {/* Progress Steps */}
            <View style={styles.stepsRow}>
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <View style={[styles.stepCircle, s <= step ? styles.stepActive : styles.stepInactive]}>
                    {s < step ? (
                      <Feather name="check" size={14} color="#fff" />
                    ) : (
                      <Text style={[styles.stepNum, s === step ? styles.stepNumActive : styles.stepNumInactive]}>{s}</Text>
                    )}
                  </View>
                  {s < 4 && <View style={[styles.stepLine, s < step ? styles.stepLineActive : styles.stepLineInactive]} />}
                </React.Fragment>
              ))}
            </View>
            <Text style={styles.stepLabel}>
              {step === 1 ? 'Choose Your Plan' : step === 2 ? 'Complete Your Profile' : step === 3 ? 'Terms & Conditions' : 'Payment Details'}
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

                  {/* Phone Number with country code */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={inputStyles.label}>Phone Number *</Text>
                    <View style={[inputStyles.wrapper, errors.phone && inputStyles.wrapperError]}>
                      <TouchableOpacity
                        onPress={() => { setPhoneSearch(''); setShowPhoneCodeModal(true); }}
                        activeOpacity={0.7}
                        style={styles.phoneCodeBtn}
                      >
                        <Text style={styles.phoneCodeFlag}>{phoneCountry.flag}</Text>
                        <Text style={styles.phoneCodeText}>{phoneCountry.phoneCode}</Text>
                        <Feather name="chevron-down" size={13} color={colors.textMuted} />
                      </TouchableOpacity>
                      <View style={styles.phoneCodeDivider} />
                      <TextInput
                        style={inputStyles.input}
                        placeholder="50 123 4567"
                        placeholderTextColor={colors.textMuted}
                        value={profile.phone}
                        onChangeText={(v) => setProfileField('phone', v)}
                        keyboardType="phone-pad"
                      />
                    </View>
                    {errors.phone ? <Text style={inputStyles.errorText}>{errors.phone}</Text> : null}
                  </View>

                  <InputField
                    label="City *"
                    icon="map-pin"
                    placeholder="Dubai"
                    value={profile.city}
                    onChangeText={(v) => setProfileField('city', v)}
                    error={errors.city}
                  />

                  {/* Country picker */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={inputStyles.label}>Country *</Text>
                    <TouchableOpacity
                      onPress={() => { setCountrySearch(''); setShowCountryModal(true); }}
                      activeOpacity={0.7}
                      style={[inputStyles.wrapper, errors.country && inputStyles.wrapperError]}
                    >
                      <Feather name="globe" size={18} color={colors.textMuted} style={inputStyles.icon} />
                      {selectedCountry ? (
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 18 }}>{selectedCountry.flag}</Text>
                          <Text style={[inputStyles.input, { paddingLeft: 0, flex: 1 }]}>{selectedCountry.name}</Text>
                        </View>
                      ) : (
                        <Text style={[inputStyles.input, { paddingLeft: 0, color: colors.textMuted }]}>Select country</Text>
                      )}
                      <Feather name="chevron-down" size={16} color={colors.textMuted} style={{ marginRight: 14 }} />
                    </TouchableOpacity>
                    {errors.country ? <Text style={inputStyles.errorText}>{errors.country}</Text> : null}
                  </View>

                  <DatePickerField
                    label="Date of Birth *"
                    value={profile.date_of_birth}
                    onPress={() => setShowDatePicker(true)}
                    error={errors.date_of_birth}
                  />
                  <InputField
                    label="Address *"
                    icon="home"
                    placeholder="Street, area, city"
                    value={profile.address}
                    onChangeText={(v) => setProfileField('address', v)}
                    autoCapitalize="sentences"
                    error={errors.address}
                  />

                  {/* Gender */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={inputStyles.label}>Gender *</Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {['Male', 'Female', 'Other'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => setProfileField('gender', option)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 10,
                            borderWidth: 1.5,
                            borderColor: profile.gender === option ? colors.primary : colors.inputBorder,
                            backgroundColor: profile.gender === option ? 'rgba(16,185,129,0.15)' : colors.inputBg,
                          }}
                        >
                          <Text style={{ color: profile.gender === option ? colors.primary : colors.textMuted, fontWeight: '600' }}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {errors.gender ? <Text style={inputStyles.errorText}>{errors.gender}</Text> : null}
                  </View>

                  {/* Account Type */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={inputStyles.label}>Account Type *</Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {['Individual', 'Organisation'].map((option) => {
                        const val = option.toLowerCase();
                        return (
                          <TouchableOpacity
                            key={option}
                            onPress={() => setProfileField('accountType', val)}
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 10,
                              borderRadius: 10,
                              borderWidth: 1.5,
                              borderColor: profile.accountType === val ? colors.primary : colors.inputBorder,
                              backgroundColor: profile.accountType === val ? 'rgba(16,185,129,0.15)' : colors.inputBg,
                            }}
                          >
                            <Text style={{ color: profile.accountType === val ? colors.primary : colors.textMuted, fontWeight: '600' }}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* How did you hear about us */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={inputStyles.label}>How did you hear about us? *</Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {['Social Media', 'Friend', 'Google', 'App Store', 'Other'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          onPress={() => setProfileField('howDidYouHear', option)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 10,
                            borderWidth: 1.5,
                            borderColor: profile.howDidYouHear === option ? colors.primary : colors.inputBorder,
                            backgroundColor: profile.howDidYouHear === option ? 'rgba(16,185,129,0.15)' : colors.inputBg,
                          }}
                        >
                          <Text style={{ color: profile.howDidYouHear === option ? colors.primary : colors.textMuted, fontWeight: '600' }}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {errors.howDidYouHear ? <Text style={inputStyles.errorText}>{errors.howDidYouHear}</Text> : null}
                    {profile.howDidYouHear === 'Other' && (
                      <View style={[inputStyles.wrapper, { marginTop: 10, borderColor: errors.howDidYouHearOther ? colors.destructive : colors.inputBorder }]}>
                        <Feather name="edit-2" size={18} color={colors.textMuted} style={inputStyles.icon} />
                        <TextInput
                          style={inputStyles.input}
                          placeholder="Please specify..."
                          placeholderTextColor={colors.textMuted}
                          value={profile.howDidYouHearOther}
                          onChangeText={(v) => setProfileField('howDidYouHearOther', v)}
                          autoCapitalize="sentences"
                        />
                      </View>
                    )}
                    {errors.howDidYouHearOther ? <Text style={inputStyles.errorText}>{errors.howDidYouHearOther}</Text> : null}
                  </View>

                  <InputField
                    label="Company (Optional)"
                    icon="briefcase"
                    placeholder="Your company name"
                    value={profile.company}
                    onChangeText={(v) => setProfileField('company', v)}
                    autoCapitalize="words"
                  />
                  <InputField
                    label="VAT Number (Optional)"
                    icon="hash"
                    placeholder="e.g. 100123456789003"
                    value={profile.vatNumber}
                    onChangeText={(v) => setProfileField('vatNumber', v)}
                  />
                  {isUAE ? (
                    <InputField
                      label="Emirates ID *"
                      icon="credit-card"
                      placeholder="784-XXXX-XXXXXXX-X"
                      value={profile.emirates_id}
                      onChangeText={(v) => setProfileField('emirates_id', v)}
                      keyboardType="number-pad"
                      error={errors.emirates_id}
                    />
                  ) : (
                    <InputField
                      label="Passport Number *"
                      icon="book-open"
                      placeholder="e.g. AB1234567"
                      value={profile.passport_number}
                      onChangeText={(v) => setProfileField('passport_number', v)}
                      autoCapitalize="characters"
                      error={errors.passport_number}
                    />
                  )}
                </View>
              </View>
            )}

            {/* Step 3: Terms & Conditions */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                <ScrollView
                  style={styles.termsBox}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  {[
                    { title: '1. Secure Payment Service', body: 'TrustDepo holds funds securely between two parties until both confirm the transaction is complete or a dispute is resolved.' },
                    { title: '2. User Obligations', body: 'You must provide accurate information, use the platform lawfully, and not engage in fraud, money laundering, or any activity that violates UAE law.' },
                    { title: '3. Fees', body: 'Transaction fees apply based on your selected plan. Fees are non-refundable once a transaction is initiated.' },
                    { title: '4. Disputes', body: 'Disputes must be filed within 30 days of transaction creation. Trustdepo will review evidence from both parties and issue a binding decision within 5 business days.' },
                    { title: '5. Data & Privacy', body: 'Your personal data is processed in accordance with the UAE Personal Data Protection Law (PDPL). We do not sell your data to third parties.' },
                    { title: '6. Limitation of Liability', body: 'TrustDepo is not liable for losses arising from circumstances beyond our control. Our maximum liability is limited to the transaction amount held in trust.' },
                    { title: '7. Governing Law', body: 'These terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of UAE courts.' },
                  ].map((s) => (
                    <View key={s.title} style={styles.termItem}>
                      <Text style={styles.termTitle}>{s.title}</Text>
                      <Text style={styles.termBody}>{s.body}</Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Checkbox */}
                <TouchableOpacity
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  activeOpacity={0.8}
                  style={[styles.checkboxRow, termsAccepted && styles.checkboxRowActive]}
                >
                  <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                    {termsAccepted && <Feather name="check" size={14} color="#fff" />}
                  </View>
                  <Text style={[styles.checkboxLabel, termsAccepted && { color: colors.primary }]}>
                    I have read and agree to the Terms & Conditions and Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
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
              <LinearGradient colors={['#059669', '#10b981']} style={styles.nextBtn}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.nextBtnText}>
                      {step === 4 || (step === 3 && selectedPlan === 'free') ? 'Get Started' : step === 3 ? 'Accept & Continue' : 'Continue'}
                    </Text>
                    <Feather name="arrow-right" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Date Picker */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={datePickerValue}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (event.type === 'set' && selected) {
                setDatePickerValue(selected);
                const iso = selected.toISOString().split('T')[0];
                setProfileField('date_of_birth', iso);
              }
            }}
          />
        )}
        {Platform.OS === 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={styles.dateModalOverlay}>
              <View style={styles.dateModalSheet}>
                <View style={styles.dateModalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.dateModalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.dateModalTitle}>Date of Birth</Text>
                  <TouchableOpacity onPress={() => {
                    const iso = datePickerValue.toISOString().split('T')[0];
                    setProfileField('date_of_birth', iso);
                    setShowDatePicker(false);
                  }}>
                    <Text style={styles.dateModalDone}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={datePickerValue}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  textColor={colors.text}
                  onChange={(_, selected) => { if (selected) setDatePickerValue(selected); }}
                  style={{ height: 200 }}
                />
              </View>
            </View>
          </Modal>
        )}

        {/* Phone Country Code Modal */}
        <Modal visible={showPhoneCodeModal} transparent animationType="slide" onRequestClose={() => setShowPhoneCodeModal(false)}>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Country Code</Text>
                <TouchableOpacity onPress={() => setShowPhoneCodeModal(false)}>
                  <Feather name="x" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.pickerSearch}>
                <Feather name="search" size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.pickerSearchInput}
                  placeholder="Search country or code..."
                  placeholderTextColor={colors.textMuted}
                  value={phoneSearch}
                  onChangeText={setPhoneSearch}
                  autoFocus
                />
              </View>
              <FlatList
                data={filteredPhoneCountries}
                keyExtractor={(item) => item.code}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, phoneCountry.code === item.code && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPhoneCountry(item);
                      setShowPhoneCodeModal(false);
                    }}
                  >
                    <Text style={styles.pickerItemFlag}>{item.flag}</Text>
                    <Text style={styles.pickerItemName}>{item.name}</Text>
                    <Text style={styles.pickerItemCode}>{item.phoneCode}</Text>
                    {phoneCountry.code === item.code && (
                      <Feather name="check" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Country Picker Modal */}
        <Modal visible={showCountryModal} transparent animationType="slide" onRequestClose={() => setShowCountryModal(false)}>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Country</Text>
                <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                  <Feather name="x" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.pickerSearch}>
                <Feather name="search" size={16} color={colors.textMuted} />
                <TextInput
                  style={styles.pickerSearchInput}
                  placeholder="Search country..."
                  placeholderTextColor={colors.textMuted}
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                  autoFocus
                />
              </View>
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.pickerItem, selectedCountry?.code === item.code && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedCountry(item);
                      setErrors((e) => ({ ...e, country: '' }));
                      setShowCountryModal(false);
                    }}
                  >
                    <Text style={styles.pickerItemFlag}>{item.flag}</Text>
                    <Text style={styles.pickerItemName}>{item.name}</Text>
                    {selectedCountry?.code === item.code && (
                      <Feather name="check" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

function DatePickerField({ label, value, onPress, error }) {
  const display = value
    ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={inputStyles.label}>{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[inputStyles.wrapper, error && inputStyles.wrapperError]}
      >
        <Feather name="calendar" size={18} color={colors.textMuted} style={inputStyles.icon} />
        <Text style={[inputStyles.input, { lineHeight: 48, color: value ? colors.text : colors.textMuted }]}>
          {display || 'Select date'}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textMuted} style={{ marginRight: 14 }} />
      </TouchableOpacity>
      {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
    </View>
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

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, marginTop: 8 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: colors.primary },
  stepInactive: { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: colors.border },
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
  popularBadge: { backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
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

  // Phone code picker button
  phoneCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  phoneCodeFlag: { fontSize: 20 },
  phoneCodeText: { color: colors.text, fontSize: 14, fontWeight: '600', minWidth: 36 },
  phoneCodeDivider: { width: 1, height: 24, backgroundColor: colors.inputBorder },

  selectedPlanInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  selectedPlanText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  selectedPlanPrice: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  secureText: { color: colors.emerald, fontSize: 13 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, padding: 16, gap: 8 },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  termsBox: { backgroundColor: 'rgba(26,26,46,0.8)', borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16, height: 320 },
  termItem: { marginBottom: 16 },
  termTitle: { color: colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  termBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 8 },
  checkboxRowActive: { borderColor: colors.primary, backgroundColor: 'rgba(16,185,129,0.08)' },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.primary, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1, flexShrink: 0 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxLabel: { flex: 1, color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  dateModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  dateModalSheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  dateModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  dateModalTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  dateModalCancel: { color: colors.textMuted, fontSize: 16 },
  dateModalDone: { color: colors.primary, fontSize: 16, fontWeight: '700' },

  // Country / Phone code picker modals
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#12121a', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30, maxHeight: '80%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  pickerSearch: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.inputBg, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder },
  pickerSearchInput: { flex: 1, color: colors.text, fontSize: 15 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, gap: 12 },
  pickerItemActive: { backgroundColor: 'rgba(16,185,129,0.08)' },
  pickerItemFlag: { fontSize: 24 },
  pickerItemName: { flex: 1, color: colors.text, fontSize: 15 },
  pickerItemCode: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
});
