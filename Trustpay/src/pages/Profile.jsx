import React from 'react';
import apiClient from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, LogOut, ChevronRight, FileText, HelpCircle, Lock, Trash2, Edit3, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Profile() {
  const { user, logout } = useAuth();

  const { data: transactions = [] } = useQuery({
    queryKey: ['escrow-transactions'],
    queryFn: () => apiClient.entities.EscrowTransaction.list('-created_date', 200),
  });

  const myTx = transactions.filter(
    t => t.sender_email === user?.email || t.receiver_email === user?.email
  );

  const stats = {
    total: myTx.length,
    active: myTx.filter(t => !['released', 'cancelled', 'disputed'].includes(t.status)).length,
    released: myTx.filter(t => t.status === 'released').length,
    totalVolume: myTx.reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  const menuItems = [
    { icon: FileText, label: 'Transaction History', path: '/transactions' },
    { icon: CreditCard, label: 'Payments & Withdrawals', path: '/payments' },
    { icon: Lock, label: 'Security', path: null },
    { icon: HelpCircle, label: 'Help & FAQ', path: '/faq' },
    { icon: FileText, label: 'Terms & Conditions', path: '/terms' },
    { icon: Shield, label: 'Privacy Policy', path: '/privacy' },
  ];

  const handleDeleteAccount = async () => {
    try {
      await apiClient.auth.deleteAccount();
    } finally {
      await logout();
    }
  };

  return (
    <div className="px-5 pt-14">
      {/* Avatar & Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 rounded-full glass-accent flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
          {(user?.full_name || 'U')[0].toUpperCase()}
        </div>
        <h1 className="text-xl font-bold">{user?.full_name || 'User'}</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Shield className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">UAE Verified</span>
        </div>
        <Link
          to="/profile/edit"
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary font-semibold px-4 py-1.5 glass rounded-full"
        >
          <Edit3 className="w-3 h-3" /> Edit Profile
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          { label: 'Total', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Volume', value: `${(stats.totalVolume / 1000).toFixed(1)}K` },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-xl p-4 text-center">
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden mb-6"
      >
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={() => item.path && (window.location.href = item.path)}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-white/[0.02] ${
              i < menuItems.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            <item.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm flex-1">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <Button
          variant="outline"
          onClick={logout}
          className="w-full h-12 rounded-xl glass border-white/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {/* Delete Account */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong border-white/10 bg-background/90 backdrop-blur-xl rounded-2xl mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Delete Account?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                This will permanently delete your account and all associated data. Active escrow transactions may be affected. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="glass border-white/5 rounded-xl h-11">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl h-11"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Footer */}
      <div className="text-center mt-8 mb-4">
        <p className="text-[10px] text-muted-foreground">TrustPay · UAE</p>
        <p className="text-[10px] text-muted-foreground/50">Secure payments, simplified</p>
      </div>
    </div>
  );
}
