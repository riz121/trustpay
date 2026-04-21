import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
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

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

          {/* Fields */}
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
          </GlassCard>

          {/* Account (read-only) */}
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
});
