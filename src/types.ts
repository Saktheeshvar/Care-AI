export type UserRole = 'CAREGIVER' | 'ELDERLY';

export type Language = 'en' | 'ta' | 'hi';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface ElderlyUser {
  id: string;
  userId: string;
  name: string;
  caregiverId: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  preferredLanguage: Language;
  createdAt?: string;
  updatedAt?: string;
}

export interface Caregiver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MedicationFrequency = 'Daily' | 'Twice Daily' | 'Weekly' | 'As Needed';

export interface Medicine {
  id: string;
  elderlyUserId: string;
  name: string;
  time: string; // "08:00", "14:00", "20:00"
  frequency: MedicationFrequency;
  startDate: string;
  active: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ReminderStatus = 
  | 'UPCOMING' 
  | 'DUE' 
  | 'PENDING' 
  | 'TAKEN' 
  | 'NOT_CONFIRMED' 
  | 'FOLLOW_UP' 
  | 'ESCALATED';

export interface Reminder {
  id: string;
  elderlyUserId?: string;
  medicineId: string;
  medicineName: string;
  scheduledTime: string; // "08:00"
  status: ReminderStatus;
  followUpTime?: string; // "08:15"
  escalationTime?: string; // "08:30"
  respondedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReminderHistory {
  id: string;
  elderlyUserId?: string;
  reminderId: string;
  medicineName: string;
  scheduledTime: string;
  status: ReminderStatus;
  response: 'TAKEN' | 'NOT_YET' | 'AUTO_ESCALATED';
  responseTime: string;
  date: string;
}

export type NotificationType = 
  | 'REMINDER_PENDING' 
  | 'FOLLOW_UP' 
  | 'ESCALATION_ALERT' 
  | 'TAKEN_CONFIRMED';

export interface Notification {
  id: string;
  caregiverId: string;
  elderlyUserId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  reminderId?: string;
}

export type SafetyCategory = 
  | 'SAFE_SCHEDULE_QUERY' 
  | 'DOSAGE_REQUEST' 
  | 'DIAGNOSIS_REQUEST' 
  | 'EMERGENCY_OR_SERIOUS_SYMPTOM' 
  | 'UNKNOWN';

export interface AIMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  category?: SafetyCategory;
  timestamp: string;
}

export interface AIResponse {
  message: string;
  category: SafetyCategory;
  safetyNote?: string;
  timestamp: string;
}

export type CareLoopStage = 1 | 2 | 3 | 4 | 5;

export interface AppStats {
  totalMedicines: number;
  completedToday: number;
  pendingToday: number;
  unconfirmedToday: number;
  escalatedToday: number;
  activeCaregiverAlerts: number;
}
