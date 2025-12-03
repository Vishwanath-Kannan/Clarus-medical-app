
import React, { useState, useEffect } from 'react';
import { Pill, Stethoscope, Users, ArrowRight, Check, Clock, Calendar, ShieldAlert, Plus, MessageCircle } from 'lucide-react';
import { StorageService } from '../services/storage.ts';
import { GeminiService } from '../services/geminiService';
import { SectionHeader } from './UIComponents';
import { Medication, FamilyMember, Caregiver, SharedNote } from '../types';

type CareTab = 'meds' | 'team' | 'doctor' | 'checkups';

export const Care: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CareTab>('meds');
  const [meds, setMeds] = useState<Medication[]>([]);
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({});
  const [member, setMember] = useState<FamilyMember>(StorageService.getFamilyMembers()[0]);
  const [careTeam, setCareTeam] = useState<Caregiver[]>([]);
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  
  const [doctorSummary, setDoctorSummary] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [interactionResult, setInteractionResult] = useState<string | null>(null);
  const [checkingSafety, setCheckingSafety] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, message: string, action?: string} | null>(null);

  useEffect(() => {
    setMeds(StorageService.getMedications(member.id));
    setCareTeam(StorageService.getCareTeam());
    setSharedNotes(StorageService.getSharedNotes());
  }, [member.id]);

  const generateSummary = async () => {
    setGenerating(true);
    const history = StorageService.getChatHistory();
    const summary = await GeminiService.generateDoctorSummary(member, history, meds);
    setDoctorSummary(summary);
    setGenerating(false);
  };

  const checkInteractions = async () => {
      setCheckingSafety(true);
      const result = await GeminiService.checkInteractions(meds, member.allergies || []);
      setInteractionResult(result);
      setCheckingSafety(false);
  };

  const addSharedNote = () => {
      if(!newNote.trim()) return;
      const note: SharedNote = {
          id: Date.now().toString(),
          authorId: 'me',
          authorName: 'Me',
          text: newNote,
          date: new Date().toLocaleDateString(),
          pinned: false
      };
      const updated = StorageService.addSharedNote(note);
      setSharedNotes(updated);
      setNewNote('');
  };

  const showModal = (title: string, message: string, action?: string) => {
    setModalContent({ title, message, action });
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full relative">
      <SectionHeader title="Care Plan" subtitle="Co-Pilot & Team" tutorial="Track medications, check safety interactions, and coordinate with caregivers in the 'Team' tab." disclaimer="Medication reminders are for convenience only." icon={<Pill size={20} />} />

      {/* Tabs */}
      <div className="px-6 pb-2">
        <div className="flex bg-white/80 dark:bg-slate-800/40 p-1.5 rounded-[2rem] backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto scrollbar-hide">
           {[{id: 'meds', label: 'Meds', icon: Clock}, {id: 'team', label: 'Team', icon: Users}, {id: 'doctor', label: 'Doctor', icon: Stethoscope}, {id: 'checkups', label: 'Tests', icon: Calendar}].map(t => (
             <button key={t.id} onClick={() => setActiveTab(t.id as CareTab)} className={`flex-1 py-3 px-3 min-w-[80px] rounded-[1.5rem] flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === t.id ? 'bg-white dark:bg-slate-700 text-medical-600 dark:text-white border border-slate-200 dark:border-slate-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
               <t.icon size={16} /> <span>{t.label}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 scrollbar-hide [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]">
        
        {/* MEDS TAB */}
        {activeTab === 'meds' && (
          <div className="animate-slide-up space-y-4">
             {/* Safety Check Banner */}
             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-[2rem] border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2"><ShieldAlert size={16} /> Safety Check</h4>
                    <button onClick={checkInteractions} disabled={checkingSafety} className="text-xs bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-blue-600 font-bold border border-blue-100">{checkingSafety ? 'Checking...' : 'Check Interactions'}</button>
                </div>
                {interactionResult && <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl">{interactionResult}</p>}
             </div>

            {meds.length === 0 ? (
              <div className="text-center py-10 opacity-50"><Pill className="mx-auto mb-2 text-slate-400" size={40} /><p className="text-slate-500">No active medications.</p></div>
            ) : meds.map(med => (
              <div key={med.id} className={`bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-6 rounded-[2.5rem] transition-all ${takenMeds[med.id] ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <h4 className={`text-lg font-bold text-slate-800 dark:text-slate-200 ${takenMeds[med.id] ? 'line-through' : ''}`}>{med.name}</h4>
                     <p className="text-sm text-slate-500 font-medium">{med.strength} • <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">{med.timing}</span></p>
                   </div>
                   <button onClick={() => setTakenMeds(prev => ({ ...prev, [med.id]: !prev[med.id] }))} className={`w-10 h-10 rounded-full flex items-center justify-center border ${takenMeds[med.id] ? 'bg-green-500 text-white border-green-600' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 border-slate-200'}`}>
                     <Check size={20} />
                   </button>
                </div>
                {med.refillsRemaining !== undefined && (
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 dark:bg-orange-900/20 inline-block px-2 py-1 rounded-md border border-orange-100 dark:border-orange-900/30">
                        {med.refillsRemaining} Refills Left
                    </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TEAM TAB - CIRCLE OF CARE */}
        {activeTab === 'team' && (
          <div className="animate-slide-up space-y-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {careTeam.map(c => (
                    <div key={c.id} className="min-w-[100px] bg-white/60 dark:bg-slate-800/60 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full ${c.color} flex items-center justify-center text-white font-bold mb-2`}>{c.initials}</div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-center">{c.name}</span>
                        <span className="text-[9px] text-slate-500 uppercase">{c.role}</span>
                    </div>
                ))}
                <button className="min-w-[80px] flex flex-col items-center justify-center gap-2 opacity-50">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center"><Plus size={20} className="text-slate-400" /></div>
                    <span className="text-[10px] font-bold">INVITE</span>
                </button>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/60 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-light text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><MessageCircle size={18} /> Shared Notes</h3>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {sharedNotes.map(n => (
                        <div key={n.id} className="bg-white/50 dark:bg-slate-900/50 p-3 rounded-2xl text-sm">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-1"><span>{n.authorName}</span> <span>{n.date}</span></div>
                            <p className="text-slate-700 dark:text-slate-300">{n.text}</p>
                        </div>
                    ))}
                    {sharedNotes.length === 0 && <p className="text-center text-slate-400 text-sm italic">No shared notes yet.</p>}
                </div>
                <div className="flex gap-2">
                    <input className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm" placeholder="Add a note for the team..." value={newNote} onChange={e => setNewNote(e.target.value)} />
                    <button onClick={addSharedNote} className="bg-medical-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase">Post</button>
                </div>
            </div>
          </div>
        )}

        {/* DOCTOR TAB */}
        {activeTab === 'doctor' && (
          <div className="animate-slide-up space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/60 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-light text-slate-800 dark:text-slate-200 mb-2">Pre-Visit Summary</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">AI generated note based on your recent chats and profile.</p>
              
              {!doctorSummary ? (
                <button onClick={generateSummary} disabled={generating} className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-[1.5rem] hover:scale-[1.02] transition-transform disabled:opacity-50 border border-slate-800 dark:border-slate-600">
                  {generating ? 'Generating...' : 'Create Summary'}
                </button>
              ) : (
                <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 mb-4">{doctorSummary}</pre>
                  <button onClick={() => showModal("Copied", "Summary copied to clipboard")} className="w-full py-3 bg-medical-50 dark:bg-medical-900/20 text-medical-600 dark:text-medical-400 rounded-xl font-bold uppercase text-xs hover:bg-medical-100 border border-medical-100 dark:border-medical-900/30">Copy to Clipboard</button>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => showModal("Teleconsult", "Connecting you to our partner telehealth provider. You will be redirected shortly.", "Connect")}
              className="w-full text-left bg-white/80 dark:bg-slate-800/60 p-6 rounded-[2.5rem] flex items-center justify-between cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 group"
            >
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-medical-600 transition-colors">Book Teleconsult</h4>
                <p className="text-xs text-slate-500 mt-1">Connect with external providers</p>
              </div>
              <div className="w-10 h-10 bg-medical-50 dark:bg-medical-900/20 text-medical-500 dark:text-medical-400 rounded-full flex items-center justify-center border border-medical-100 dark:border-medical-900/30 group-hover:scale-110 transition-transform"><ArrowRight size={20} /></div>
            </button>
          </div>
        )}

        {/* CHECKUPS TAB */}
        {activeTab === 'checkups' && (
          <div className="animate-slide-up space-y-4">
             {['General Health Check', 'Diabetes Panel', 'Cardiac Risk Profile'].map((test, i) => (
               <button 
                 key={i} 
                 onClick={() => showModal("Book Test", `Requesting appointment for ${test}.`, "Confirm Request")}
                 className="w-full text-left bg-white/80 dark:bg-slate-800/60 p-6 rounded-[2.5rem] hover:scale-[1.02] transition-transform border border-slate-200 dark:border-slate-700 group"
               >
                 <div className="flex gap-4">
                   <div className="w-12 h-12 bg-medical-50 dark:bg-medical-900/20 text-medical-500 dark:text-medical-400 rounded-2xl flex items-center justify-center border border-medical-100 dark:border-medical-900/30 group-hover:bg-medical-100 transition-colors"><Calendar /></div>
                   <div>
                     <h4 className="font-bold text-slate-800 dark:text-slate-200">{test}</h4>
                     <p className="text-xs text-slate-500 mt-1">Recommended every 6 months</p>
                   </div>
                 </div>
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {modalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-white/20 dark:border-slate-700 animate-slide-up">
             <div className="mb-4">
               <h3 className="text-xl font-light text-slate-900 dark:text-white mb-2">{modalContent?.title}</h3>
               <p className="text-sm text-slate-500 leading-relaxed">{modalContent?.message}</p>
             </div>
             <div className="flex gap-3 mt-6">
                <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase hover:bg-slate-200">Cancel</button>
                {modalContent?.action && (
                  <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl bg-medical-500 text-white font-bold text-xs uppercase hover:bg-medical-600">
                    {modalContent.action}
                  </button>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
