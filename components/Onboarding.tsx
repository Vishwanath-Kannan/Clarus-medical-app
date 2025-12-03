
import React, { useState } from 'react';
import { MessageSquare, FileText, Pill, Users, ArrowRight, Check } from 'lucide-react';
import { StorageService } from '../services/storage.ts';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Clarus",
      desc: "Your intelligent medical companion. Clarus helps you manage your family's health with AI-powered safety and organization.",
      icon: <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">👋</div>,
      color: "bg-slate-900"
    },
    {
      title: "AI Symptom Checker",
      desc: "Chat with Clarus to understand symptoms. Get risk assessments and self-care advice before seeing a doctor.",
      icon: <MessageSquare size={40} className="text-white" />,
      color: "bg-medical-500"
    },
    {
      title: "Digital Records",
      desc: "Upload lab reports and prescriptions. We extract the data, check for issues, and create a searchable timeline.",
      icon: <FileText size={40} className="text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "Care & Safety",
      desc: "Track medications and automatically check for dangerous drug interactions against your allergies.",
      icon: <Pill size={40} className="text-white" />,
      color: "bg-emerald-500"
    },
    {
      title: "Circle of Care",
      desc: "Coordinate with family and caregivers. Share notes, reminders, and health updates in one place.",
      icon: <Users size={40} className="text-white" />,
      color: "bg-indigo-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      StorageService.completeOnboarding();
      onComplete();
    }
  };

  const current = steps[step];

  return (
    <div className="absolute inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col">
      <div className={`flex-1 ${current.color} transition-colors duration-500 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center text-white`}>
        <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
        
        <div className="relative z-10 mb-8 transform transition-all duration-500 scale-100 hover:scale-110">
          <div className="w-32 h-32 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
            {current.icon}
          </div>
        </div>

        <h2 className="relative z-10 text-3xl font-bold mb-4 animate-slide-up">{current.title}</h2>
        <p className="relative z-10 text-white/80 text-lg max-w-xs leading-relaxed animate-slide-up">{current.desc}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 pt-10 rounded-t-[3rem] -mt-10 relative z-20">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-slate-900 dark:bg-white' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}></div>
          ))}
        </div>

        <button 
          onClick={handleNext} 
          className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {step === steps.length - 1 ? (
             <>Get Started <Check size={20} /></>
          ) : (
             <>Next <ArrowRight size={20} /></>
          )}
        </button>
      </div>
    </div>
  );
};
