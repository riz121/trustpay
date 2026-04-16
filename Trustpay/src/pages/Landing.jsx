import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, CheckCircle, ArrowRight, Star, Users, TrendingUp, Globe, ChevronDown, Menu, X, Briefcase, Home, ShoppingBag, Code, BadgeCheck, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_LINKS = ['Features', 'How It Works', 'Pricing', 'Testimonials'];

const FEATURES = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    desc: 'Funds are held in regulated escrow accounts with 256-bit SSL encryption and multi-factor authentication.',
    gradient: 'from-teal-500/20 to-teal-500/5',
    iconColor: 'text-teal-400',
  },
  {
    icon: Zap,
    title: 'Instant Settlements',
    desc: 'Release funds in seconds once both parties confirm. No delays, no paperwork, no banks.',
    gradient: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-400',
  },
  {
    icon: Globe,
    title: 'UAE Compliant',
    desc: 'Fully regulated for the UAE market. Compliant with CBUAE guidelines and international standards.',
    gradient: 'from-teal-400/20 to-purple-500/10',
    iconColor: 'text-teal-300',
  },
  {
    icon: Users,
    title: 'Dispute Resolution',
    desc: 'Our expert team mediates disputes and ensures fair outcomes for both buyers and sellers.',
    gradient: 'from-purple-400/20 to-teal-500/10',
    iconColor: 'text-purple-300',
  },
];

const STEPS = [
  { num: '01', title: 'Create an Escrow', desc: 'Set up a transaction with the amount, description, and receiver details in under 60 seconds.' },
  { num: '02', title: 'Funds are Secured', desc: 'The sender deposits funds. They\'re held safely in escrow until the deal is done.' },
  { num: '03', title: 'Release & Done', desc: 'Both parties confirm completion. Funds are released instantly. Everyone wins.' },
];

