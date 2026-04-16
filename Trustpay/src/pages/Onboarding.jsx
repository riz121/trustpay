import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
  {
    icon: Shield,
    accent: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Secure Escrow\nPayments',
    subtitle: 'Hold funds safely until both parties are satisfied. Trusted by thousands across the UAE.',
    gradient: 'from-primary/20 via-transparent to-transparent',
  },
  {
    icon: Zap,
    accent: 'text-accent',
    bg: 'bg-accent/10',
    title: 'Fast &\nTransparent',
    subtitle: 'Real-time status updates for every transaction. Both parties stay informed at every step.',
    gradient: 'from-accent/20 via-transparent to-transparent',
  },
  {
    icon: CheckCircle2,
    accent: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    title: 'Release When\nYou\'re Ready',
    subtitle: 'Funds only release when both parties confirm. Dispute resolution included, no extra charge.',
    gradient: 'from-emerald-400/20 via-transparent to-transparent',
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const isLast = step === slides.length - 1;
  const slide = slides[step];
  const Icon = slide.icon;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-radial ${slide.gradient} transition-all duration-700`} />
      <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 -right-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Skip */}
      <div className="relative z-10 flex justify-end px-6 pt-14">
        {!isLast && (
          <button
            onClick={onComplete}
            className="text-xs text-muted-foreground font-medium px-3 py-1.5 glass rounded-full"
          >
            Skip
          </button>
        )}
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className={`w-24 h-24 rounded-3xl ${slide.bg} flex items-center justify-center mb-10 shadow-2xl`}
            >
              <Icon className={`w-12 h-12 ${slide.accent}`} strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl font-extrabold tracking-tight whitespace-pre-line leading-tight mb-4">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 px-6 pb-12 space-y-6">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 24 : 8, opacity: i === step ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              className="h-1.5 rounded-full bg-primary"
            />
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          {isLast ? 'Get Started' : 'Next'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}