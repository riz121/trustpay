import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By registering an account and using TrustDepo, you confirm that you have read, understood, and agreed to these Terms and Conditions in full. These terms form a legally binding agreement between you and TrustDepo Ltd under the laws of England and Wales.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years of age and have the legal capacity to enter into binding agreements under English law to use TrustDepo. By registering, you confirm that all information you provide is accurate, complete, and up to date. TrustDepo is available to residents of the United Kingdom. Users outside the UK may access the platform subject to compliance with their local laws.',
  },
  {
    title: '3. Payment Services',
    body: 'TrustDepo acts as a neutral third party to hold funds securely between two parties during a transaction. Funds are held via our payment partner Stripe, which is authorised and regulated by the Financial Conduct Authority (FCA). Funds are released only when the buyer confirms that the agreed conditions have been met. TrustDepo does not hold funds directly and is not a bank or payment institution.',
  },
  {
    title: '4. Buyer Verification Responsibility',
    body: 'Before tapping Confirm and Release, the buyer is solely responsible for thoroughly inspecting, verifying, and authenticating the item or service received. Once the buyer taps Confirm and Release, the transaction is complete, funds are released to the seller, and the transaction cannot be reversed. Do not confirm until you are completely satisfied with what you have received.',
  },
  {
    title: '5. Fees',
    body: 'TrustDepo charges a platform fee on each successfully completed transaction, deducted automatically at the point of fund release. The current fee structure is displayed within the app at deal creation. There are no monthly fees, setup fees, or hidden charges. Fees are only charged on completed transactions.',
  },
  {
    title: '6. User Responsibilities',
    body: 'You are responsible for providing accurate and truthful information when creating a deal. Any misuse of TrustDepo including fraudulent transactions, false deal creation, or deliberate misrepresentation will result in immediate account suspension and may be reported to UK authorities including law enforcement and the Financial Conduct Authority.',
  },
  {
    title: '7. Disputes',
    body: 'In the event of a dispute, both parties must contact TrustDepo support at support@trustdepo.com before any release of funds. Both parties may be required to submit supporting evidence through the app. TrustDepo will review the case and aim to respond within a reasonable timeframe. Funds will remain held during any active dispute review.',
  },
  {
    title: '8. Cancellations & Refunds',
    body: 'A transaction may be cancelled by mutual agreement before the buyer confirms completion. Once the buyer taps Confirm and Release, the transaction is final and cannot be reversed. Held funds for cancelled transactions will be returned to the buyer within 2–5 business days. No platform fee is charged on cancelled transactions.',
  },
  {
    title: '9. Prohibited Activities',
    body: 'You may not use TrustDepo for any illegal transactions, money laundering, terrorist financing, fraud, or any activity prohibited under the laws of England and Wales. TrustDepo reserves the right to freeze funds, suspend accounts, and report suspicious activity to the National Crime Agency (NCA) and HMRC under the UK Proceeds of Crime Act 2002.',
  },
  {
    title: '10. Limitation of Liability',
    body: "TrustDepo's liability is limited to the value of funds held at the time of the relevant transaction. We are not liable for indirect, incidental, or consequential damages, or for any loss arising after a buyer has confirmed a transaction. Nothing in these Terms limits TrustDepo's liability for fraud, death, or personal injury caused by our negligence.",
  },
  {
    title: '11. Intellectual Property',
    body: 'All content, branding, design, and technology within the TrustDepo app and website are the intellectual property of TrustDepo Ltd and are protected under UK copyright law. You may not reproduce or distribute any part of our platform without prior written consent.',
  },
  {
    title: '12. Governing Law',
    body: 'These Terms are governed exclusively by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
  },
  {
    title: '13. Changes to Terms',
    body: 'TrustDepo reserves the right to modify these Terms at any time. We will notify users of material changes via email and in-app notification at least 14 days before changes take effect. Continued use constitutes acceptance. Contact: support@trustdepo.com | www.trustdepo.com.',
  },
];

export default function TermsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0f0f1a' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <Text style={styles.headerSubtitle}>Last updated: April 2026</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <GlassCard key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </GlassCard>
        ))}

        <GlassCard style={styles.contactCard}>
          <Text style={styles.contactNote}>Questions about our Terms?</Text>
          <Text style={styles.contactEmail}>legal@trustdepo.com</Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

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
  headerTextBlock: { alignItems: 'center' },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  headerSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionCard: { marginBottom: 12, padding: 18 },
  sectionTitle: { color: colors.primary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  sectionBody: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  contactCard: { marginTop: 4, padding: 20, alignItems: 'center' },
  contactNote: { color: colors.textMuted, fontSize: 13, marginBottom: 6 },
  contactEmail: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
