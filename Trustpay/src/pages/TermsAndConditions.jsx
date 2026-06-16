import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using TrustDepo, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform. These terms apply to all users, including buyers and sellers of escrow transactions. These terms form a legally binding agreement between you and TrustDepo Ltd under the laws of England and Wales.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years of age and have the legal capacity to enter into binding agreements under English law to use TrustDepo. By registering, you confirm that all information you provide is accurate, complete, and up to date. TrustDepo is available to residents of the United Kingdom. Users outside the UK may access the platform subject to compliance with their local laws.',
  },
  {
    title: '3. Payment Services',
    body: 'TrustDepo acts as a neutral third party to facilitate secure payments between two parties during a transaction. Funds are processed via our payment partner Trustap, which is authorised and regulated by the Financial Conduct Authority (FCA). Funds are released only when the buyer confirms that the agreed conditions have been met. TrustDepo does not hold funds directly and is not a bank or payment institution.',
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

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Terms & Conditions</h1>
          <p className="text-[10px] text-muted-foreground">Last updated: June 2026</p>
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
          <p className="text-xs text-muted-foreground">Questions about our Terms?</p>
          <p className="text-xs text-primary font-semibold mt-1">legal@trustdepo.com</p>
        </div>
      </div>
    </div>
  );
}
