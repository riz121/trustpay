import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

const faqs = [
  {
    category: 'General',
    items: [
      {
        q: 'What is Escrow Pay?',
        a: 'Escrow Pay is a secure payment platform for the UAE that holds funds safely between two parties until both confirm the transaction is complete. It protects buyers and sellers from fraud.',
      },
      {
        q: 'Who can use Escrow Pay?',
        a: 'Escrow Pay is available to UAE residents and businesses. You must have a valid Emirates ID or trade license to use the platform.',
      },
      {
        q: 'Is Escrow Pay regulated in the UAE?',
        a: 'We operate in compliance with UAE Central Bank regulations and ADGM/DIFC fintech frameworks for payment service providers.',
      },
    ],
  },
  {
    category: 'Transactions',
    items: [
      {
        q: 'How does an escrow transaction work?',
        a: '1. The buyer deposits funds into the escrow. 2. The seller delivers goods or services. 3. Both parties confirm completion. 4. Funds are released to the seller. If there\'s a dispute, our team mediates.',
      },
      {
        q: 'What is the minimum and maximum transaction amount?',
        a: 'Minimum: AED 100. Maximum: AED 500,000 per transaction. For higher amounts, contact our enterprise team.',
      },
      {
        q: 'How long are funds held in escrow?',
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
        q: 'How do I add funds to escrow?',
        a: 'You can deposit via UAE bank transfer, credit/debit card, or UAEFTS. Funds are credited within 1 business hour.',
      },
      {
        q: 'When will released funds reach my bank?',
        a: 'Once both parties confirm, funds are released immediately. UAE bank transfers typically settle within 1–2 business days.',
      },
      {
        q: 'What are the fees?',
        a: 'We charge a flat 1.5% escrow fee on the transaction amount, deducted at release. There are no hidden fees or monthly charges.',
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
        a: 'All escrow funds are held in segregated accounts at a licensed UAE bank. Your funds are never mixed with company funds and are fully insured.',
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

export default function FAQ() {
  const navigate = useNavigate();
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="px-5 pt-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">Help & FAQ</h1>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="glass border-white/5 h-11 rounded-xl pl-10 text-sm placeholder:text-muted-foreground/50"
        />
      </motion.div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No results found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((cat, ci) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.05 }}
            >
              <p className="text-[10px] text-primary uppercase tracking-widest font-semibold mb-3 pl-1">
                {cat.category}
              </p>
              <div className="glass rounded-2xl overflow-hidden">
                {cat.items.map((item, ii) => {
                  const key = `${cat.category}-${ii}`;
                  const isOpen = openItem === key;
                  return (
                    <div key={key} className={ii < cat.items.length - 1 ? 'border-b border-white/5' : ''}>
                      <button
                        onClick={() => setOpenItem(isOpen ? null : key)}
                        className="w-full flex items-center justify-between gap-3 p-4 text-left"
                      >
                        <span className="text-sm font-medium">{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground leading-relaxed px-4 pb-4">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-accent rounded-2xl p-5 mt-6 mb-4 text-center"
      >
        <p className="text-sm font-medium mb-1">Still need help?</p>
        <p className="text-xs text-muted-foreground mb-3">Our UAE support team is available 24/7</p>
        <p className="text-xs text-primary font-semibold">support@escrowpay.ae</p>
      </motion.div>
    </div>
  );
}