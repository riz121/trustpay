import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, Zap, Crown, Loader2, ArrowLeft, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/api/apiClient';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Shield,
    color: 'text-muted-foreground',
    borderColor: 'border-white/10',
    bgColor: 'bg-white/[0.02]',
    features: ['Up to 3 escrow transactions', 'Basic transaction tracking', 'Email notifications', 'Standard support'],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 39,
    icon: Zap,
    color: 'text-primary',
    borderColor: 'border-primary/30',
    bgColor: 'bg-primary/5',
    popular: true,
    features: ['Unlimited transactions', 'Priority processing', 'Advanced tracking', 'Priority support', 'Transaction history export'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    icon: Crown,
    color: 'text-accent',
    borderColor: 'border-accent/30',
    bgColor: 'bg-accent/5',
    features: ['Everything in Standard', 'Dedicated account manager', 'Dispute mediation priority', 'Custom release conditions', 'API access'],
  },
];

// ── Step 1: Plan Selection ────────────────────────────────────────────────────
function StepPlan({ selected, onSelect, onNext }) {
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Choose your plan</h1>
        <p className="text-muted-foreground text-sm">Select the plan that fits your needs. You can upgrade anytime.</p>
      </motion.div>

      <div className="space-y-3 flex-1 mt-6">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
          const isSelected = selected === plan.id;
          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              onClick={() => onSelect(plan.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-all relative overflow-hidden ${
                isSelected ? `${plan.borderColor} ${plan.bgColor} ring-1 ring-inset ${plan.borderColor}` : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">Popular</span>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? plan.bgColor : 'bg-white/5'}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? plan.color : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-base ${isSelected ? plan.color : 'text-foreground'}`}>{plan.name}</p>
                  <p className="text-muted-foreground text-xs">{plan.price === 0 ? 'Free forever' : `$${plan.price} / month`}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${isSelected ? 'border-primary bg-primary' : 'border-white/20'}`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </div>
              <ul className="space-y-1.5 pl-12">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className={`w-3 h-3 shrink-0 ${isSelected ? plan.color : 'text-muted-foreground/50'}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>

      <div className="py-8">
        <Button
          onClick={onNext}
          disabled={!selected}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 disabled:opacity-40"
        >
          {selected ? `Continue with ${plans.find(p => p.id === selected)?.name}` : 'Select a plan to continue'}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground mt-3">Paid plans billed monthly. Cancel anytime.</p>
      </div>
    </>
  );
}

// ── Step 2: Profile / Credentials ────────────────────────────────────────────
function StepProfile({ data, onChange, onNext, onBack }) {
  const valid = data.phone.trim().length >= 7 && data.city.trim().length >= 2;
  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Your details</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">We need a few details to set up your account.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Phone Number</Label>
          <Input
            type="tel"
            placeholder="+971 50 000 0000"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
            className="glass border-white/5 h-12 rounded-xl text-sm placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">City</Label>
          <Input
            placeholder="e.g. Dubai"
            value={data.city}
            onChange={e => onChange('city', e.target.value)}
            className="glass border-white/5 h-12 rounded-xl text-sm placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Company (Optional)</Label>
          <Input
            placeholder="Your company name"
            value={data.company}
            onChange={e => onChange('company', e.target.value)}
            className="glass border-white/5 h-12 rounded-xl text-sm placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Emirates ID (Optional)</Label>
          <Input
            placeholder="784-XXXX-XXXXXXX-X"
            value={data.emirates_id}
            onChange={e => onChange('emirates_id', e.target.value)}
            className="glass border-white/5 h-12 rounded-xl text-sm placeholder:text-muted-foreground/50"
          />
        </div>
      </motion.div>

      <div className="py-8">
        <Button
          onClick={onNext}
          disabled={!valid}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 disabled:opacity-40"
        >
          Continue
        </Button>
      </div>
    </>
  );
}

// ── Step 3: Payment Details ───────────────────────────────────────────────────
function StepPayment({ plan, data, onChange, onSubmit, onBack, loading }) {
  const planInfo = plans.find(p => p.id === plan);
  const valid = data.card_number.replace(/\s/g, '').length === 16 && data.expiry.length === 5 && data.cvv.length >= 3 && data.name.trim().length >= 2;

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payment</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-2">
          {planInfo?.name} plan — <span className="text-foreground font-semibold">${planInfo?.price}/mo</span>
        </p>
      </motion.div>

      {/* Card preview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-accent rounded-2xl p-5 mb-6 relative overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="flex justify-between items-start mb-8">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Escrow Pay</span>
        </div>
        <p className="text-base font-mono tracking-widest text-foreground mb-3">
          {data.card_number || '•••• •••• •••• ••••'}
        </p>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{data.name || 'CARDHOLDER NAME'}</span>
          <span>{data.expiry || 'MM/YY'}</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-4 flex-1">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Cardholder Name</Label>
          <Input
            placeholder="As on card"
            value={data.name}
            onChange={e => onChange('name', e.target.value)}
            className="glass border-white/5 h-12 rounded-xl text-sm placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Card Number</Label>
          <Input
            placeholder="1234 5678 9012 3456"
            value={data.card_number}
            onChange={e => onChange('card_number', formatCard(e.target.value))}
            inputMode="numeric"
            className="glass border-white/5 h-12 rounded-xl text-sm font-mono placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Expiry</Label>
            <Input
              placeholder="MM/YY"
              value={data.expiry}
              onChange={e => onChange('expiry', formatExpiry(e.target.value))}
              inputMode="numeric"
              className="glass border-white/5 h-12 rounded-xl text-sm font-mono placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">CVV</Label>
            <Input
              placeholder="•••"
              value={data.cvv}
              onChange={e => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              type="password"
              className="glass border-white/5 h-12 rounded-xl text-sm placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
      </motion.div>

      <div className="py-8">
        <Button
          onClick={onSubmit}
          disabled={!valid || loading}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay $${planInfo?.price}/mo`}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> Secured with 256-bit SSL encryption
        </p>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SelectPlan({ onComplete }) {
  const [step, setStep] = useState(1); // 1=plan, 2=profile, 3=payment
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({ phone: '', city: '', company: '', emirates_id: '' });
  const [payment, setPayment] = useState({ name: '', card_number: '', expiry: '', cvv: '' });

  const updateProfile = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const updatePayment = (k, v) => setPayment(p => ({ ...p, [k]: v }));

  const handlePlanNext = () => {
    setStep(2);
  };

  const handleProfileNext = () => {
    if (selected === 'free') {
      handleFinish();
    } else {
      setStep(3);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await apiClient.auth.updateMe({
        plan: selected,
        plan_selected_at: new Date().toISOString(),
        phone: profile.phone,
        city: profile.city,
        company: profile.company,
        emirates_id: profile.emirates_id,
      });
      toast.success('Account set up successfully!');
      onComplete(selected);
    } catch (err) {
      toast.error(err?.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 -left-16 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-52 h-52 rounded-full bg-accent/6 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-5 max-w-lg mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center gap-3 pt-14 pb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight leading-none">Escrow Pay</p>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">UAE</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 pt-4 pb-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${s <= step ? 'bg-primary' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <StepPlan selected={selected} onSelect={setSelected} onNext={handlePlanNext} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <StepProfile data={profile} onChange={updateProfile} onNext={handleProfileNext} onBack={() => setStep(1)} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
              <StepPayment
                plan={selected}
                data={payment}
                onChange={updatePayment}
                onSubmit={handleFinish}
                onBack={() => setStep(2)}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}