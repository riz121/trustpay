import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewTransaction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    amount: '',
    receiver_email: '',
    receiver_name: '',
    notes: '',
    release_date: '',
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.functions.invoke('createEscrow', data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['escrow-transactions'] });
      toast.success('Escrow created successfully');
      navigate(`/transaction/${result.id}`);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create escrow');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      amount: parseFloat(form.amount),
    });
  };

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="px-5 pt-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 mb-8"
      >
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">New Escrow</h1>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-accent rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-foreground">Secure Payment</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Funds are held securely until both parties confirm the transaction is complete.
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Transaction Title</Label>
          <Input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Freelance project payment"
            required
            className="glass border-white/5 h-12 rounded-xl text-sm placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Amount (AED)</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => updateField('amount', e.target.value)}
            placeholder="0.00"
            required
            min="1"
            step="0.01"
            className="glass border-white/5 h-12 rounded-xl text-2xl font-bold placeholder:text-muted-foreground/30 placeholder:text-2xl placeholder:font-bold"
          />
        </div>

        <div className="glass rounded-xl p-4 space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Receiver Details</p>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={form.receiver_name}
              onChange={(e) => updateField('receiver_name', e.target.value)}
              placeholder="Full name"
              className="bg-transparent border-white/5 h-11 rounded-lg text-sm placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={form.receiver_email}
              onChange={(e) => updateField('receiver_email', e.target.value)}
              placeholder="email@example.com"
              required
              className="bg-transparent border-white/5 h-11 rounded-lg text-sm placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Release Date (Optional)</Label>
          <Input
            type="date"
            value={form.release_date}
            onChange={(e) => updateField('release_date', e.target.value)}
            className="glass border-white/5 h-12 rounded-xl text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Notes (Optional)</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Add any details about this transaction..."
            className="glass border-white/5 rounded-xl text-sm min-h-[80px] placeholder:text-muted-foreground/50"
          />
        </div>

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `Deposit AED ${form.amount || '0.00'}`
          )}
        </Button>
      </motion.form>
    </div>
  );
}
