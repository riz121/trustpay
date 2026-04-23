import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/GlassCard';
import { authApi } from '../../api/apiClient';

const sections = [
  {
    icon: 'lock',
    title: 'AES-256 Encryption',
    body: 'All your personal data and transaction records are encrypted at rest using AES-256, the same standard used by leading UK financial institutions and government agencies.',
  },
  {
    icon: 'shield',
    title: 'TLS 1.3 in Transit',
    body: 'Every communication between the app and our servers is protected by TLS 1.3, ensuring your data cannot be intercepted or tampered with in transit.',
  },
  {
    icon: 'credit-card',
    title: 'Stripe — FCA Authorised',
    body: 'All payments are processed by Stripe, which is authorised and regulated by the Financial Conduct Authority (FCA) in the UK and is PCI DSS Level 1 certified — the highest level of payment security.',
  },
  {
    icon: 'user-check',
    title: 'UK KYC & Identity Verification',
    body: 'We verify every user through UK-compliant Know Your Customer (KYC) processes, including passport or driving licence verification, in line with UK Anti-Money Laundering Regulations 2017.',
  },
  {
    icon: 'activity',
    title: 'Real-Time Fraud Monitoring',
    body: 'Our fraud detection systems monitor transactions in real time, flagging suspicious activity and protecting both parties in every secure transaction.',
  },
  {
    icon: 'refresh-cw',
    title: 'Regular Security Audits',
    body: 'We conduct scheduled penetration testing and third-party security audits to identify and remediate vulnerabilities before they can be exploited.',
  },
  {
    icon: 'smartphone',
    title: 'Secure Session Management',
    body: 'Sessions are managed with short-lived JWT tokens and secure refresh token rotation. Tokens are stored in encrypted device storage, not exposed in URLs or logs.',
  },
  {
    icon: 'alert-triangle',
    title: 'Dispute Resolution',
    body: 'Our dispute system provides a secure, documented process for resolving disagreements, with evidence uploaded to encrypted cloud storage for review.',
  },
  {
    icon: 'file-text',
    title: 'UK Regulatory Compliance',
    body: 'TrustDepo complies with UK GDPR, the Data Protection Act 2018, UK Anti-Money Laundering Regulations 2017, FCA guidance for payment services, and the Proceeds of Crime Act 2002.',
  },
];

export default function SecurityScreen({ navigation }) {
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const setPwField = (k, v) => { setPwForm(p => ({ ...p, [k]: v })); setPwError(''); };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      setPwError('All fields are required.'); return;
    }
    if (pwForm.newPw.length < 6) {
      setPwError('New password must be at least 6 characters.'); return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError('New passwords do not match.'); return;
    }
    setPwLoading(true);
    setPwError('');
    try {
      await authApi.changePassword(pwForm.current, pwForm.newPw);
      setPwForm({ current: '', newPw: '', confirm: '' });
      Alert.alert('Success', 'Your password has been updated.');
    } catch (e) {
      setPwError(e.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Security</Text>
            <Text style={styles.headerSub}>How we protect your account & funds</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero badge */}
        <GlassCard style={styles.heroBadge}>
          <View style={styles.heroIconWrap}>
            <Feather name="shield" size={28} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Bank-Level Security</Text>
          <Text style={styles.heroSub}>
            Your account and funds are protected by the same security standards used by leading UK financial institutions.
          </Text>
        </GlassCard>

        {/* Change Password */}
        <GlassCard style={styles.changePwCard}>
          <View style={styles.changePwHeader}>
            <View style={styles.sectionIconWrap}>
              <Feather name="key" size={18} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>
          {pwError ? (
            <View style={styles.pwError}>
              <Feather name="alert-circle" size={14} color="#ef4444" />
              <Text style={styles.pwErrorText}>{pwError}</Text>
            </View>
          ) : null}
          {[
            { key: 'current', label: 'Current Password', placeholder: '••••••••' },
            { key: 'newPw', label: 'New Password', placeholder: 'Min 6 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(({ key, label, placeholder }) => (
            <View key={key} style={styles.pwField}>
              <Text style={styles.pwLabel}>{label}</Text>
              <View style={styles.pwInputRow}>
                <TextInput
                  style={styles.pwInput}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={pwForm[key]}
                  onChangeText={(v) => setPwField(key, v)}
                  secureTextEntry={!showPw[key]}
                />
                <TouchableOpacity onPress={() => setShowPw(p => ({ ...p, [key]: !p[key] }))} style={styles.eyeBtn}>
                  <Feather name={showPw[key] ? 'eye-off' : 'eye'} size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.pwBtn} onPress={handleChangePassword} disabled={pwLoading} activeOpacity={0.8}>
            {pwLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.pwBtnText}>Update Password</Text>}
          </TouchableOpacity>
        </GlassCard>

        {sections.map((section) => (
          <GlassCard key={section.title} style={styles.sectionCard}>
            <View style={styles.sectionRow}>
              <View style={styles.sectionIconWrap}>
                <Feather name={section.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            </View>
          </GlassCard>
        ))}

        <GlassCard style={styles.contactCard}>
          <Text style={styles.contactPrompt}>Security concerns or to report a vulnerability?</Text>
          <Text style={styles.contactEmail}>security@trustdepo.com</Text>
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safeArea: { backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  headerSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },

  scroll: { padding: 16 },

  heroBadge: {
    marginBottom: 16,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  heroSub: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' },

  sectionCard: { marginBottom: 10, padding: 16 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionContent: { flex: 1 },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  changePwCard: { marginBottom: 16, padding: 16 },
  changePwHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  pwError: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8, padding: 10, marginBottom: 12 },
  pwErrorText: { color: '#ef4444', fontSize: 13, flex: 1 },
  pwField: { marginBottom: 12 },
  pwLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '500', marginBottom: 6 },
  pwInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 10 },
  pwInput: { flex: 1, color: colors.text, fontSize: 15, padding: 12 },
  eyeBtn: { padding: 12 },
  pwBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 13, alignItems: 'center', marginTop: 4 },
  pwBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  contactCard: {
    marginTop: 6,
    marginBottom: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  contactPrompt: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  contactEmail: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 4 },
});
