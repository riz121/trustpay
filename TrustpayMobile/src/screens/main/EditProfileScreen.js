import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

function InputField({ label, icon, error, required, ...props }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {required ? <Text style={{ color: colors.destructive }}> *</Text> : null}
      </Text>
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

function ToggleGroup({ label, options, value, onChange }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.toggleRow}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.7}
              style={[
                styles.toggleBtn,
                selected && styles.toggleBtnSelected,
              ]}
            >
              <Text style={[styles.toggleBtnText, selected && styles.toggleBtnTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Individual', value: 'individual' },
  { label: 'Organisation', value: 'organisation' },
];

const HOW_HEAR_OPTIONS = [
  { label: 'Social Media', value: 'social_media' },
  { label: 'Friend', value: 'friend' },
  { label: 'Google', value: 'google' },
  { label: 'App Store', value: 'app_store' },
  { label: 'Other', value: 'other' },
];

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    phone: user?.phone || '',
    city: user?.city || '',
    company: user?.company || '',
    emirates_id: user?.emirates_id || '',
    date_of_birth: user?.date_of_birth || '',
    address: user?.address || '',
    gender: user?.gender || '',
    account_type: user?.account_type || 'individual',
    country: user?.country || '',
    how_did_you_hear: user?.how_did_you_hear || '',
    vat_number: user?.vat_number || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(
    user?.date_of_birth ? new Date(user.date_of_birth) : new Date(2000, 0, 1)
  );

  const setField = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (form.username.trim() && !/^[a-z0-9_]{3,30}$/.test(form.username.trim())) {
      e.username = 'Only lowercase letters, numbers, underscores (3–30 chars)';
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        full_name: form.full_name.trim(),
        username: form.username.trim() || undefined,
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        company: form.company.trim() || undefined,
        emirates_id: form.emirates_id.trim() || undefined,
        date_of_birth: form.date_of_birth.trim() || undefined,
        address: form.address.trim() || undefined,
        gender: form.gender || undefined,
        account_type: form.account_type || undefined,
        country: form.country.trim() || undefined,
        how_did_you_hear: form.how_did_you_hear || undefined,
        vat_number: form.vat_number.trim() || undefined,
      });
      Alert.alert('Profile Updated', 'Your profile has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Preview */}
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#059669', '#10b981']} style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {form.full_name
                  ? form.full_name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                  : (user?.email || '??').slice(0, 2).toUpperCase()}
              </Text>
            </LinearGradient>
            <Text style={styles.avatarHint}>Avatar is auto-generated from your name</Text>
          </View>

          {/* ── Personal Info ── */}
          <GlassCard style={styles.formCard}>
            <Text style={styles.sectionLabel}>Personal Information</Text>

            <InputField
              label="Full Name"
              icon="user"
              placeholder="John Doe"
              value={form.full_name}
              onChangeText={(v) => setField('full_name', v)}
              autoCapitalize="words"
              error={errors.full_name}
              required
            />

            <InputField
              label="@Username"
              icon="at-sign"
              placeholder="yourname"
              value={form.username}
              onChangeText={(v) => setField('username', v.replace(/[^a-z0-9_]/g, '').toLowerCase())}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.username}
            />

            <InputField
              label="Phone Number"
              icon="phone"
              placeholder="+971 50 123 4567"
              value={form.phone}
              onChangeText={(v) => setField('phone', v)}
              keyboardType="phone-pad"
              error={errors.phone}
            />

            <DatePickerField
              label="Date of Birth"
              value={form.date_of_birth}
              onPress={() => setShowDatePicker(true)}
              error={errors.date_of_birth}
            />

            <ToggleGroup
              label="Gender"
              options={GENDER_OPTIONS}
              value={form.gender}
              onChange={(v) => setField('gender', v)}
            />
          </GlassCard>

          {/* ── Location ── */}
          <GlassCard style={styles.formCard}>
            <Text style={styles.sectionLabel}>Location</Text>

            <InputField
              label="City"
              icon="map-pin"
              placeholder="Dubai"
              value={form.city}
              onChangeText={(v) => setField('city', v)}
              error={errors.city}
            />

            <InputField
              label="Country"
              icon="globe"
              placeholder="United Arab Emirates"
              value={form.country}
              onChangeText={(v) => setField('country', v)}
              autoCapitalize="words"
              error={errors.country}
            />

            <InputField
              label="Address"
              icon="home"
              placeholder="Street, Area"
              value={form.address}
              onChangeText={(v) => setField('address', v)}
              autoCapitalize="sentences"
              error={errors.address}
            />
          </GlassCard>

          {/* ── Business Info ── */}
          <GlassCard style={styles.formCard}>
            <Text style={styles.sectionLabel}>Business Information</Text>

            <ToggleGroup
              label="Account Type"
              options={ACCOUNT_TYPE_OPTIONS}
              value={form.account_type}
              onChange={(v) => setField('account_type', v)}
            />

            <InputField
              label="Company"
              icon="briefcase"
              placeholder="Your company name (optional)"
              value={form.company}
              onChangeText={(v) => setField('company', v)}
              autoCapitalize="words"
              error={errors.company}
            />

            <InputField
              label="VAT Number"
              icon="hash"
              placeholder="VAT registration number (optional)"
              value={form.vat_number}
              onChangeText={(v) => setField('vat_number', v)}
              autoCapitalize="characters"
              error={errors.vat_number}
            />

            <InputField
              label="Emirates ID"
              icon="credit-card"
              placeholder="784-XXXX-XXXXXXX-X (optional)"
              value={form.emirates_id}
              onChangeText={(v) => setField('emirates_id', v)}
              keyboardType="number-pad"
              error={errors.emirates_id}
            />
          </GlassCard>

          {/* ── How did you hear ── */}
          <GlassCard style={styles.formCard}>
            <Text style={styles.sectionLabel}>How Did You Hear About Us?</Text>
            <View style={[styles.toggleRow, { flexWrap: 'wrap' }]}>
              {HOW_HEAR_OPTIONS.map((opt) => {
                const selected = form.how_did_you_hear === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setField('how_did_you_hear', opt.value)}
                    activeOpacity={0.7}
                    style={[styles.toggleBtn, selected && styles.toggleBtnSelected]}
                  >
                    <Text style={[styles.toggleBtnText, selected && styles.toggleBtnTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>

          {/* ── Account (read-only) ── */}
          <GlassCard style={styles.formCard}>
            <Text style={styles.sectionLabel}>Account</Text>
            <View style={styles.readonlyField}>
              <Feather name="mail" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <Text style={styles.readonlyText}>{user?.email || ''}</Text>
              <View style={styles.lockedBadge}>
                <Feather name="lock" size={12} color={colors.textMuted} />
              </View>
            </View>
            {user?.plan && (
              <View style={[styles.readonlyField, { marginTop: 8 }]}>
                <Feather name="star" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <Text style={styles.readonlyText}>
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                </Text>
                <View style={styles.lockedBadge}>
                  <Feather name="lock" size={12} color={colors.textMuted} />
                </View>
              </View>
            )}
            <Text style={styles.readonlyHint}>Email and plan cannot be changed here</Text>
          </GlassCard>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
            style={{ marginTop: 8 }}
          >
            <LinearGradient colors={['#059669', '#10b981']} style={styles.saveBtn}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="check" size={20} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
              setField('date_of_birth', selected.toISOString().split('T')[0]);
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
                  setField('date_of_birth', datePickerValue.toISOString().split('T')[0]);
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
    </View>
  );
}

function DatePickerField({ label, value, onPress, error }) {
  const display = value
    ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[styles.inputWrapper, error && styles.inputWrapperError]}
      >
        <Feather name="calendar" size={18} color={colors.textMuted} style={styles.inputIcon} />
        <Text style={[styles.textInput, { lineHeight: 48, color: value ? colors.text : colors.textMuted }]}>
          {display || 'Select date'}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textMuted} style={{ marginRight: 14 }} />
      </TouchableOpacity>
      {error ? <Text style={styles.inputError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  headerSafe: { backgroundColor: '#0f0f1a', borderBottomWidth: 1, borderBottomColor: colors.border },
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

  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarInitials: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  avatarHint: { color: colors.textMuted, fontSize: 12 },

  formCard: { marginBottom: 16, padding: 16 },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  inputGroup: { marginBottom: 14 },
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

  // Toggle buttons
  toggleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBg,
  },
  toggleBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  toggleBtnText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  toggleBtnTextSelected: { color: colors.primary, fontWeight: '600' },

  readonlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    paddingVertical: 13,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  readonlyText: { flex: 1, color: colors.textMuted, fontSize: 15 },
  lockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readonlyHint: { color: colors.textMuted, fontSize: 12, marginTop: 10 },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  dateModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  dateModalSheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
  dateModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  dateModalTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  dateModalCancel: { color: colors.textMuted, fontSize: 16 },
  dateModalDone: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});
