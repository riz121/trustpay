import React from 'react';

const statusConfig = {
  pending_deposit: { label: 'Pending', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  funded: { label: 'Funded', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  sender_confirmed: { label: 'Sender OK', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  receiver_confirmed: { label: 'Receiver OK', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
  released: { label: 'Released', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  disputed: { label: 'Disputed', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  cancelled: { label: 'Cancelled', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending_deposit;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${config.color}`}>
      {config.label}
    </span>
  );
}