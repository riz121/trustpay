import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

const FEATURES = [
  { icon: 'shield', text: 'Secure Protected Payments' },
  { icon: 'zap', text: 'Instant Fund Transfers' },
  { icon: 'check-circle', text: 'Dispute Resolution' },
  { icon: 'lock', text: 'Bank-level Security' },
];

export default function LoginScreen({ navigation }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('landing'); // landing | signin | register | verify
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setError('');
  };

  const handleSignIn = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      // Navigation handled by AppNavigator
    } catch (e) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.username.trim() && !/^[a-z0-9_]{3,30}$/.test(form.username.trim())) {
      setError('Username can only contain lowercase letters, numbers, and underscores (3–30 chars).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await register(
        form.full_name.trim(),
        form.email.trim(),
        form.password,
        form.username.trim() || undefined,
      );
      if (data.requires_verification) {
        setRequiresVerification(true);
        setMode('verify');
      }
      // If no verification needed, AuthContext sets user → navigator redirects
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!form.otp.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // After verification, attempt login
      await login(form.email.trim(), form.password);
    } catch (e) {
      setError('Verification failed or code is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
  };

  const back = () => {
    setError('');
    setMode('landing');
  };

  if (mode === 'landing') {
    return (
      <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.landingScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={['#6366f1', '#a78bfa']} style={styles.logoGradient}>
                <Feather name="shield" size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.appName}>TrustPay</Text>
              <Text style={styles.tagline}>The Smarter Way to Pay in the UAE</Text>
            </View>

            <View style={styles.featuresContainer}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Feather name={f.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              ))}
            </View>

            <View style={styles.landingButtons}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setMode('signin')}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.gradientBtn}>
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => setMode('register')}
                activeOpacity={0.8}
              >
                <Text style={styles.outlineBtnText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={back} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.formHeader}>
              <LinearGradient colors={['#6366f1', '#a78bfa']} style={styles.logoSmall}>
                <Feather name="shield" size={22} color="#fff" />
              </LinearGradient>
              <Text style={styles.formTitle}>
                {mode === 'signin' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Verify Email'}
              </Text>
              <Text style={styles.formSubtitle}>
                {mode === 'signin'
                  ? 'Sign in to your TrustPay account'
                  : mode === 'register'
                  ? 'Join TrustPay to get started'
                  : `Enter the verification code sent to ${form.email}`}
              </Text>
            </View>

            <View style={styles.formCard}>
              {error ? (
                <View style={styles.errorBanner}>
                  <Feather name="alert-circle" size={16} color={colors.destructive} />
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              ) : null}

              {mode === 'register' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="user" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="John Doe"
                      placeholderTextColor={colors.textMuted}
                      value={form.full_name}
                      onChangeText={(v) => setField('full_name', v)}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                </View>
              )}

              {mode === 'register' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>@Username <Text style={{ color: colors.textMuted, fontSize: 12 }}>(optional)</Text></Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="at-sign" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="yourname"
                      placeholderTextColor={colors.textMuted}
                      value={form.username}
                      onChangeText={(v) => setField('username', v.replace(/[^a-z0-9_]/g, '').toLowerCase())}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                </View>
              )}

              {(mode === 'signin' || mode === 'register') && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="mail" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.textMuted}
                      value={form.email}
                      onChangeText={(v) => setField('email', v)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                    />
                  </View>
                </View>
              )}

              {(mode === 'signin' || mode === 'register') && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInput, { paddingRight: 44 }]}
                      placeholder={mode === 'register' ? 'Min 6 characters' : '••••••••'}
                      placeholderTextColor={colors.textMuted}
                      value={form.password}
                      onChangeText={(v) => setField('password', v)}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={mode === 'signin' ? handleSignIn : handleRegister}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((p) => !p)}
                      style={styles.eyeIcon}
                    >
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {mode === 'verify' && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Verification Code</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="key" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter OTP code"
                      placeholderTextColor={colors.textMuted}
                      value={form.otp}
                      onChangeText={(v) => setField('otp', v)}
                      keyboardType="number-pad"
                      maxLength={8}
                      returnKeyType="done"
                      onSubmitEditing={handleVerify}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={mode === 'signin' ? handleSignIn : mode === 'register' ? handleRegister : handleVerify}
                activeOpacity={0.8}
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.submitBtn}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {mode === 'signin' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Verify'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {mode === 'verify' && (
                <TouchableOpacity onPress={handleResend} style={styles.switchLink} activeOpacity={0.7}>
                  <Text style={styles.switchLinkText}>Didn't receive code? <Text style={styles.switchLinkBold}>Resend</Text></Text>
                </TouchableOpacity>
              )}

              {mode !== 'verify' && (
                <TouchableOpacity
                  onPress={() => { setError(''); setMode(mode === 'signin' ? 'register' : 'signin'); }}
                  style={styles.switchLink}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchLinkText}>
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <Text style={styles.switchLinkBold}>{mode === 'signin' ? 'Register' : 'Sign In'}</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  landingScroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  formScroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logoGradient: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  appName: { fontSize: 36, fontWeight: '800', color: colors.text, letterSpacing: 1, marginBottom: 8 },
  tagline: { fontSize: 16, color: colors.textMuted, textAlign: 'center' },
  featuresContainer: { gap: 14, marginBottom: 48 },
  featureRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(26,26,46,0.6)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(99,102,241,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  featureText: { color: colors.text, fontSize: 15, fontWeight: '500' },
  landingButtons: { gap: 12 },
  primaryBtn: { borderRadius: 14, overflow: 'hidden' },
  gradientBtn: { padding: 16, alignItems: 'center', borderRadius: 14 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  outlineBtnText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  backBtn: { marginBottom: 20, padding: 4, alignSelf: 'flex-start' },
  formHeader: { alignItems: 'center', marginBottom: 32 },
  logoSmall: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  formTitle: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 6 },
  formSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  formCard: { backgroundColor: 'rgba(26,26,46,0.8)', borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 24 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12 },
  inputIcon: { marginLeft: 14, marginRight: 8 },
  textInput: { flex: 1, color: colors.text, fontSize: 16, padding: 14, paddingLeft: 0 },
  eyeIcon: { padding: 14 },
  submitBtn: { borderRadius: 12, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchLink: { marginTop: 20, alignItems: 'center' },
  switchLinkText: { color: colors.textMuted, fontSize: 14 },
  switchLinkBold: { color: colors.primary, fontWeight: '600' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12, marginBottom: 16, gap: 8 },
  errorBannerText: { color: colors.destructive, fontSize: 14, flex: 1 },
});
