import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

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
    body: 'We comply fully with the UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection. You have the right to access, correct, and request deletion of your personal data. Requests can be submitted to privacy@escrowpay.ae.',
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
    body: 'Under UAE PDPL, you have the right to: access your personal data, correct inaccurate data, request data deletion (subject to regulatory retention requirements), object to certain processing, and data portability. Contact us at privacy@escrowpay.ae to exercise these rights.',
  },
  {
    title: '9. International Transfers',
    body: 'Your data is primarily stored within the UAE. Any transfer outside the UAE is done in compliance with PDPL requirements, with appropriate safeguards in place, and only to countries with adequate data protection standards.',
  },
  {
    title: '10. Children\'s Privacy',
    body: 'Escrow Pay is not intended for individuals under 18 years of age. We do not knowingly collect personal data from minors. If you believe a minor has registered, please contact us immediately at privacy@escrowpay.ae.',
  },
  {
    title: '11. Changes to This Policy',
    body: 'We may update this Privacy Policy to reflect changes in our practices or applicable law. We will notify you of significant changes via email or in-app notification at least 14 days before they take effect.',
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
          <p className="text-[10px] text-muted-foreground">Last updated: April 2026</p>
        </div>
      </motion.div>

      <div className="space-y-5 pb-8">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-5"
          >
            <p className="text-sm font-semibold text-primary mb-2">{section.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
          </motion.div>
        ))}

        <div className="glass-accent rounded-2xl p-5 text-center">
          <p className="text-xs text-muted-foreground">Privacy concerns or requests?</p>
          <p className="text-xs text-primary font-semibold mt-1">privacy@escrowpay.ae</p>
        </div>
      </div>
    </div>
  );
}