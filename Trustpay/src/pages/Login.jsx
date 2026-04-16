import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowRight, Lock, Zap, Users, MailCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/AuthContext';
import apiClient from '@/api/apiClient';
import { toast } from 'sonner';

const features = [
  { icon: Shield, text: 'Funds held securely in UAE-regulated accounts' },
  { icon: Zap, text: 'Instant status updates for both parties' },
  { icon: Users, text: 'Trusted by buyers & sellers across the UAE' },
];

export default function Login({ initialError = '', initialMode = 'landing' }) {
  const { login, register, loginWithToken } = useAuth();
  // modes: 'landing' | 'signin' | 'register' | 'verify'
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [form, setForm] = useState({ email: '', password: '', full_name: '' });
  const [emailExists, setEmailExists] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setEmailExists(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('not confirmed') || msg.toLowerCase().includes('email')) {
        setError('Your email is not verified yet. Please check your inbox and click the confirmation link before signing in.');
      } else {
        setError(msg || 'Sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) { setError('All fields are required.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setIsLoading(true);
    setError('');
    try {
      const result = await register(form.email, form.password, form.full_name);
      if (result.requires_verification === false) {
        // Email confirmation disabled — user is logged in immediately
        toast.success('Account created! Welcome to TrustPay.');
        loginWithToken(result.access_token, result.user);
      } else {
        // Email confirmation enabled — show OTP entry screen
        setRegisteredEmail(form.email);
        setMode('verify');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already exists') || err.status === 409) {
        setEmailExists(true);
        setError('An account with this email already exists.');
      } else {
        setError(msg || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otpCode.trim();
    if (!code) { setOtpError('Please enter the verification code.'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const data = await apiClient.auth.verifyOtp(registeredEmail, code);
      toast.success('Email verified! Welcome to TrustPay.');
      // Set user in context directly — no page reload needed
      loginWithToken(data.access_token, data.user);
    } catch (err) {
      setOtpError(err.message || 'Invalid code. Please try again.');
      setOtpCode('');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await apiClient.auth.resendOtp(registeredEmail);
      setResendCooldown(60);
      cooldownRef.current = setInterval(() => {
        setResendCooldown(v => {
          if (v <= 1) { clearInterval(cooldownRef.current); return 0; }
          return v - 1;
        });
      }, 1000);
    } catch (err) {
      setOtpError(err.message || 'Could not resend code.');
    }
  };

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
            <p className="text-lg font-extrabold tracking-tight leading-none">TrustPay</p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">UAE</p>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Landing ─────────────────────────────────────────────── */}
          {mode === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col justify-center">
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-6">
                  <Lock className="w-3 h-3 text-primary" />
                  <span className="text-[10px] text-primary font-semibold uppercase tracking-widest">Secure & Trusted</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
                  The smarter way to pay in the <span className="text-primary">UAE</span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Escrow payments that protect both buyer and seller — from freelance gigs to property deals.
                </p>
              </div>
              <div className="space-y-3 mb-10">
                {features.map(({ icon: Icon, text }, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground/80">{text}</p>
                  </motion.div>
                ))}
              </div>
              <div className="pb-12 space-y-3">
                <Button onClick={() => setMode('signin')} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 flex items-center justify-center gap-2">
                  Sign In <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" onClick={() => setMode('register')} className="w-full h-14 rounded-2xl font-bold text-base">
                  Create Account
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">By continuing you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </motion.div>
          )}

          {/* ── Sign In ──────────────────────────────────────────────── */}
          {mode === 'signin' && (
            <motion.div key="signin" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back</h2>
                <p className="text-muted-foreground text-sm">Sign in to your TrustPay account</p>
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={handleChange} className="h-12 rounded-xl pr-11" required />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3 leading-relaxed">
                    {error}
                  </motion.div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base mt-2">
                  {isLoading ? <div className="w-5 h-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{' '}
                <button onClick={() => { setMode('register'); setError(''); setForm({ email: '', password: '', full_name: '' }); }} className="text-primary font-semibold hover:underline">Create one</button>
              </p>
              <button onClick={() => { setMode('landing'); setError(''); }} className="mt-4 text-center text-xs text-muted-foreground hover:text-foreground">← Back</button>
            </motion.div>
          )}

          {/* ── Register ─────────────────────────────────────────────── */}
          {mode === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight mb-2">Create account</h2>
                <p className="text-muted-foreground text-sm">Join TrustPay — it's free</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" type="text" autoComplete="name" placeholder="Ahmed Al Mansoori" value={form.full_name} onChange={handleChange} className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} className="h-12 rounded-xl pr-11" required />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl px-4 py-3 leading-relaxed bg-destructive/10">
                    <p className="text-sm text-destructive">{error}</p>
                    {emailExists && (
                      <button
                        type="button"
                        onClick={() => { setMode('signin'); setError(''); setEmailExists(false); }}
                        className="mt-2 text-sm font-semibold text-primary underline underline-offset-2"
                      >
                        Sign in instead →
                      </button>
                    )}
                  </motion.div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base mt-2">
                  {isLoading ? <div className="w-5 h-5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4 ml-1" /></>}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(''); setForm({ email: '', password: '', full_name: '' }); }} className="text-primary font-semibold hover:underline">Sign in</button>
              </p>
              <button onClick={() => { setMode('landing'); setError(''); }} className="mt-4 text-center text-xs text-muted-foreground hover:text-foreground">← Back</button>
            </motion.div>
          )}

          {/* ── Verify Email — OTP code entry ─────────────────────────── */}
          {mode === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="flex-1 flex flex-col justify-center items-center text-center">
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                <MailCheck className="w-12 h-12 text-primary" strokeWidth={1.5} />
              </motion.div>

              <h2 className="text-3xl font-extrabold tracking-tight mb-3">Enter the code</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-1">
                We sent a verification code to
              </p>
              <p className="text-primary font-semibold text-sm mb-8 break-all">{registeredEmail}</p>

              {/* OTP input — accepts any length code from Supabase */}
              <div className="w-full mb-4">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter code"
                  value={otpCode}
                  onChange={e => { setOtpCode(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  autoFocus
                  className="w-full h-16 text-center text-3xl font-bold tracking-[0.3em] rounded-xl glass border border-white/10 focus:border-primary/60 focus:outline-none bg-transparent text-foreground caret-primary"
                />
              </div>

              {otpError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive mb-4">
                  {otpError}
                </motion.p>
              )}

              <div className="w-full space-y-3">
                <Button
                  onClick={handleVerify}
                  disabled={otpLoading || !otpCode.trim()}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base"
                >
                  {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Didn't receive a code?{' '}
                  {resendCooldown > 0 ? (
                    <span className="text-muted-foreground">Resend in {resendCooldown}s</span>
                  ) : (
                    <button onClick={handleResend} className="text-primary font-semibold hover:underline">Resend code</button>
                  )}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
