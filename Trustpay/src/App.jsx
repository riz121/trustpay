import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AppLayout from './components/escrow/AppLayout';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import TransactionDetail from './pages/TransactionDetail';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import SelectPlan from './pages/SelectPlan';
import FAQ from './pages/FAQ';
import Payments from './pages/Payments';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Landing from './pages/Landing';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user, checkAppState } = useAuth();
  const [onboardingDone, setOnboardingDone] = React.useState(
    () => localStorage.getItem('escrow_onboarding_done') === 'true'
  );

  const handleOnboardingComplete = () => {
    localStorage.setItem('escrow_onboarding_done', 'true');
    setOnboardingDone(true);
  };

  // Re-fetch user after plan selection so the plan check refreshes
  const handlePlanSelected = () => {
    checkAppState();
  };

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Show onboarding for new users
  if (!onboardingDone) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Show plan selection if user hasn't chosen a plan yet
  if (user && !user.plan) {
    return <SelectPlan onComplete={handlePlanSelected} />;
  }

  // Handle authentication errors — show landing instead of redirect
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'link_error') {
      return <Login initialError={authError.message} initialMode="register" />;
    } else if (authError.type === 'auth_required') {
      return <Login />;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewTransaction />} />
        <Route path="/transaction/:id" element={<TransactionDetail />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/payments" element={<Payments />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App