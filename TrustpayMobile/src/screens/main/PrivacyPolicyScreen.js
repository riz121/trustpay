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
    body: 'When you register and use TrustDepo, we collect your full name, date of birth, and government-issued ID (UK passport or driving licence) for identity verification. We also collect your email address, phone number, bank account details (sort code, account number, IBAN) for payouts, and payment card details processed securely by Stripe. We collect transaction data, technical data (IP address, device type, OS, app version, login timestamps), usage data, and any communications with our support team.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your data to create and manage your TrustDepo account, verify your identity under UK Anti-Money Laundering (AML) and Know Your Customer (KYC) obligations, facilitate the holding and release of funds, communicate with you about your account, detect and prevent fraud, comply with UK legal and regulatory obligations, improve the platform, and resolve disputes.',
  },
  {
    title: '3. Legal Basis for Processing',
    body: 'Under UK GDPR we process your data on the following bases: Contract performance (to provide the TrustDepo service), Legal obligation (to comply with UK AML regulations and FCA guidance), Legitimate interests (fraud prevention and platform security), and Consent (for optional marketing communications, which you may withdraw at any time).',
  },
  {
    title: '4. Data Sharing',
    body: 'We do not sell your personal data. We may share it only with Stripe (our FCA-authorised payment processing partner), identity verification providers to fulfil UK KYC obligations, UK regulatory and law enforcement authorities where required by law, fraud prevention services, and professional advisers under strict confidentiality obligations. All third parties are bound by data processing agreements.',
  },
  {
    title: '5. Data Security',
    body: 'Our security measures include AES-256 encryption for data at rest, TLS 1.3 for data in transit, payment processing by Stripe (FCA-authorised, PCI DSS Level 1 certified), secure token-based authentication, strict internal access controls, and regular security reviews. In the event of a data breach, we will notify the ICO within 72 hours as required by UK GDPR.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain transaction records for a minimum of 5 years as required by the UK Money Laundering Regulations 2017. Identity verification data is retained for 5 years after the end of the business relationship. Account data is retained for 2 years after account closure. Support communications are retained for 3 years. Contact privacy@trustdepo.com to request early deletion of non-regulatory data.',
  },
  {
    title: '7. International Transfers',
    body: "Your data is primarily stored and processed within the United Kingdom. Where transfers outside the UK occur (such as via Stripe's infrastructure), we ensure appropriate safeguards are in place including UK adequacy decisions and UK International Data Transfer Agreements where required.",
  },
  {
    title: '8. Your Rights',
    body: 'Under UK GDPR and the Data Protection Act 2018 you have the right to access your personal data, correct inaccurate data, request deletion (subject to legal retention requirements), restrict processing, receive your data in a portable format, and object to processing. Contact privacy@trustdepo.com. You may also lodge a complaint with the ICO at ico.org.uk or call 0303 123 1113.',
  },
  {
    title: '9. Cookies & Analytics',
    body: 'The TrustDepo app uses local device storage for essential session management and authentication. We use anonymised analytics to understand app usage and improve performance. We do not use advertising tracking cookies or share data with advertising networks.',
  },
  {
    title: "10. Children's Privacy",
    body: 'TrustDepo is intended exclusively for users aged 18 and over. We do not knowingly collect or process personal data from anyone under 18. If you believe a minor has registered, please contact privacy@trustdepo.com immediately and we will delete the data and close the account.',
  },
  {
    title: '11. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically. We will notify you by email and via in-app notification at least 14 days before significant changes take effect. The updated policy will always be accessible within the TrustDepo app.',
  },
  {
    title: '12. Contact',
    body: 'TrustDepo Ltd is the data controller. Email: privacy@trustdepo.com | Website: www.trustdepo.com. ICO complaints: ico.org.uk, phone 0303 123 1113, or post to Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF.',
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
        <GlassCard style={styles.introCard}>
          <Text style={styles.introText}>
            TrustDepo Ltd ("TrustDepo", "we", "us", "our") is a company registered in England and Wales. We are committed to protecting your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. This Privacy Policy explains what data we collect, why we collect it, and how we use and protect it when you use the TrustDepo app.
          </Text>
        </GlassCard>

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

  introCard: { marginBottom: 16, padding: 16, backgroundColor: 'rgba(16,185,129,0.06)' },
  introText: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
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
