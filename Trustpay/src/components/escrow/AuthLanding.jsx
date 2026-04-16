import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Shield, text: 'Funds held securely in UAE-regulated accounts' },
  { icon: Zap, text: 'Instant status updates for both parties' },
  { icon: Users, text: 'Trusted by buyers & sellers across the UAE' },
];

export default function AuthLanding() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ambient bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 -left-16 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-52 h-52 rounded-full bg-accent/6 blur-3xl" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-6 max-w-lg mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-3 pt-16 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight leading-none">Escrow Pay</p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">UAE</p>
          </div>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex-1 flex flex-col justify-center"
        >
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-6"
            >
              <Lock className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-semibold uppercase tracking-widest">Secure & Trusted</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-4xl font-extrabold tracking-tight leading-tight mb-4"
            >
              The smarter way to pay in the{' '}
              <span className="text-primary">UAE</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-muted-foreground text-base leading-relaxed"
            >
              Escrow payments that protect both buyer and seller — from freelance gigs to property deals.
            </motion.p>
          </div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-10"
          >
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="flex items-center gap-3 glass rounded-xl px-4 py-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm text-foreground/80">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pb-12 space-y-3"
        >
          <Button
            onClick={() => window.location.reload()}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            Sign In / Create Account
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            By continuing you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}