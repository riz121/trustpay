import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Plus, label: 'New', path: '/new' },
  { icon: Clock, label: 'History', path: '/transactions' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      navigate(path, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass-strong border-t border-white/5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={(e) => handleNavClick(e, path)}
                className="relative flex flex-col items-center gap-1 px-4 py-1.5"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 w-8 h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className={`text-[10px] transition-colors ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}