import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useAuth } from '@/lib/AuthContext';
import { Zap, X } from 'lucide-react';

export default function AppLayout() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (user?.plan === 'free') setShowBanner(true);
  }, [user]);

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-40 left-1/3 w-40 h-40 rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Upgrade banner for free plan */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-primary/90 backdrop-blur-sm px-4 py-2 text-primary-foreground text-xs font-medium"
          style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span>You're on the Free plan (3 tx limit).</span>
          <Link to="/profile" className="underline font-bold whitespace-nowrap">Upgrade now →</Link>
          <button onClick={() => setShowBanner(false)} className="ml-1 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main
        className="relative z-10 max-w-lg mx-auto no-scrollbar"
        style={{
          paddingTop: showBanner ? 'calc(2.5rem + env(safe-area-inset-top))' : 'env(safe-area-inset-top)',
          paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))'
        }}
      >
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}