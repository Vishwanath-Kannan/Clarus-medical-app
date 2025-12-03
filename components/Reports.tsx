
import React, { useState, useEffect } from 'react';
import { FileText, Plus, ScanEye, Share2, Activity, List, LayoutGrid, Eye } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storage.ts';
import { SectionHeader } from './UIComponents';
import { MedicalReport, FamilyMember } from '../types';

export const Reports: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>('');
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [enhancedId, setEnhancedId] = useState<string | null>(null);

  useEffect(() => {
    const family = StorageService.getFamilyMembers();
    setMembers(family);
    if (family.length > 0) setActiveMemberId(family[0].id);
  }, []);

  useEffect(() => {
    if (activeMemberId) setReports(StorageService.getReports(activeMemberId));
  }, [activeMemberId]);

  const handleAddMember = () => {
    if (!newMemberName) return;
    const newMember = { id: Date.now().toString(), name: newMemberName, relation: 'Family', color: 'bg-indigo-500', avatarText: newMemberName.substring(0, 2).toUpperCase() };
    const updated = StorageService.addFamilyMember(newMember);
    setMembers(updated);
    setActiveMemberId(newMember.id);
    setShowAddMember(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'lab' | 'prescription' | 'scan') => {
    const file = e.target.files?.[0];
    if (!file || !activeMemberId) return;
    setAnalyzing(true);
    try {
      const data = await GeminiService.analyzeDocument(file, type);
      if (data) {
        if (type === 'prescription' && data.medications) {
           data.medications.forEach((med: any) => {
              StorageService.addMedication({
                 id: Date.now().toString() + Math.random(),
                 memberId: activeMemberId,
                 name: med.name,
                 strength: med.strength,
                 timing: med.timing,
                 active: true,
                 refillsRemaining: 3
              });
           });
        }
        StorageService.addReport({ ...data, id: Date.now().toString(), memberId: activeMemberId, type });
        setReports(StorageService.getReports(activeMemberId));
      }
    } catch (err) { alert("Analysis failed."); } 
    finally { setAnalyzing(false); }
  };

  const handleShare = (id: string) => {
      // Simulation of native share
      if (navigator.share) {
          navigator.share({ title: 'Medical Report', text: 'Sharing report from Clarus', url: window.location.href });
      } else {
          alert("Report link copied to clipboard for sharing.");
      }
  };

  return (
    <div className="flex flex-col h-full relative">
      <SectionHeader title="Digital Health Hub" subtitle="Central Repository" tutorial="Upload labs, prescriptions, and scans. Toggle Timeline view to see health history." disclaimer="AI extraction may be inaccurate. Verify all numbers." icon={<FileText size={20} />} />

      {/* Family Selector */}
      <div className="pt-2 pb-4 px-6 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-4 items-center z-20">
        {members.map(m => (
          <button key={m.id} onClick={() => setActiveMemberId(m.id)} className={`flex flex-col items-center gap-2 transition-all ${activeMemberId === m.id ? 'opacity-100 scale-105' : 'opacity-50'}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold border-2 ${activeMemberId === m.id ? 'border-medical-500' : 'border-transparent'} ${m.color}`}>{m.avatarText}</div>
            <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">{m.name}</span>
          </button>
        ))}
        <button onClick={() => setShowAddMember(true)} className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100"><div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400"><Plus /></div><span className="text-[10px] text-slate-500">ADD</span></button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-32 scrollbar-hide [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]">
        {showAddMember && (
          <div className="bg-white/60 dark:bg-slate-800/60 p-6 rounded-[2rem] mb-6 animate-slide-up border border-slate-200 dark:border-slate-700">
            <h3 className="mb-4 text-slate-800 dark:text-slate-200">New Profile</h3>
            <input className="w-full bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl mb-4 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200" placeholder="Name" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
            <button onClick={handleAddMember} className="w-full bg-slate-900 dark:bg-slate-700 text-white p-4 rounded-xl">Create</button>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-end mb-4">
            <div className="bg-white/50 dark:bg-slate-800/50 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-700">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setViewMode('timeline')} className={`p-2 rounded-lg ${viewMode === 'timeline' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400'}`}><List size={16} /></button>
            </div>
        </div>

        {/* Upload Areas */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
           <label className={`min-w-[100px] bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-[1.5rem] flex flex-col items-center justify-center h-28 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all ${analyzing ? 'opacity-50' : ''}`}>
             <Activity className="text-medical-500 mb-2" size={20} />
             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Lab Report</span>
             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'lab')} disabled={analyzing} />
           </label>
           <label className={`min-w-[100px] bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-[1.5rem] flex flex-col items-center justify-center h-28 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all ${analyzing ? 'opacity-50' : ''}`}>
             <FileText className="text-blue-500 mb-2" size={20} />
             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Prescription</span>
             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'prescription')} disabled={analyzing} />
           </label>
           <label className={`min-w-[100px] bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-[1.5rem] flex flex-col items-center justify-center h-28 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all ${analyzing ? 'opacity-50' : ''}`}>
             <ScanEye className="text-purple-500 mb-2" size={20} />
             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Scan/X-Ray</span>
             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'scan')} disabled={analyzing} />
           </label>
        </div>

        {analyzing && <div className="text-center py-4 animate-pulse text-medical-600 font-bold uppercase text-xs">AI Analyzing Document...</div>}

        <div className={`space-y-4 ${viewMode === 'timeline' ? 'pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-8' : ''}`}>
          {reports.map(r => (
            <div key={r.id} className={`relative ${viewMode === 'timeline' ? 'pl-6' : ''}`}>
              {viewMode === 'timeline' && (
                  <div className="absolute -left-[29px] top-6 w-4 h-4 rounded-full bg-medical-500 border-4 border-white dark:border-slate-950"></div>
              )}
              <div className="bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-6 rounded-[2.5rem] animate-slide-up group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase mb-2 inline-block border ${r.type === 'lab' ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-100' : r.type === 'scan' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-500 border-purple-100' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 border-blue-100'}`}>{r.type}</span>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{r.title}</h4>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                  <button onClick={() => handleShare(r.id)} className="p-2 text-slate-400 hover:text-medical-500 transition-colors"><Share2 size={16} /></button>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4 bg-white/40 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-700">{r.summary}</p>
                
                {r.type === 'scan' && (
                    <button onClick={() => setEnhancedId(enhancedId === r.id ? null : r.id)} className="w-full mb-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800">
                        <Eye size={12} /> {enhancedId === r.id ? 'View Original' : 'AI Enhance Visibility'}
                    </button>
                )}
                
                {r.insights?.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{i.label}</span>
                    <div className="text-right">
                      <span className="block font-bold text-slate-900 dark:text-white">{i.value}</span>
                      {i.status !== 'normal' && <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${i.status === 'high' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-yellow-100 text-yellow-600 border-yellow-200'}`}>{i.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
