import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';

export default function TransactionItem({ transaction, index = 0, currentUserEmail }) {
  const isSender = transaction.sender_email === currentUserEmail;
  const counterparty = isSender ? transaction.receiver_name : transaction.sender_name;
  const counterpartyEmail = isSender ? transaction.receiver_email : transaction.sender_email;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/transaction/${transaction.id}`}
        className="glass rounded-xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform block"
      >
        <div className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {(counterparty || counterpartyEmail || '?')[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium truncate">{transaction.title}</p>
            <span className="text-sm font-bold text-foreground whitespace-nowrap">
              AED {transaction.amount?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground truncate">
              {isSender ? 'To' : 'From'}: {counterparty || counterpartyEmail}
            </p>
            <StatusBadge status={transaction.status} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {format(new Date(transaction.created_date), 'MMM d, yyyy')}
          </p>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </Link>
    </motion.div>
  );
}