
import { ChatMessage, MedicalReport, FamilyMember, Medication, Caregiver, SharedNote, WellnessSession } from '../types';
import { AuthService } from './auth';

// We now prefix keys with the UserID to simulate cloud separation
const getKeys = () => {
  const user = AuthService.getCurrentUser();
  const uid = user ? user.id : 'guest';
  return {
    PREFIX: `clarus_${uid}_`,
    CHAT: `clarus_${uid}_chat`,
    REPORTS: `clarus_${uid}_reports`,
    FAMILY: `clarus_${uid}_family`,
    MEDICATIONS: `clarus_${uid}_medications`,
    MED_LOGS: `clarus_${uid}_med_logs`,
    CARE_TEAM: `clarus_${uid}_care_team`,
    SHARED_NOTES: `clarus_${uid}_shared_notes`,
    WELLNESS: `clarus_${uid}_wellness`,
    INIT: `clarus_${uid}_initialized`,
    ONBOARDING: `clarus_${uid}_seen_onboarding`
  };
};

const SAMPLE_DATA = {
  members: [
    {
      id: 'user_default',
      name: 'Me',
      relation: 'Self',
      color: 'bg-slate-800',
      avatarText: 'ME',
      medicalHistory: ['Mild Asthma'],
      allergies: ['Penicillin']
    }
  ],
  chat: [
    {
      id: 'msg_1',
      role: 'user',
      text: 'I have been having a throbbing headache on the right side since morning.',
      timestamp: Date.now() - 10000000
    },
    {
      id: 'msg_2',
      role: 'model',
      text: "**Summary**: You are experiencing a one-sided throbbing headache.\n\n**Possible Reasons**:\n*   Migraine\n*   Tension headache\n*   Dehydration\n\n**Self-care**:\n*   Rest in a dark, quiet room.\n*   Drink water.\n*   Apply a cool compress.\n\n**When to see a doctor**:\n*   If pain becomes severe or is accompanied by vision changes.",
      isRisk: 'moderate',
      timestamp: Date.now() - 9999000
    }
  ]
};

