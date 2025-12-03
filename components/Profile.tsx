
import React, { useState, useEffect } from 'react';
import { User, Shield, Trash2, Bell, ChevronRight, PlusCircle, Save, LogOut } from 'lucide-react';
import { StorageService } from '../services/storage.ts';
import { AuthService } from '../services/auth';
import { SectionHeader } from './UIComponents';
import { FamilyMember } from '../types';

export const Profile: React.FC = () => {
  const [member, setMember] = useState<FamilyMember>(StorageService.getFamilyMembers()[0]);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(member.name);
  const [relation, setRelation] = useState(member.relation);
  const [history, setHistory] = useState(member.medicalHistory?.join(', ') || '');
  const [allergies, setAllergies] = useState(member.allergies?.join(', ') || '');
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());

  // Dark Mode Toggle Logic - Default to Light
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
    // Sync local inputs with member if member changes externally
    setName(member.name);
    setRelation(member.relation);
    setHistory(member.medicalHistory?.join(', ') || '');
    setAllergies(member.allergies?.join(', ') || '');
  }, [member]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleSave = () => {
    const updates = {
      name: name,
      relation: relation,
      medicalHistory: history.split(',').map(s => s.trim()).filter(Boolean),
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean)
    };
    StorageService.updateFamilyMember(member.id, updates);
    setMember({ ...member, ...updates });
    setEditMode(false);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to delete ALL data and reset the app? This cannot be undone.")) {
      StorageService.clearAll();
    }
  };

  const handleLogout = () => {
    if (window.confirm("Sign out of your account?")) {
      AuthService.logout();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <SectionHeader title="Profile" subtitle="Settings & Data" tutorial="Manage personal health context here. This data is used by AI to provide safer, personalized insights." disclaimer="Stored securely in your cloud account." icon={<User size={20} />} />

      <div className="p-8 pb-32 overflow-y-auto scrollbar-hide [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]">
        
        {/* Account Card */}
        <div className="flex items-center gap-6 mb-8 bg-white/80 dark:bg-slate-800/60 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
           <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {currentUser?.avatar || 'JD'}
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentUser?.name || 'User'}</h3>
             <p className="text-xs text-slate-500">{currentUser?.email}</p>
             <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-500 font-bold uppercase">
               <Shield size={10} /> Cloud Synced
             </div>
           </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-between items-center mb-8 px-4 py-2">
           <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Dark Mode</span>
           <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'}`}>
             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'}`}></div>
           </button>
        </div>

        {/* Medical Context */}
        <div className="mb-8">
           <div className="flex justify-between items-center mb-4 pl-2">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medical Context</h3>
             <button onClick={() => editMode ? handleSave() : setEditMode(true)} className="text-medical-600 dark:text-medical-400 font-bold text-xs uppercase px-3 py-1 rounded-full bg-medical-50 dark:bg-medical-900/20 hover:bg-medical-100 transition-colors border border-medical-100 dark:border-medical-900/30">
               {editMode ? 'Save Changes' : 'Edit Profile'}
             </button>
           </div>
           
           <div className="bg-white/80 dark:bg-slate-800/60 p-6 rounded-[2.5rem] space-y-4 border border-slate-200 dark:border-slate-700">
             <div>
               <label className="text-xs text-slate-400 font-bold block mb-1 uppercase">Conditions</label>
               {editMode ? (
                 <input className="w-full bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700" value={history} onChange={e => setHistory(e.target.value)} placeholder="e.g. Asthma, Diabetes" />
               ) : (
                 <p className="text-slate-700 dark:text-slate-300">{member.medicalHistory?.length ? member.medicalHistory.join(', ') : 'None listed'}</p>
               )}
             </div>
             <div className="h-px bg-slate-200 dark:bg-slate-700"></div>
             <div>
               <label className="text-xs text-slate-400 font-bold block mb-1 uppercase">Allergies</label>
               {editMode ? (
                 <input className="w-full bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Peanuts" />
               ) : (
                 <p className="text-slate-700 dark:text-slate-300">{member.allergies?.length ? member.allergies.join(', ') : 'None listed'}</p>
               )}
             </div>
           </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button onClick={handleLogout} className="w-full p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-sm">
             <LogOut size={18} /> Sign Out
          </button>

          <button onClick={handleReset} className="w-full p-6 bg-red-50/80 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-[2.5rem] flex items-center justify-center gap-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-100 dark:border-red-900/30">
            <Trash2 size={20} /> <span className="text-sm font-bold uppercase tracking-wider">Reset App Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
