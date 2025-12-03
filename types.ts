
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isRisk?: 'high' | 'moderate' | 'low';
  timestamp: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // 'Me', 'Parent', 'Child', 'Partner', 'Other'
  color: string; // Tailwind color class for avatar background
  avatarText: string;
  medicalHistory?: string[];
  allergies?: string[];
}

export interface Medication {
  id: string;
  memberId: string;
  name: string;
  strength?: string;
  timing: string; // e.g., "1-0-1", "Morning", "Night"
  instructions?: string; // "After food"
  startDate?: string;
  endDate?: string;
  active: boolean;
  refillsRemaining?: number;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  date: string; // YYYY-MM-DD
  status: 'taken' | 'skipped' | 'pending';
  timestamp: number;
}

export interface MedicalReport {
  id: string;
  memberId: string;
  type: 'lab' | 'prescription' | 'scan' | 'other';
  title: string;
  date: string;
  summary: string;
  insights: {
    label: string;
    value: string;
    status: 'normal' | 'high' | 'low';
    explanation: string;
  }[];
  imageUrl?: string; // For scans
}

export interface Caregiver {
  id: string;
  name: string;
  role: string; // 'Primary', 'Nurse'
  initials: string;
  color: string;
}

export interface SharedNote {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  date: string;
  pinned: boolean;
}

export interface WellnessSession {
  id: string;
  type: 'breathing' | 'gratitude' | 'grounding';
  timestamp: number;
  points: number;
  note?: string;
}

export type ViewState = 'home' | 'ask-ai' | 'reports' | 'care' | 'profile' | 'wellness';
