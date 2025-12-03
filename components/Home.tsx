
import React, { useEffect, useState } from 'react';
import { Heart, Activity, FileText, Pill, ArrowRight, Wind } from 'lucide-react';
import { ViewState } from '../types';
import { GeminiService } from '../services/geminiService';
import { SectionHeader } from './UIComponents';

interface HomeProps {
  changeView: (view: ViewState) => void;
}

export const Home: React.FC<HomeProps> = ({ changeView }) => {
  const [greeting, setGreeting] = useState("Hello");
  const [dailyTip, setDailyTip] = useState<string>("Loading daily insight...");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening");
    GeminiService.getFastInsight("Calm, medical safety, general wellbeing").then(setDailyTip);
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      <SectionHeader 
        title={`${greeting},`}
        subtitle="I am here to help you."
        tutorial="This is your daily dashboard. Tap 'Check Symptoms' to chat, 'Upload' for reports, or view your 'Care' plan."
        disclaimer="Clarus is not a doctor. Content is for informational purposes only. In emergencies, call 911 immediately."
      />

      <div className="p-8 pt-2 flex-1 overflow-y-auto pb-32 relative z-10 scrollbar-hide [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]">
        
        {/* Central Heartbeat */}
        <div className="flex flex-col items-center justify-center mt-12 mb-10 relative group">
           <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-64 h-64 bg-medical-400 rounded-full animate-pulse-slow blur-[80px] opacity-10 dark:opacity-20 group-hover:opacity-20 transition-opacity duration-1000"></div>
           </div>
           <div className="relative z-10 p-1 transform scale-110">
             <Heart className="w-24 h-24 text-medical-500 animate-pulse-slow" strokeWidth={0} fill="currentColor" />
           </div>
           <p className="mt-8 text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase text-center opacity-60">
             Not a medical diagnosis
           </p>
        </div>

        {/* Daily Snapshot */}
        <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2.5rem] mb-6 border border-slate-200 dark:border-slate-700 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 rounded-full bg-medical-500 animate-pulse"></div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Snapshot</h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-light text-lg leading-relaxed mb-4">
            {dailyTip}
          </p>
          <div className="flex gap-2">
            <button onClick={() => changeView('wellness')} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors flex items-center gap-2 border border-blue-100 dark:border-blue-900/30">
              <Wind size={12} /> Wellness Corner
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => changeView('ask-ai')} className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 transition-all group text-left relative overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-red-600 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
            <span className="text-slate-800 dark:text-slate-200 font-medium block">Add Symptoms</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Start Chat</span>
          </button>

          <button onClick={() => changeView('reports')} className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-[2rem] hover:bg-white dark:hover:bg-slate-800 transition-all group text-left border border-slate-200 dark:border-slate-700">
            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-50 dark:border-slate-600 mb-3 group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <span className="text-slate-800 dark:text-slate-200 font-medium block">Upload Report</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Analyze</span>
          </button>

          <button onClick={() => changeView('care')} className="col-span-2 bg-slate-900 dark:bg-slate-800 p-6 rounded-[2rem] hover:opacity-95 transition-all group text-left flex items-center justify-between border border-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                <Pill size={24} />
              </div>
              <div>
                <span className="text-white font-medium block text-lg">My Care Plan</span>
                <span className="text-slate-400 text-xs font-medium">Co-Pilot • Safety • Team</span>
              </div>
            </div>
            <ArrowRight className="text-white/50 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
