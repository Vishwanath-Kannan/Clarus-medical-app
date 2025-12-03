
import React, { useState } from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import { AuthService } from '../services/auth';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await AuthService.login();
      onLogin(user);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-10 left-10 w-32 h-32 bg-medical-500 rounded-full blur-3xl"></div>
           <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-gradient-to-br from-medical-500 to-red-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-medical-500/30">
            <Activity size={40} />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Clarus</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-light">Your Personal Medical Intelligence Hub</p>

          <div className="space-y-4 w-full">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoading}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group disabled:opacity-70 disabled:cursor-wait"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-medical-500 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {isLoading ? 'Connecting to Google Cloud...' : 'Sign in with Google'}
              </span>
            </button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <ShieldCheck size={12} />
            <span>Secure Cloud Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