const StorageService = {
  // Initialization
  initializeIfEmpty: () => {
    const KEYS = getKeys();
    if (!localStorage.getItem(KEYS.INIT)) {
      localStorage.setItem(KEYS.FAMILY, JSON.stringify(SAMPLE_DATA.members));
      localStorage.setItem(KEYS.CHAT, JSON.stringify(SAMPLE_DATA.chat));
      localStorage.setItem(KEYS.REPORTS, JSON.stringify([]));
      localStorage.setItem(KEYS.MEDICATIONS, JSON.stringify([]));
      localStorage.setItem(KEYS.CARE_TEAM, JSON.stringify([]));
      localStorage.setItem(KEYS.SHARED_NOTES, JSON.stringify([]));
      localStorage.setItem(KEYS.INIT, 'true');
    }
  },

  hasSeenOnboarding: (): boolean => {
    const KEYS = getKeys();
    return localStorage.getItem(KEYS.ONBOARDING) === 'true';
  },

  completeOnboarding: () => {
    const KEYS = getKeys();
    localStorage.setItem(KEYS.ONBOARDING, 'true');
  },

  // --- FAMILY ---
  getFamilyMembers: (): FamilyMember[] => {
    StorageService.initializeIfEmpty();
    const data = localStorage.getItem(getKeys().FAMILY);
    return data ? JSON.parse(data) : SAMPLE_DATA.members;
  },

  saveFamilyMembers: (members: FamilyMember[]) => {
    localStorage.setItem(getKeys().FAMILY, JSON.stringify(members));
  },

  addFamilyMember: (member: FamilyMember) => {
    const current = StorageService.getFamilyMembers();
    const updated = [...current, member];
    StorageService.saveFamilyMembers(updated);
    return updated;
  },

  updateFamilyMember: (memberId: string, updates: Partial<FamilyMember>) => {
    const current = StorageService.getFamilyMembers();
    const updated = current.map(m => m.id === memberId ? { ...m, ...updates } : m);
    StorageService.saveFamilyMembers(updated);
    return updated;
  },

  // --- MEDICATIONS ---
  getMedications: (memberId?: string): Medication[] => {
    StorageService.initializeIfEmpty();
    const data = localStorage.getItem(getKeys().MEDICATIONS);
    const meds: Medication[] = data ? JSON.parse(data) : [];
    if (memberId) return meds.filter(m => m.memberId === memberId);
    return meds;
  },

  addMedication: (med: Medication) => {
    const meds = StorageService.getMedications();
    const updated = [...meds, med];
    localStorage.setItem(getKeys().MEDICATIONS, JSON.stringify(updated));
    return updated;
  },

  // --- CHAT ---
  getChatHistory: (): ChatMessage[] => {
    StorageService.initializeIfEmpty();
    const data = localStorage.getItem(getKeys().CHAT);
    return data ? JSON.parse(data) : [];
  },

  saveChatHistory: (history: ChatMessage[]) => {
    localStorage.setItem(getKeys().CHAT, JSON.stringify(history));
  },

  // --- REPORTS ---
  getReports: (memberId?: string): MedicalReport[] => {
    StorageService.initializeIfEmpty();
    const data = localStorage.getItem(getKeys().REPORTS);
    let reports: MedicalReport[] = data ? JSON.parse(data) : [];
    if (memberId) return reports.filter(r => r.memberId === memberId);
    return reports;
  },

  addReport: (report: MedicalReport) => {
    const allReports = StorageService.getReports(); 
    const updated = [report, ...allReports];
    localStorage.setItem(getKeys().REPORTS, JSON.stringify(updated));
    return updated;
  },

  // --- CARE TEAM & NOTES ---
  getCareTeam: (): Caregiver[] => {
    StorageService.initializeIfEmpty();
    const data = localStorage.getItem(getKeys().CARE_TEAM);
    return data ? JSON.parse(data) : [];
  },
  
  addCaregiver: (caregiver: Caregiver) => {
    const team = StorageService.getCareTeam();
    const updated = [...team, caregiver];
    localStorage.setItem(getKeys().CARE_TEAM, JSON.stringify(updated));
    return updated;
  },

  getSharedNotes: (): SharedNote[] => {
    StorageService.initializeIfEmpty();
    const data = localStorage.getItem(getKeys().SHARED_NOTES);
    return data ? JSON.parse(data) : [];
  },

  addSharedNote: (note: SharedNote) => {
    const notes = StorageService.getSharedNotes();
    const updated = [note, ...notes];
    localStorage.setItem(getKeys().SHARED_NOTES, JSON.stringify(updated));
    return updated;
  },

  // --- WELLNESS ---
  getWellnessLogs: (): WellnessSession[] => {
    const data = localStorage.getItem(getKeys().WELLNESS);
    return data ? JSON.parse(data) : [];
  },

  addWellnessLog: (log: WellnessSession) => {
    const logs = StorageService.getWellnessLogs();
    const updated = [log, ...logs];
    localStorage.setItem(getKeys().WELLNESS, JSON.stringify(updated));
    return updated;
  },

  getCalmPoints: (): number => {
    const logs = StorageService.getWellnessLogs();
    return logs.reduce((acc, log) => acc + log.points, 0);
  },

  // --- RESET ---
  clearAll: () => {
    const user = AuthService.getCurrentUser();
    if (!user) return; // Should not happen if logged in
    
    const prefix = `clarus_${user.id}_`;
    
    // Iterate all local storage keys and remove those belonging to the user
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });

    // Optional: Also clear the auth key if you want to force re-login on reset
    // localStorage.removeItem('clarus_auth_user');
    
    // Reload to re-initialize
    setTimeout(() => window.location.reload(), 100);
  }
};

export { StorageService };
