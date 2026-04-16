import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '../components/escrow/StatusBadge';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TransactionDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const txId = window.location.pathname.split('/transaction/')[1];

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['escrow-transaction', txId],
    queryFn: async () => {
      const results = await apiClient.entities.EscrowTransaction.filter({ id: txId });
      return results[0];
    },
    enabled: !!txId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['escrow-transaction', txId] });
    queryClient.invalidateQueries({ queryKey: ['escrow-transactions'] });
  };

  const confirmMutation = useMutation({
    mutationFn: () => apiClient.functions.invoke('confirmEscrow', { transaction_id: txId }),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.status === 'released' ? 'Funds released!' : 'Confirmation recorded');
    },
    onError: (err) => toast.error(err?.message || 'Failed to confirm'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiClient.functions.invoke('cancelEscrow', { transaction_id: txId }),
    onSuccess: () => { invalidate(); toast.success('Transaction cancelled'); },
    onError: (err) => toast.error(err?.message || 'Failed to cancel'),
  });

  const disputeMutation = useMutation({
    mutationFn: (reason) => apiClient.functions.invoke('disputeEscrow', { transaction_id: txId, reason }),
    onSuccess: () => { invalidate(); toast.success('Dispute raised — our team will review within 3 days'); },
    onError: (err) => toast.error(err?.message || 'Failed to raise dispute'),
  });

  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProof(true);
    setProofFile(file);
    setUploadingProof(false);
  };

  const removeProof = () => {
    setProofFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isPending = confirmMutation.isPending || cancelMutation.isPending || disputeMutation.isPending;

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="px-5 pt-14 text-center">
        <p className="text-muted-foreground">Transaction not found</p>
      </div>
    );
  }

  const isSender = transaction.sender_email === user.email?.toLowerCase();
  const isReceiver = transaction.receiver_email === user.email?.toLowerCase();
  const isParty = isSender || isReceiver;

  const handleConfirm = () => confirmMutation.mutate();
  const handleCancel = () => cancelMutation.mutate();
  const handleDispute = () => {
    if (!showDisputeInput) { setShowDisputeInput(true); return; }
    if (disputeReason.trim().length < 10) { toast.error('Please provide more detail (min 10 characters)'); return; }
    disputeMutation.mutate(disputeReason);
  };

  const myConfirmed = isSender ? transaction.sender_confirmed : transaction.receiver_confirmed;
  const otherConfirmed = isSender ? transaction.receiver_confirmed : transaction.sender_confirmed;
  const isActive = !['released', 'cancelled', 'disputed'].includes(transaction.status);

  return (
    <div className="px-5 pt-14">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 glass rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold">Details</h1>
      </motion.div>

      {/* Amount Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-accent rounded-2xl p-6 text-center mb-6 relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary/10 blur-2xl" />
        <StatusBadge status={transaction.status} />
        <div className="mt-4">
          <span className="text-sm text-muted-foreground">AED</span>
          <span className="text-4xl font-bold ml-1">{transaction.amount?.toLocaleString()}</span>
        </div>
        <p className="text-sm text-foreground mt-2 font-medium">{transaction.title}</p>
      </motion.div>

      {/* Parties */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 mb-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full glass-strong flex items-center justify-center text-xs font-bold text-primary">
              {(transaction.sender_name || transaction.sender_email)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sender</p>
              <p className="text-sm font-medium">{transaction.sender_name || transaction.sender_email}</p>
            </div>
          </div>
          {transaction.sender_confirmed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Clock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="border-t border-white/5" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full glass-strong flex items-center justify-center text-xs font-bold text-accent">
              {(transaction.receiver_name || transaction.receiver_email)[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receiver</p>
              <p className="text-sm font-medium">{transaction.receiver_name || transaction.receiver_email}</p>
            </div>
          </div>
          {transaction.receiver_confirmed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Clock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-5 mb-6 space-y-3"
      >
        {transaction.notes && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Notes</p>
            <p className="text-sm mt-1">{transaction.notes}</p>
          </div>
        )}
        {transaction.release_date && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Expected Release</p>
            <p className="text-sm mt-1">{format(new Date(transaction.release_date), 'MMM d, yyyy')}</p>
          </div>
        )}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Created</p>
          <p className="text-sm mt-1">{format(new Date(transaction.created_date), 'MMM d, yyyy · h:mm a')}</p>
        </div>
      </motion.div>

      {/* Confirmation Progress */}
      {isActive && isParty && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-accent rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider">Confirmation</p>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${myConfirmed ? 'bg-emerald-400/20' : 'glass'}`}>
              {myConfirmed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <span className="text-sm">You — {myConfirmed ? 'Confirmed' : 'Pending'}</span>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${otherConfirmed ? 'bg-emerald-400/20' : 'glass'}`}>
              {otherConfirmed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <span className="text-sm">Other party — {otherConfirmed ? 'Confirmed' : 'Pending'}</span>
          </div>

          {!myConfirmed && (
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              {confirmMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Release'}
            </Button>
          )}
        </motion.div>
      )}

      {/* Released state */}
      {transaction.status === 'released' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 text-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-lg font-bold">Funds Released</p>
          <p className="text-xs text-muted-foreground mt-1">Both parties confirmed. Transaction complete.</p>
        </motion.div>
      )}

      {/* Actions */}
      {isActive && isParty && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 mb-8"
        >
          {showDisputeInput && (
            <div className="space-y-2">
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full glass border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/50 min-h-[80px] resize-none bg-transparent focus:outline-none focus:border-yellow-400/40"
              />
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDispute}
              disabled={isPending}
              className="flex-1 h-12 rounded-xl glass border-white/5 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400"
            >
              {disputeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><AlertTriangle className="w-4 h-4 mr-2" />{showDisputeInput ? 'Submit Dispute' : 'Dispute'}</>}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1 h-12 rounded-xl glass border-white/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" />Cancel</>}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}