const TESTIMONIALS = [
  { name: 'Ahmed Al Rashid', role: 'Property Developer, Dubai', stars: 5, text: 'TrustPay gave us the confidence to close a AED 2M property deal with a new partner. The escrow process was seamless and professional.' },
  { name: 'Fatima Hassan', role: 'Freelance Designer, Abu Dhabi', stars: 5, text: 'As a freelancer, getting paid was always stressful. Now I use TrustPay for every project. Clients trust it and I get paid on time.' },
  { name: 'Raj Patel', role: 'E-commerce Seller, Sharjah', stars: 5, text: 'We handle 30+ transactions a month through TrustPay. The Standard plan is worth every dirham. Zero disputes since we switched.' },
];

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    currency: 'AED',
    period: 'forever',
    desc: 'Perfect for individuals trying escrow for the first time.',
    features: [
      { text: 'Up to 3 escrow transactions', included: true },
      { text: 'Basic transaction tracking', included: true },
      { text: 'Email notifications', included: true },
      { text: 'Standard support (48h)', included: true },
      { text: 'Unlimited transactions', included: false },
      { text: 'Priority processing', included: false },
      { text: 'Transaction history export', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '149',
    currency: 'AED',
    period: 'per month',
    desc: 'For freelancers and small businesses closing deals regularly.',
    features: [
      { text: 'Unlimited transactions', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Advanced tracking & history', included: true },
      { text: 'Priority support (4h)', included: true },
      { text: 'Transaction history export', included: true },
      { text: 'Dispute mediation support', included: true },
      { text: 'Custom release conditions', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
    cta: 'Start Standard',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '299',
    currency: 'AED',
    period: 'per month',
    desc: 'For high-volume teams and enterprises with complex needs.',
    features: [
      { text: 'Everything in Standard', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Dispute mediation priority', included: true },
      { text: 'Custom release conditions', included: true },
      { text: 'API access', included: true },
      { text: 'White-label options', included: true },
      { text: 'SLA guarantee (99.9%)', included: true },
      { text: '24/7 phone support', included: true },
    ],
    cta: 'Go Pro',
    highlight: false,
  },
];

const USE_CASES = [
  { icon: Briefcase, title: 'Freelancers & Agencies', desc: 'Get paid confidently for every project. Clients release funds only when satisfied.' },
  { icon: Home, title: 'Property Deals', desc: 'Secure deposits and transfers for real estate transactions across the UAE.' },
  { icon: ShoppingBag, title: 'E-commerce & Trade', desc: 'Protect buyers and sellers in high-value online and B2B transactions.' },
  { icon: Code, title: 'Tech & SaaS', desc: 'Manage milestone-based payments for software development and consulting.' },
];

const STATS = [
  { value: 'AED 2B+', label: 'Secured in escrow', icon: Shield },
  { value: '10,000+', label: 'Active users', icon: Users },
  { value: '99.9%', label: 'Platform uptime', icon: TrendingUp },
  { value: '< 60s', label: 'To create an escrow', icon: Clock },
  { value: '3 days', label: 'Avg. dispute resolution', icon: BadgeCheck },
  { value: '0 AED', label: 'Hidden fees', icon: AlertCircle },
];

const WHY_ITEMS = [
  { icon: '🔐', title: 'No trust required upfront', desc: 'Funds are locked in escrow before any work begins — both sides are protected from day one.' },
  { icon: '⚡', title: 'Faster than bank transfers', desc: 'Skip the paperwork and 3-day clearing times. Escrow releases happen in real time.' },
  { icon: '🇦🇪', title: 'Built for the UAE', desc: 'AED-native, CBUAE-compliant, and designed for the UAE business landscape.' },
  { icon: '🛡️', title: 'Regulated & audited', desc: 'Your funds are held in fully insured, regulated accounts — not our operating funds.' },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-inter overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">TrustPay</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full">UAE</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))}
                className="text-sm text-white/60 hover:text-white transition-colors">
                {l}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/" className="text-sm text-white/70 hover:text-white px-4 py-2 transition-colors">Sign In</Link>
            <Link to="/"
              className="text-sm font-bold bg-gradient-to-r from-teal-400 to-teal-500 text-black px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/70">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0A0A0A] border-t border-white/5 px-6 py-4 space-y-3">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, '-'))}
                className="block w-full text-left text-sm text-white/60 hover:text-white py-2">
                {l}
              </button>
            ))}
            <Link to="/" className="block w-full text-center text-sm font-bold bg-gradient-to-r from-teal-400 to-teal-500 text-black px-5 py-3 rounded-full mt-2">
              Get Started Free
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-teal-500/8 blur-[140px]" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/12 blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 text-xs text-white/70">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Trusted by 10,000+ users across the UAE
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Secure Payments,{' '}
              <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
                Zero Risk.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              TrustPay holds funds in regulated escrow until both parties are satisfied.
              The smartest way to transact in the UAE — for freelancers, businesses, and property deals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/"
                className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold px-8 py-4 rounded-full text-base hover:opacity-90 transition-all hover:scale-105 shadow-[0_0_40px_rgba(45,212,191,0.3)]">
                Start for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => scrollTo('how-it-works')}
                className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
                See how it works <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
              {[
                { value: 'AED 2B+', label: 'Secured' },
                { value: '10K+', label: 'Users' },
                { value: '99.9%', label: 'Uptime' },
                { value: '< 60s', label: 'Setup time' },
                { value: '0 AED', label: 'Hidden fees' },
                { value: '3 days', label: 'Dispute resolved' },
              ].map(s => (
                <div key={s.label} className="bg-[#0A0A0A] px-6 py-5 text-center">
                  <p className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">{s.value}</p>
                  <p className="text-[11px] text-white/35 mt-1 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ── Value Proposition ── */}
      <section className="py-24 px-6 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">Why TrustPay</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">The smarter way to transact</h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">Stop relying on trust. Start relying on escrow.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_ITEMS.map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/15 transition-all">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] rounded-full bg-purple-600/8 blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Built for trust, designed for speed</h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">Everything you need to transact confidently — no middlemen, no delays, no risk.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className={`bg-gradient-to-b ${f.gradient} border border-white/[0.07] rounded-2xl p-6 hover:border-white/15 transition-all`}>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                    <Icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="py-24 px-6 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-3">Who It's For</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Every deal, every industry</h2>
            <p className="text-white/40 mt-4">TrustPay works for anyone exchanging value in the UAE.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {USE_CASES.map((uc, i) => {
              const Icon = uc.icon;
              return (
                <motion.div key={uc.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-purple-400/30 hover:bg-purple-500/5 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-purple-400/10 flex items-center justify-center mb-4 group-hover:bg-purple-400/20 transition-colors">
                    <Icon className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{uc.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{uc.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Three steps to safety</h2>
            <p className="text-white/40 mt-4">From setup to settlement in minutes, not days.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                )}
                <div className="relative z-10 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-7 hover:border-teal-400/20 transition-all">
                  <div className="text-4xl font-extrabold bg-gradient-to-br from-teal-400 to-purple-500 bg-clip-text text-transparent mb-4">{step.num}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-6 bg-white/[0.015] border-y border-white/5 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-purple-500/8 blur-[80px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Trusted across the UAE</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-white/15 transition-all">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-teal-400 text-teal-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400/30 to-purple-500/30 flex items-center justify-center text-sm font-bold text-teal-300">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-teal-500/6 blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-4">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-white/40 mt-4">All prices in AED. No setup fees. No hidden costs. Cancel anytime.</p>
          </div>

          {/* Fee note */}
          <div className="flex items-center justify-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-400/8 border border-teal-400/20 rounded-full px-5 py-2.5 text-xs text-teal-300">
              <BadgeCheck className="w-4 h-4" />
              0% platform fee on transactions — you keep everything
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.id}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 border transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-teal-500/15 to-purple-500/10 border-teal-400/30 shadow-[0_0_60px_rgba(45,212,191,0.08)]'
                    : 'bg-white/[0.03] border-white/[0.07] hover:border-white/15'
                }`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-teal-400 to-teal-500 text-black px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-2">
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <p className="text-xs text-white/40 mb-5">{plan.desc}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-xs text-white/40 pb-2">{plan.currency}</span>
                    <span className="text-5xl font-extrabold">{plan.price}</span>
                    <span className="text-white/40 text-sm pb-2">/{plan.period}</span>
                  </div>
                </div>
                <div className="border-t border-white/5 my-5" />
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f.text} className={`flex items-center gap-2.5 text-sm ${f.included ? 'text-white/70' : 'text-white/20'}`}>
                      <CheckCircle className={`w-4 h-4 shrink-0 ${f.included ? 'text-teal-400' : 'text-white/15'}`} />
                      {f.text}
                    </li>
                  ))}
                </ul>
                <Link to="/"
                  className={`block w-full text-center font-bold py-3.5 rounded-xl text-sm transition-all hover:opacity-90 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-black shadow-[0_0_30px_rgba(45,212,191,0.25)]'
                      : 'bg-white/[0.07] text-white hover:bg-white/10'
                  }`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* FAQ note */}
          <p className="text-center text-sm text-white/30 mt-10">
            Need a custom plan for your enterprise?{' '}
            <a href="mailto:support@trustpay.ae" className="text-teal-400 hover:underline">Contact us</a>
          </p>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-6 relative overflow-hidden bg-white/[0.015] border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/8 via-transparent to-purple-600/8" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Ready to transact{' '}
              <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">with confidence?</span>
            </h2>
            <p className="text-white/40 text-lg mb-10">Join thousands of UAE professionals who trust TrustPay for every deal.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 to-teal-500 text-black font-bold px-10 py-4 rounded-full text-base hover:opacity-90 transition-all hover:scale-105 shadow-[0_0_50px_rgba(45,212,191,0.3)]">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/"
                className="text-sm text-white/50 hover:text-white transition-colors">
                Already have an account? Sign in →
              </Link>
            </div>
            <p className="text-xs text-white/25 mt-6">No credit card required · Free plan available · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold">TrustPay</span>
                <span className="text-white/30 text-xs ml-2">UAE</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <a href="mailto:support@trustpay.ae" className="hover:text-white transition-colors">support@trustpay.ae</a>
            </div>
            <p className="text-xs text-white/20">© 2026 TrustPay UAE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}