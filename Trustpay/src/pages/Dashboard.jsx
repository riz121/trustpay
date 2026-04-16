import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Bell, RefreshCw, Lock } from 'lucide-react';
import BalanceCard from '../components/escrow/BalanceCard';
import TransactionItem from '../components/escrow/TransactionItem';

export default function Dashboard() {
  const { user } = useAuth();
  const [isPulling, setIsPulling] = useState(false);
  const pullStartY = useRef(null);

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['escrow-transactions'],
    queryFn: () => apiClient.entities.EscrowTransaction.list('-created_date', 50),
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

  const activeTransactions = myTransactions.filter(
    t => !['released', 'cancelled'].includes(t.status)
  );

  const totalHeld = activeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalReleased = myTransactions
    .filter(t => t.status === 'released')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const recentTransactions = myTransactions.slice(0, 5);

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase mb-1">Welcome back</p>
          <h1 className="text-2xl font-bold">{user?.full_name || 'User'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 glass rounded-full flex items-center justify-center relative">
            <Bell className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            {activeTransactions.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-bold text-primary-foreground">
                {activeTransactions.length}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Balance Card */}
      <BalanceCard
        totalHeld={totalHeld}
        totalReleased={totalReleased}
        activeCount={activeTransactions.length}
      />

      {/* Quick Action */}
      {(() => {
        const isFree = user?.plan === 'free';
        const atLimit = isFree && myTransactions.length >= 3;
        return (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            {atLimit ? (
              <Link
                to="/profile"
                className="glass-strong rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform block border border-yellow-400/20"
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Upgrade to Create Escrow</p>
                  <p className="text-xs text-muted-foreground">Free plan limit reached (3/3) · Tap to upgrade</p>
                </div>
              </Link>
            ) : (
              <Link
                to="/new"
                className="glass-strong rounded-2xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform block"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">New Escrow</p>
                  <p className="text-xs text-muted-foreground">
                    {isFree ? `Create a secure transaction (${myTransactions.length}/3 free)` : 'Create a secure transaction'}
                  </p>
                </div>
              </Link>
            )}
          </motion.div>
        );
      })()}

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Recent</h2>
          {myTransactions.length > 5 && (
            <Link to="/transactions" className="text-xs text-primary font-medium">View all</Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
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
        ) : recentTransactions.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 glass-strong rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first escrow</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx, i) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                index={i}
                currentUserEmail={user?.email}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
