import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function BalanceCard({ totalHeld, totalReleased, activeCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-accent rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Decorative orbs */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">Escrow Balance</span>
        </div>

        <div className="mb-6">
          <span className="text-sm text-muted-foreground">AED</span>
          <span className="text-4xl font-bold tracking-tight ml-1">
            {totalHeld.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full glass flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Held</p>
              <p className="text-sm font-semibold">{activeCount} active</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full glass flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Released</p>
              <p className="text-sm font-semibold">AED {totalReleased.toLocaleString('en-AE', { minimumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}