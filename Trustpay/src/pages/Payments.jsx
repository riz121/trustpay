import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight, Building2,
  Loader2, CheckCircle2, Clock, XCircle, CreditCard, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Payments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({ bank_name: '', iban: '', account_name: '' });

  const { data: transactions = [] } = useQuery({
    queryKey: ['escrow-transactions'],
    queryFn: () => apiClient.entities.EscrowTransaction.list('-created_date', 200),
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => apiClient.user.getBankAccounts(),
  });

  const addBankMutation = useMutation({
    mutationFn: (data) => apiClient.user.addBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setShowAddBank(false);
      setNewBank({ bank_name: '', iban: '', account_name: '' });
      toast.success('Bank account added');
    },
    onError: (err) => toast.error(err?.message || 'Failed to add bank account'),
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount) => apiClient.functions.invoke('withdrawalRequest', { amount }),
    onSuccess: () => {
      setWithdrawAmount('');
      toast.success('Withdrawal request submitted — funds arrive in 1–2 business days');
    },
    onError: (err) => toast.error(err?.message || 'Failed to submit withdrawal'),
  });

  const myTx = transactions.filter(
    t => t.sender_email === user?.email || t.receiver_email === user?.email
  );

  const releasedAsReceiver = myTx.filter(
    t => t.status === 'released' && t.receiver_email === user?.email
  );
  const available = releasedAsReceiver.reduce((s, t) => s + (t.amount || 0), 0);
  const pending = myTx
    .filter(t => !['released', 'cancelled', 'disputed'].includes(t.status) && t.receiver_email === user?.email)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const ledger = myTx.map(t => {
    const isSender = t.sender_email === user?.email;
    return {
      id: t.id,
      title: t.title,
      amount: t.amount,
      type: isSender ? 'deposit' : 'incoming',
      status: t.status,
      date: t.created_date,
    };
  });

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) < 100) {
      toast.error('Minimum withdrawal is AED 100');
      return;
    }
    withdrawMutation.mutate(parseFloat(withdrawAmount));
  };

  const handleAddBank = (e) => {
    e.preventDefault();
    addBankMutation.mutate(newBank);
  };

  const statusIcon = (status) => {
    if (status === 'released') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (['cancelled', 'disputed'].includes(status)) return <XCircle className="w-4 h-4 text-destructive" />;
    return <Clock className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <div className="px-5 pt-14">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">Payments</h1>
      </motion.div>

      {/* Balance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-accent rounded-2xl p-5 mb-6 relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary/10 blur-2xl" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Wallet Overview</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Available</p>
            <p className="text-2xl font-bold text-primary">AED {available.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pending Release</p>
            <p className="text-2xl font-bold">AED {pending.toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['overview', 'withdraw'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              tab === t ? 'bg-primary text-primary-foreground' : 'glass text-muted-foreground'
            }`}
          >
            {t === 'overview' ? 'Transaction Log' : 'Withdraw to Bank'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {ledger.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No payment activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ledger.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-xl p-4 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    entry.type === 'deposit' ? 'bg-destructive/10' : 'bg-primary/10'
                  }`}>
                    {entry.type === 'deposit'
                      ? <ArrowUpRight className="w-4 h-4 text-destructive" />
                      : <ArrowDownLeft className="w-4 h-4 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(entry.date), 'MMM d, yyyy')} · {entry.type === 'deposit' ? 'Deposited' : 'Incoming'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-sm font-bold ${entry.type === 'deposit' ? 'text-muted-foreground' : 'text-primary'}`}>
                      {entry.type === 'deposit' ? '−' : '+'} AED {entry.amount?.toLocaleString()}
                    </span>
                    {statusIcon(entry.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {tab === 'withdraw' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Bank Accounts */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank Accounts</p>
              </div>
              <button
                onClick={() => setShowAddBank(v => !v)}
                className="flex items-center gap-1 text-xs text-primary font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {bankAccounts.length === 0 && !showAddBank && (
              <p className="text-xs text-muted-foreground">No bank accounts added yet.</p>
            )}

            {bankAccounts.map(account => (
              <div key={account.id} className="space-y-2 mb-3 pb-3 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Bank</span>
                  <span className="text-sm font-medium">{account.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">IBAN</span>
                  <span className="text-xs font-mono">{account.iban}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{account.account_name}</span>
                </div>
              </div>
            ))}

            {showAddBank && (
              <form onSubmit={handleAddBank} className="space-y-3 mt-4 pt-4 border-t border-white/5">
                <Input
                  placeholder="Bank name (e.g. Emirates NBD)"
                  value={newBank.bank_name}
                  onChange={e => setNewBank(b => ({ ...b, bank_name: e.target.value }))}
                  required
                  className="glass border-white/5 h-11 rounded-xl text-sm"
                />
                <Input
                  placeholder="IBAN (e.g. AE07 0331 2345 6789 0123 456)"
                  value={newBank.iban}
                  onChange={e => setNewBank(b => ({ ...b, iban: e.target.value }))}
                  required
                  className="glass border-white/5 h-11 rounded-xl text-sm font-mono"
                />
                <Input
                  placeholder="Account holder name"
                  value={newBank.account_name}
                  onChange={e => setNewBank(b => ({ ...b, account_name: e.target.value }))}
                  required
                  className="glass border-white/5 h-11 rounded-xl text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddBank(false)}
                    className="flex-1 h-10 rounded-xl glass border-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addBankMutation.isPending}
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground"
                  >
                    {addBankMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Withdraw Form */}
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Amount to Withdraw (AED)</Label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                min="100"
                max={available}
                required
                className="glass border-white/5 h-14 rounded-xl text-2xl font-bold placeholder:text-muted-foreground/30 placeholder:text-2xl"
              />
              <p className="text-[11px] text-muted-foreground pl-1">Available: AED {available.toLocaleString()}</p>
            </div>

            <div className="glass rounded-xl p-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Withdrawal amount</span>
                <span>AED {withdrawAmount || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing fee (0%)</span>
                <span>Free</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between font-semibold text-foreground">
                <span>You receive</span>
                <span>AED {withdrawAmount || '0.00'}</span>
              </div>
              <p className="text-[10px] pt-1">Funds arrive in 1–2 business days via UAEFTS</p>
            </div>

            <Button
              type="submit"
              disabled={withdrawMutation.isPending || !withdrawAmount || parseFloat(withdrawAmount) > available}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90"
            >
              {withdrawMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : `Withdraw AED ${withdrawAmount || '0.00'}`}
            </Button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
