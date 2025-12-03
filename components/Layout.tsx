
import React from 'react';
import { Home, MessageSquare, FileText, Pill, User, Leaf } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  const navItems: { id: ViewState; icon: any; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'ask-ai', icon: MessageSquare, label: 'Chat' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'care', icon: Pill, label: 'Care' },
    { id: 'wellness', icon: Leaf, label: 'Wellness' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-sans overflow-hidden relative transition-colors duration-300">
      
      {/* Background Blobs - Optimized opacity for Light Mode */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-red-200 dark:bg-red-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* App Container - Classic Look: Crisp Border, High Clarity */}
      <div className="w-full h-full max-w-md relative z-10 overflow-hidden sm:rounded-[3rem] sm:h-[92vh] sm:border-[8px] sm:border-slate-200/80 dark:sm:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-3xl transition-all duration-300">
        <main className="h-full w-full overflow-hidden relative">{children}</main>
        
        {/* Navigation - Flat with Border */}
        <div className="absolute bottom-6 left-4 right-4 z-50">
          <div className="bg-white/95 dark:bg-slate-900/95 p-2 rounded-[2.5rem] flex justify-between items-center px-4 border border-slate-200 dark:border-slate-700 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button key={item.id} onClick={() => onChangeView(item.id)} className={`relative p-3 rounded-[1.5rem] transition-all duration-300 ${isActive ? 'text-medical-600 dark:text-medical-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  {isActive && <span className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] opacity-100 scale-100 transition-transform duration-300 border border-slate-200 dark:border-slate-700"></span>}
                  <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}><Icon size={22} strokeWidth={isActive ? 2.5 : 2} /></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
