import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GlassCard from '../../components/GlassCard';

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide during registration (name, email, Emirates ID, phone number), transaction data, device information, and usage analytics. We may also collect location data to comply with UAE regulatory requirements.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your information is used to provide and improve our escrow services, verify your identity, process transactions, comply with UAE legal obligations, prevent fraud, and communicate with you about your account and transactions.',
  },
  {
    title: '3. Data Sharing',
    body: 'We do not sell your personal data. We may share data with licensed UAE banks for fund custody, government authorities when required by law, identity verification providers, and fraud prevention services. All third parties are bound by strict data processing agreements.',
  },
  {
    title: '4. Data Security',
    body: 'We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your funds are held in segregated accounts at licensed UAE banks. We conduct regular security audits and penetration testing to protect your data.',
  },
  {
    title: '5. UAE Personal Data Protection Law (PDPL)',
    body: 'We comply fully with the UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection. You have the right to access, correct, and request deletion of your personal data. Requests can be submitted to privacy@trustdepo.com.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain transaction records for a minimum of 5 years as required by UAE Anti-Money Laundering regulations. Personal account data is retained for 2 years after account closure. You may request early deletion of non-regulatory data.',
  },
  {
    title: '7. Cookies & Analytics',
    body: 'Our mobile app uses local storage for session management. We use anonymised analytics to understand app usage and improve performance. No tracking cookies are used for advertising purposes.',
  },
  {
    title: '8. Your Rights',
    body: 'Under UAE PDPL, you have the right to: access your personal data, correct inaccurate data, request data deletion (subject to regulatory retention requirements), object to certain processing, and data portability. Contact us at privacy@trustdepo.com to exercise these rights.',
  },
  {
    title: '9. International Transfers',
    body: 'Your data is primarily stored within the UAE. Any transfer outside the UAE is done in compliance with PDPL requirements, with appropriate safeguards in place, and only to countries with adequate data protection standards.',
  },
  {
    title: "10. Children's Privacy",
    body: 'Trustdepo is not intended for individuals under 18 years of age. We do not knowingly collect personal data from minors. If you believe a minor has registered, please contact us immediately at privacy@trustdepo.com.',
  },
  {
    title: '11. Changes to This Policy',
    body: 'We may update this Privacy Policy to reflect changes in our practices or applicable law. We will notify you of significant changes via email or in-app notification at least 14 days before they take effect.',
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSub}>Last updated: April 2026</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <GlassCard key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </GlassCard>
        ))}

        <GlassCard style={styles.contactCard}>
          <Text style={styles.contactPrompt}>Privacy concerns or requests?</Text>
          <Text style={styles.contactEmail}>privacy@trustdepo.com</Text>
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

  sectionCard: { marginBottom: 12, padding: 16 },
  sectionTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  contactCard: {
    marginBottom: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  contactPrompt: { color: colors.textMuted, fontSize: 13 },
  contactEmail: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 4 },
});
