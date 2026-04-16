import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TransactionItem from '../components/escrow/TransactionItem';

const tabs = ['all', 'active', 'released', 'cancelled'];

export default function Transactions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const pullStartY = useRef(null);

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['escrow-transactions'],
    queryFn: () => apiClient.entities.EscrowTransaction.list('-created_date', 100),
  });

  const handleTouchStart = (e) => {
    pullStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (pullStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - pullStartY.current;
    if (delta > 70 && window.scrollY === 0) {
      setIsPulling(true);
      refetch().finally(() => setIsPulling(false));
    }
    pullStartY.current = null;
  };

  const myTransactions = transactions.filter(
    t => t.sender_email === user?.email || t.receiver_email === user?.email
  );

  const filtered = myTransactions.filter(tx => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'active' && !['released', 'cancelled', 'disputed'].includes(tx.status)) ||
      (activeTab === 'released' && tx.status === 'released') ||
      (activeTab === 'cancelled' && ['cancelled', 'disputed'].includes(tx.status));

    const matchSearch = !search ||
      tx.title?.toLowerCase().includes(search.toLowerCase()) ||
      tx.receiver_name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.sender_name?.toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;
  });

  return (
    <div className="px-5 pt-14" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 32 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center mb-2"
          >
            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">Transactions</h1>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="glass border-white/5 h-11 rounded-xl pl-10 text-sm placeholder:text-muted-foreground/50"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 mb-6 overflow-x-auto no-scrollbar"
      >
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'glass text-muted-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx, i) => (
            <TransactionItem key={tx.id} transaction={tx} index={i} currentUserEmail={user?.email} />
          ))}
        </div>
      )}
    </div>
  );
}
