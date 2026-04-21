import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Trustdepo, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform. These terms apply to all users, including senders and receivers of transactions.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years of age and a resident of the United Arab Emirates to use Trustdepo. By registering, you confirm that you have the legal capacity to enter into binding agreements under UAE law.',
  },
  {
    title: '3. Payment Services',
    body: 'Trustdepo acts as a neutral third party to hold funds between two parties during a transaction. Funds are released only when both the sender and receiver confirm that the agreed conditions have been met. Trustdepo does not take sides in disputes and acts solely as a neutral custodian.',
  },
  {
    title: '4. Fees',
    body: 'A flat fee of 1.5% is charged on the transaction amount at the time of release. There are no monthly fees, setup fees, or hidden charges. Additional fees may apply for expedited withdrawal or dispute resolution services.',
  },
  {
    title: '5. User Responsibilities',
    body: 'Users are responsible for providing accurate information, including counterparty details and transaction descriptions. Any misuse of the platform, including fraudulent transactions, will result in immediate account suspension and may be reported to UAE authorities.',
  },
  {
    title: '6. Disputes',
    body: "In the event of a dispute, both parties must submit supporting evidence through the app within 7 business days. Our mediation team will review the case and issue a decision within 3 business days. The decision of Trustdepo's mediation team is final and binding.",
  },
  {
    title: '7. Cancellations & Refunds',
    body: 'Transactions may be cancelled before both parties confirm completion. Once both parties confirm, the transaction is final and cannot be reversed. Refunds for cancelled transactions are processed within 2–5 business days.',
  },
  {
    title: '8. Prohibited Activities',
    body: 'You may not use Trustdepo for illegal transactions, money laundering, terrorist financing, or any activity prohibited under UAE law. Trustdepo reserves the right to freeze funds and report suspicious activity to the UAE Financial Intelligence Unit (FIU).',
  },
  {
    title: '9. Limitation of Liability',
    body: "Trustdepo's liability is limited to the value of funds held for your transaction. We are not liable for any indirect, incidental, or consequential damages arising from the use of our platform.",
  },
  {
    title: '10. Governing Law',
    body: 'These Terms are governed by the laws of the United Arab Emirates. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.',
  },
  {
    title: '11. Changes to Terms',
    body: 'Trustdepo reserves the right to modify these Terms at any time. Users will be notified of material changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the updated Terms.',
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
