
import React, { useState } from 'react';
import { Info, X, ShieldCheck, BookOpen, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  tutorial: string;
  disclaimer: string;
  icon?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, tutorial, disclaimer, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-30 flex flex-col pt-8 px-6 pb-2 sticky top-0 bg-gradient-to-b from-slate-50/90 via-slate-50/50 to-transparent dark:from-slate-950/90 dark:via-slate-950/50 backdrop-blur-xl transition-colors duration-300">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h2 className="text-2xl font-light text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
            {icon && <span className="text-medical-500 drop-shadow-sm">{icon}</span>}
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase mt-1 opacity-80 pl-1">{subtitle}</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2.5 rounded-full transition-all duration-300 shadow-sm ${
            isOpen 
              ? 'bg-medical-50 text-medical-600 rotate-90 dark:bg-medical-900/30 dark:text-medical-400' 
              : 'bg-white/40 dark:bg-slate-800/40 text-slate-400 hover:text-medical-500 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-white/40 dark:border-slate-700'
          }`}
        >
          {isOpen ? <X size={18} /> : <Info size={18} />}
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'max-h-96 opacity-100 mb-4 scale-100' : 'max-h-0 opacity-0 scale-95 origin-top'}`}>
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] p-5 text-sm space-y-4 shadow-2xl shadow-slate-900/10 mt-2 border border-slate-100 dark:border-slate-700">
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-500 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-inner border border-blue-100 dark:border-blue-900/30">
              <BookOpen size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-wider mb-1">How to use</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-light text-[13px]">{tutorial}</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
             <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 shadow-inner border border-red-100 dark:border-red-900/30">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-wider mb-1">Medical Disclaimer</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-light text-[13px]">{disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RiskBadge: React.FC<{ level: 'high' | 'moderate' | 'low' }> = ({ level }) => {
  const config = {
    high: { color: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900', icon: AlertOctagon, label: 'High Risk' },
    moderate: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900', icon: AlertTriangle, label: 'Monitor' },
    low: { color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900', icon: CheckCircle, label: 'Stable' }
  };
  const c = config[level];
  const Icon = c.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.color} shadow-sm`}>
      <Icon size={12} strokeWidth={3} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{c.label}</span>
    </div>
  );
};
