import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import { colors } from '../../theme/colors';

const FAQS = [
  {
    category: 'General',
    items: [
      {
        q: 'What is Trustdepo?',
        a: 'Trustdepo is a secure payment platform for the UAE that holds funds safely between two parties until both confirm the transaction is complete. It protects buyers and sellers from fraud.',
      },
      {
        q: 'Who can use Trustdepo?',
        a: 'Trustdepo is available to UAE residents and businesses. You must have a valid Emirates ID or trade license to use the platform.',
      },
      {
        q: 'Is Trustdepo regulated in the UAE?',
        a: 'We operate in compliance with UAE Central Bank regulations and ADGM/DIFC fintech frameworks for payment service providers.',
      },
    ],
  },
  {
    category: 'Transactions',
    items: [
      {
        q: 'How does a secure transaction work?',
        a: "1. The buyer deposits funds. 2. The seller delivers goods or services. 3. Both parties confirm completion. 4. Funds are released to the seller. If there's a dispute, our team mediates.",
      },
      {
        q: 'What is the minimum and maximum transaction amount?',
        a: 'Minimum: AED 100. Maximum: AED 500,000 per transaction. For higher amounts, contact our enterprise team.',
      },
      {
        q: 'How long are funds held?',
        a: 'Funds remain held until both parties confirm, or until the agreed release date. Unclaimed funds after 90 days are reviewed by our team.',
      },
      {
        q: 'Can I cancel a transaction?',
        a: 'You can cancel a pending or funded transaction before either party confirms. Once both parties confirm, the transaction is final.',
      },
    ],
  },
  {
    category: 'Payments & Withdrawals',
    items: [
      {
        q: 'How do I add funds to a transaction?',
        a: 'You can deposit via UAE bank transfer, credit/debit card, or UAEFTS. Funds are credited within 1 business hour.',
      },
      {
        q: 'When will released funds reach my bank?',
        a: 'Once both parties confirm, funds are released immediately. UAE bank transfers typically settle within 1–2 business days.',
      },
      {
        q: 'What are the fees?',
        a: 'We charge a flat 1.5% fee on the transaction amount, deducted at release. There are no hidden fees or monthly charges.',
      },
      {
        q: 'Which banks are supported for withdrawal?',
        a: 'All UAE banks are supported including Emirates NBD, FAB, ADCB, Mashreq, DIB, and all UAEFTS-connected banks.',
      },
    ],
  },
  {
    category: 'Security',
    items: [
      {
        q: 'How are my funds protected?',
        a: 'All funds are held in segregated accounts at a licensed UAE bank. Your funds are never mixed with company funds and are fully insured.',
      },
      {
        q: 'What happens during a dispute?',
        a: 'If either party raises a dispute, funds are frozen and our mediation team reviews the case within 3 business days. We support evidence submission via the app.',
      },
      {
        q: 'Is my personal data safe?',
        a: 'We use AES-256 encryption and comply with UAE PDPL (Personal Data Protection Law). Your data is never sold to third parties.',
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <View>
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        style={styles.accordionHeader}
      >
        <Text style={styles.accordionQuestion}>{item.q}</Text>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionBody}>
          <Text style={styles.accordionAnswer}>{item.a}</Text>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen({ navigation }) {
  const handleEmail = () => Linking.openURL('mailto:support@trustdepo.com');
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0f0f1a' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & FAQ</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {filtered.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Feather name="help-circle" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No results found</Text>
          </GlassCard>
        ) : (
          filtered.map((cat) => (
            <View key={cat.category} style={styles.categorySection}>
              <Text style={styles.categoryLabel}>{cat.category}</Text>
              <GlassCard style={styles.categoryCard}>
                {cat.items.map((item, ii) => (
                  <View key={`${cat.category}-${ii}`}>
                    <AccordionItem
                      item={item}
                      isOpen={openItem === `${cat.category}-${ii}`}
                      onToggle={() =>
                        setOpenItem(
                          openItem === `${cat.category}-${ii}` ? null : `${cat.category}-${ii}`
                        )
                      }
                    />
                    {ii < cat.items.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </GlassCard>
            </View>
          ))
        )}

        {/* Contact */}
        <GlassCard style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSubtitle}>Our support team is available 24/7</Text>
          <View style={styles.contactBtns}>
            <TouchableOpacity style={styles.emailBtn} onPress={handleEmail} activeOpacity={0.8}>
              <Feather name="mail" size={16} color={colors.textMuted} />
              <Text style={styles.emailBtnText}>Email Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => navigation.navigate('LiveChat')}
              activeOpacity={0.8}
            >
              <Feather name="message-circle" size={16} color="#fff" />
              <Text style={styles.chatBtnText}>Live Chat</Text>
            </TouchableOpacity>
          </View>
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
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchIcon: { marginLeft: 14, marginRight: 8 },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12, paddingLeft: 0 },
  clearBtn: { padding: 12 },
  categorySection: { marginBottom: 20 },
  categoryLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingLeft: 2,
  },
  categoryCard: { padding: 0, overflow: 'hidden' },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  accordionQuestion: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  accordionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  accordionAnswer: { color: colors.textMuted, fontSize: 14, lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.border },
  emptyCard: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 15 },
  contactCard: { marginTop: 4, padding: 20, alignItems: 'center' },
  contactTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 6 },
  contactSubtitle: { color: colors.textMuted, fontSize: 13, marginBottom: 16, textAlign: 'center' },
  contactBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  emailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  emailBtnText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  chatBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
