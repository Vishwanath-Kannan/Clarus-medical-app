
import React, { useState, useEffect } from 'react';
import { Wind, Anchor, Heart, Volume2, Star } from 'lucide-react';
import { SectionHeader } from './UIComponents';
import { StorageService } from '../services/storage.ts';
import { GeminiService } from '../services/geminiService';

export const Wellness: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'menu' | 'breathe' | 'ground' | 'gratitude'>('menu');
  const [points, setPoints] = useState(0);
  
  useEffect(() => {
    setPoints(StorageService.getCalmPoints());
  }, []);

  const addPoints = (amount: number, type: any) => {
    StorageService.addWellnessLog({
      id: Date.now().toString(),
      type,
      timestamp: Date.now(),
      points: amount
    });
    setPoints(prev => prev + amount);
  };

  return (
    <div className="flex flex-col h-full relative">
      <SectionHeader title="Wellness Corner" subtitle="De-stress & Center" tutorial="Engage in micro-activities to earn Calm Points and reduce stress." disclaimer="Not a substitute for mental health therapy." icon={<Wind size={20} />} />
      
      <div className="absolute top-6 right-6 z-40 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2">
         <Star size={14} className="text-yellow-400 fill-yellow-400" />
         <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{points} Calm Pts</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 scrollbar-hide">
        {activeMode === 'menu' && (
          <div className="grid gap-4 animate-slide-up">
            <button onClick={() => setActiveMode('breathe')} className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:scale-[1.02] transition-transform">
               <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400"><Wind size={32} /></div>
               <div className="text-left">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Breathing Bubble</h3>
                 <p className="text-sm text-slate-500">1-minute calming rhythm</p>
               </div>
            </button>
            <button onClick={() => setActiveMode('ground')} className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:scale-[1.02] transition-transform">
               <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500 dark:text-emerald-400"><Anchor size={32} /></div>
               <div className="text-left">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Grounding 5-4-3-2-1</h3>
                 <p className="text-sm text-slate-500">Anxiety relief technique</p>
               </div>
            </button>
            <button onClick={() => setActiveMode('gratitude')} className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:scale-[1.02] transition-transform">
               <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-500 dark:text-pink-400"><Heart size={32} /></div>
               <div className="text-left">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Gratitude Journal</h3>
                 <p className="text-sm text-slate-500">Log one good thing</p>
               </div>
            </button>
             <button onClick={() => GeminiService.speak("Close your eyes. Imagine a gentle stream flowing through a quiet forest. The water is cool and clear.", "calm")} className="bg-slate-900 dark:bg-slate-700 p-6 rounded-[2.5rem] border border-slate-800 dark:border-slate-600 flex items-center gap-4 hover:opacity-90 transition-opacity">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white"><Volume2 size={32} /></div>
               <div className="text-left">
                 <h3 className="font-bold text-lg text-white">Quick Calm Audio</h3>
                 <p className="text-sm text-slate-400">Play soothing AI voice</p>
               </div>
            </button>
          </div>
        )}

        {activeMode === 'breathe' && <BreathingBubble onComplete={() => { addPoints(10, 'breathing'); setActiveMode('menu'); }} />}
        {activeMode === 'ground' && <GroundingExercise onComplete={() => { addPoints(20, 'grounding'); setActiveMode('menu'); }} />}
        {activeMode === 'gratitude' && <GratitudeLogger onComplete={() => { addPoints(15, 'gratitude'); setActiveMode('menu'); }} />}
        
        {activeMode !== 'menu' && (
           <button onClick={() => setActiveMode('menu')} className="mt-8 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider w-full text-center">Exit Activity</button>
        )}
      </div>
    </div>
  );
};

const BreathingBubble = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState('Inhale');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
       setTimeLeft(t => {
         if (t <= 1) { clearInterval(timer); onComplete(); return 0; }
         return t - 1;
       });
    }, 1000);

    const breathCycle = setInterval(() => {
      setPhase(p => p === 'Inhale' ? 'Exhale' : 'Inhale');
    }, 4000);

    return () => { clearInterval(timer); clearInterval(breathCycle); };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className={`w-64 h-64 rounded-full bg-blue-400/20 backdrop-blur-xl flex items-center justify-center transition-all duration-[4000ms] ${phase === 'Inhale' ? 'scale-110' : 'scale-75'}`}>
         <div className={`w-48 h-48 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold transition-all duration-[4000ms] shadow-2xl shadow-blue-500/50 ${phase === 'Inhale' ? 'scale-100' : 'scale-75'}`}>
           {phase}
         </div>
      </div>
      <p className="mt-8 text-slate-500 font-bold uppercase tracking-widest">{timeLeft}s remaining</p>
    </div>
  );
};

const GroundingExercise = ({ onComplete }: { onComplete: () => void }) => {
  const steps = [
    "Identify 5 things you can SEE",
    "Identify 4 things you can TOUCH",
    "Identify 3 things you can HEAR",
    "Identify 2 things you can SMELL",
    "Identify 1 thing you can TASTE"
  ];
  const [step, setStep] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <h3 className="text-2xl font-light text-slate-800 dark:text-slate-200">{steps[step]}</h3>
      <p className="text-sm text-slate-500">Take your time. Look around.</p>
      <button onClick={() => { if(step < 4) setStep(s => s+1); else onComplete(); }} className="mt-8 px-8 py-4 bg-emerald-500 text-white rounded-[1.5rem] font-bold uppercase shadow-lg shadow-emerald-500/30">
        {step < 4 ? 'Next' : 'Finish'}
      </button>
    </div>
  );
};

const GratitudeLogger = ({ onComplete }: { onComplete: () => void }) => {
  const [text, setText] = useState('');
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
      <h3 className="text-xl font-light text-slate-800 dark:text-slate-200 text-center">What is one small thing that went well today?</h3>
      <textarea 
        value={text} onChange={e => setText(e.target.value)}
        className="w-full h-32 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 focus:outline-none resize-none"
        placeholder="I enjoyed my morning coffee..."
      />
      <button onClick={onComplete} disabled={!text.trim()} className="w-full py-4 bg-pink-500 text-white rounded-[1.5rem] font-bold uppercase shadow-lg shadow-pink-500/30 disabled:opacity-50">Save & Earn Points</button>
    </div>
  );
};
