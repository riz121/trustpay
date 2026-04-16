import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Escrow Pay, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform. These terms apply to all users, including senders and receivers of escrow transactions.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years of age and a resident of the United Arab Emirates to use Escrow Pay. By registering, you confirm that you have the legal capacity to enter into binding agreements under UAE law.',
  },
  {
    title: '3. Escrow Services',
    body: 'Escrow Pay acts as a neutral third party to hold funds between two parties during a transaction. Funds are released only when both the sender and receiver confirm that the agreed conditions have been met. Escrow Pay does not take sides in disputes and acts solely as a neutral custodian.',
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
    body: 'In the event of a dispute, both parties must submit supporting evidence through the app within 7 business days. Our mediation team will review the case and issue a decision within 3 business days. The decision of Escrow Pay\'s mediation team is final and binding.',
  },
  {
    title: '7. Cancellations & Refunds',
    body: 'Transactions may be cancelled before both parties confirm completion. Once both parties confirm, the transaction is final and cannot be reversed. Refunds for cancelled transactions are processed within 2–5 business days.',
  },
  {
    title: '8. Prohibited Activities',
    body: 'You may not use Escrow Pay for illegal transactions, money laundering, terrorist financing, or any activity prohibited under UAE law. Escrow Pay reserves the right to freeze funds and report suspicious activity to the UAE Financial Intelligence Unit (FIU).',
  },
  {
    title: '9. Limitation of Liability',
    body: 'Escrow Pay\'s liability is limited to the value of funds held in escrow for your transaction. We are not liable for any indirect, incidental, or consequential damages arising from the use of our platform.',
  },
  {
    title: '10. Governing Law',
    body: 'These Terms are governed by the laws of the United Arab Emirates. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.',
  },
  {
    title: '11. Changes to Terms',
    body: 'Escrow Pay reserves the right to modify these Terms at any time. Users will be notified of material changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the updated Terms.',
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
          <p className="text-xs text-muted-foreground">Questions about our Terms?</p>
          <p className="text-xs text-primary font-semibold mt-1">legal@escrowpay.ae</p>
        </div>
      </div>
    </div>
  );
}