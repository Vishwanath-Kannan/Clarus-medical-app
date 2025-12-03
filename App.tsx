
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { AskAI } from './components/AskAI';
import { Reports } from './components/Reports';
import { Care } from './components/Care';
import { Profile } from './components/Profile';
import { Wellness } from './components/Wellness';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { ViewState, User } from './types';
import { AuthService } from './services/auth';
import { StorageService } from './services/storage.ts';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      if (!StorageService.hasSeenOnboarding()) {
        setShowOnboarding(true);
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (!StorageService.hasSeenOnboarding()) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (checkingAuth) return null;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout currentView={view} onChangeView={setView}>
        {view === 'home' && <Home changeView={setView} />}
        {view === 'ask-ai' && <AskAI />}
        {view === 'reports' && <Reports />}
        {view === 'care' && <Care />}
        {view === 'wellness' && <Wellness />}
        {view === 'profile' && <Profile />}
      </Layout>
      
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
    </>
  );
}
