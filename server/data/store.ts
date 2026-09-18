import fs from 'fs';
import path from 'path';
import { 
  User, 
  ElderlyUser, 
  Caregiver, 
  Medicine, 
  Reminder, 
  ReminderHistory, 
  Notification,
  AppStats 
} from '../../src/types';

const DB_FILE_PATH = path.join(process.cwd(), 'server', 'data', 'care_db.json');

// Deterministic seed records for Priya Caregiver, Lakshmi (Mother), and Raman (Father)
export const SEED_USERS: User[] = [
  {
    id: 'user_caregiver_1',
    name: 'Priya Caregiver',
    email: 'priya@careai.family',
    role: 'CAREGIVER',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_elderly_1',
    name: 'Lakshmi',
    email: 'lakshmi@careai.senior',
    role: 'ELDERLY',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_elderly_2',
    name: 'Raman',
    email: 'raman@careai.senior',
    role: 'ELDERLY',
    createdAt: new Date().toISOString()
  }
];

export const SEED_ELDERLY_USERS: ElderlyUser[] = [
  {
    id: 'elderly_1',
    userId: 'user_elderly_1',
    name: 'Lakshmi',
    caregiverId: 'user_caregiver_1',
    emergencyContactName: 'Dr. Rajesh Kumar',
    emergencyContactPhone: '+91 98400 12345',
    emergencyContactRelation: 'Family Physician & Primary Caregiver',
    preferredLanguage: 'en',
    createdAt: new Date().toISOString()
  },
  {
    id: 'elderly_2',
    userId: 'user_elderly_2',
    name: 'Raman',
    caregiverId: 'user_caregiver_1',
    emergencyContactName: 'Dr. Ananya Swaminathan',
    emergencyContactPhone: '+91 98401 54321',
    emergencyContactRelation: 'Cardiologist & Primary Caregiver',
    preferredLanguage: 'ta',
    createdAt: new Date().toISOString()
  }
];

export const SEED_ELDERLY: ElderlyUser = SEED_ELDERLY_USERS[0];

export const SEED_CAREGIVER: Caregiver = {
  id: 'caregiver_1',
  userId: 'user_caregiver_1',
  name: 'Priya Caregiver',
  phone: '+91 98765 43210',
  createdAt: new Date().toISOString()
};

export function getInitialMedicines(): Medicine[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    // Lakshmi's 3 medicines
    {
      id: 'med_1',
      elderlyUserId: 'elderly_1',
      name: 'Morning Medicine',
      time: '08:00',
      frequency: 'Daily',
      startDate: today,
      active: true,
      notes: 'Scheduled with breakfast (Metformin 500mg)'
    },
    {
      id: 'med_2',
      elderlyUserId: 'elderly_1',
      name: 'Afternoon Medicine',
      time: '14:00',
      frequency: 'Daily',
      active: true,
      startDate: today,
      notes: 'Scheduled with lunch (Calcium + D3)'
    },
    {
      id: 'med_3',
      elderlyUserId: 'elderly_1',
      name: 'Evening Medicine',
      time: '20:00',
      frequency: 'Daily',
      active: true,
      startDate: today,
      notes: 'Scheduled after dinner (Atorvastatin 10mg)'
    },
    // Raman's 4 medicines
    {
      id: 'med_raman_1',
      elderlyUserId: 'elderly_2',
      name: 'Morning BP Medicine',
      time: '07:30',
      frequency: 'Daily',
      active: true,
      startDate: today,
      notes: 'Take before breakfast with water (Telmisartan 40mg)'
    },
    {
      id: 'med_raman_2',
      elderlyUserId: 'elderly_2',
      name: 'Noon Multivitamin',
      time: '12:30',
      frequency: 'Daily',
      active: true,
      startDate: today,
      notes: 'Take with lunch'
    },
    {
      id: 'med_raman_3',
      elderlyUserId: 'elderly_2',
      name: 'Evening Heart Pill',
      time: '18:30',
      frequency: 'Daily',
      active: true,
      startDate: today,
      notes: 'Take after evening snack (Aspirin 75mg)'
    },
    {
      id: 'med_raman_4',
      elderlyUserId: 'elderly_2',
      name: 'Bedtime Sleep Aid',
      time: '21:30',
      frequency: 'Daily',
      active: true,
      startDate: today,
      notes: 'Take 30 minutes before sleep'
    }
  ];
}

export function getInitialReminders(): Reminder[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    // Lakshmi: 3 reminders (1 DUE/PENDING, 2 TAKEN) -> 2 completed, 1 pending
    {
      id: 'rem_1',
      elderlyUserId: 'elderly_1',
      medicineId: 'med_1',
      medicineName: 'Morning Medicine',
      scheduledTime: '08:00',
      status: 'DUE', // Ready for Hackathon escalation test
      followUpTime: '08:15',
      escalationTime: '08:30',
      createdAt: `${today}T08:00:00.000Z`,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rem_2',
      elderlyUserId: 'elderly_1',
      medicineId: 'med_2',
      medicineName: 'Afternoon Medicine',
      scheduledTime: '14:00',
      status: 'TAKEN',
      followUpTime: '14:15',
      escalationTime: '14:30',
      respondedAt: `${today}T14:05:00.000Z`,
      createdAt: `${today}T14:00:00.000Z`,
      updatedAt: `${today}T14:05:00.000Z`
    },
    {
      id: 'rem_3',
      elderlyUserId: 'elderly_1',
      medicineId: 'med_3',
      medicineName: 'Evening Medicine',
      scheduledTime: '20:00',
      status: 'TAKEN',
      followUpTime: '20:15',
      escalationTime: '20:30',
      respondedAt: `${today}T20:02:00.000Z`,
      createdAt: `${today}T20:00:00.000Z`,
      updatedAt: `${today}T20:02:00.000Z`
    },
    // Raman: 4 reminders (4 completed)
    {
      id: 'rem_raman_1',
      elderlyUserId: 'elderly_2',
      medicineId: 'med_raman_1',
      medicineName: 'Morning BP Medicine',
      scheduledTime: '07:30',
      status: 'TAKEN',
      followUpTime: '07:45',
      escalationTime: '08:00',
      respondedAt: `${today}T07:32:00.000Z`,
      createdAt: `${today}T07:30:00.000Z`,
      updatedAt: `${today}T07:32:00.000Z`
    },
    {
      id: 'rem_raman_2',
      elderlyUserId: 'elderly_2',
      medicineId: 'med_raman_2',
      medicineName: 'Noon Multivitamin',
      scheduledTime: '12:30',
      status: 'TAKEN',
      followUpTime: '12:45',
      escalationTime: '13:00',
      respondedAt: `${today}T12:35:00.000Z`,
      createdAt: `${today}T12:30:00.000Z`,
      updatedAt: `${today}T12:35:00.000Z`
    },
    {
      id: 'rem_raman_3',
      elderlyUserId: 'elderly_2',
      medicineId: 'med_raman_3',
      medicineName: 'Evening Heart Pill',
      scheduledTime: '18:30',
      status: 'TAKEN',
      followUpTime: '18:45',
      escalationTime: '19:00',
      respondedAt: `${today}T18:33:00.000Z`,
      createdAt: `${today}T18:30:00.000Z`,
      updatedAt: `${today}T18:33:00.000Z`
    },
    {
      id: 'rem_raman_4',
      elderlyUserId: 'elderly_2',
      medicineId: 'med_raman_4',
      medicineName: 'Bedtime Sleep Aid',
      scheduledTime: '21:30',
      status: 'TAKEN',
      followUpTime: '21:45',
      escalationTime: '22:00',
      respondedAt: `${today}T21:31:00.000Z`,
      createdAt: `${today}T21:30:00.000Z`,
      updatedAt: `${today}T21:31:00.000Z`
    }
  ];
}

export function getInitialHistory(): ReminderHistory[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yDateStr = yesterday.toISOString().split('T')[0];

  return [
    // Today's records for Lakshmi
    {
      id: 'hist_lakshmi_today_2',
      elderlyUserId: 'elderly_1',
      reminderId: 'rem_2',
      medicineName: 'Afternoon Medicine',
      scheduledTime: '14:00',
      status: 'TAKEN',
      response: 'TAKEN',
      responseTime: `${today}T14:05:00.000Z`,
      date: today
    },
    {
      id: 'hist_lakshmi_today_3',
      elderlyUserId: 'elderly_1',
      reminderId: 'rem_3',
      medicineName: 'Evening Medicine',
      scheduledTime: '20:00',
      status: 'TAKEN',
      response: 'TAKEN',
      responseTime: `${today}T20:02:00.000Z`,
      date: today
    },
    // Yesterday's records for Lakshmi
    {
      id: 'hist_lakshmi_1',
      elderlyUserId: 'elderly_1',
      reminderId: 'rem_hist_1',
      medicineName: 'Morning Medicine',
      scheduledTime: '08:00',
      status: 'TAKEN',
      response: 'TAKEN',
      responseTime: `${yDateStr}T08:05:00.000Z`,
      date: yDateStr
    },
    // Raman's today records
    {
      id: 'hist_raman_1',
      elderlyUserId: 'elderly_2',
      reminderId: 'rem_raman_1',
      medicineName: 'Morning BP Medicine',
      scheduledTime: '07:30',
      status: 'TAKEN',
      response: 'TAKEN',
      responseTime: `${today}T07:32:00.000Z`,
      date: today
    },
    {
      id: 'hist_raman_2',
      elderlyUserId: 'elderly_2',
      reminderId: 'rem_raman_2',
      medicineName: 'Noon Multivitamin',
      scheduledTime: '12:30',
      status: 'TAKEN',
      response: 'TAKEN',
      responseTime: `${today}T12:35:00.000Z`,
      date: today
    },
    {
      id: 'hist_raman_3',
      elderlyUserId: 'elderly_2',
      reminderId: 'rem_raman_3',
      medicineName: 'Evening Heart Pill',
      scheduledTime: '18:30',
      status: 'TAKEN',
      response: 'TAKEN',
      responseTime: `${today}T18:33:00.000Z`,
      date: today
    },
    {
      id: 'hist_raman_4',
      elderlyUserId: 'elderly_2',
      reminderId: 'rem_raman_4',
      medicineName: 'Bedtime Sleep Aid',
      scheduledTime: '21:30',
      status: 'TAKEN',
      response: 'TAKEN',
      responseTime: `${today}T21:31:00.000Z`,
      date: today
    }
  ];
}

export function getInitialNotifications(): Notification[] {
  return [
    {
      id: 'notif_init_1',
      caregiverId: 'user_caregiver_1',
      elderlyUserId: 'elderly_1',
      type: 'REMINDER_PENDING',
      title: 'Morning Reminder Scheduled',
      message: 'Lakshmi has an 08:00 AM Morning Medicine reminder active today.',
      read: true,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'notif_init_2',
      caregiverId: 'user_caregiver_1',
      elderlyUserId: 'elderly_2',
      type: 'TAKEN_CONFIRMED',
      title: 'Raman: All Reminders Completed',
      message: 'Raman has confirmed all 4 scheduled medications on time today.',
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];
}

export interface StoreState {
  users: User[];
  elderlyUsers: ElderlyUser[];
  caregiver: Caregiver;
  medicines: Medicine[];
  reminders: Reminder[];
  history: ReminderHistory[];
  notifications: Notification[];
}

// Persistent Database Store with file backing & atomic write
class CareStore implements StoreState {
  users: User[] = [...SEED_USERS];
  elderlyUsers: ElderlyUser[] = [...SEED_ELDERLY_USERS];
  caregiver: Caregiver = { ...SEED_CAREGIVER };
  medicines: Medicine[] = getInitialMedicines();
  reminders: Reminder[] = getInitialReminders();
  history: ReminderHistory[] = getInitialHistory();
  notifications: Notification[] = getInitialNotifications();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<StoreState>;
        if (parsed.medicines && parsed.reminders) {
          this.users = parsed.users || [...SEED_USERS];
          this.elderlyUsers = parsed.elderlyUsers || [...SEED_ELDERLY_USERS];
          this.caregiver = parsed.caregiver || { ...SEED_CAREGIVER };
          this.medicines = parsed.medicines;
          this.reminders = parsed.reminders;
          this.history = parsed.history || [];
          this.notifications = parsed.notifications || [];
          return;
        }
      }
    } catch (err) {
      console.warn('Could not load care_db.json, using default seed:', err);
    }
    this.saveToDisk();
  }

  saveToDisk() {
    try {
      const data: StoreState = {
        users: this.users,
        elderlyUsers: this.elderlyUsers,
        caregiver: this.caregiver,
        medicines: this.medicines,
        reminders: this.reminders,
        history: this.history,
        notifications: this.notifications
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist care_db.json:', err);
    }
  }

  reset() {
    this.users = [...SEED_USERS];
    this.elderlyUsers = [...SEED_ELDERLY_USERS];
    this.caregiver = { ...SEED_CAREGIVER };
    this.medicines = getInitialMedicines();
    this.reminders = getInitialReminders();
    this.history = getInitialHistory();
    this.notifications = getInitialNotifications();
    this.saveToDisk();
  }

  getElderlyUser(id: string): ElderlyUser | undefined {
    return this.elderlyUsers.find(e => e.id === id || e.userId === id);
  }

  getMedicinesFor(elderlyUserId?: string): Medicine[] {
    if (!elderlyUserId) return this.medicines;
    return this.medicines.filter(m => m.elderlyUserId === elderlyUserId);
  }

  getRemindersFor(elderlyUserId?: string): Reminder[] {
    if (!elderlyUserId) return this.reminders;
    return this.reminders.filter(r => r.elderlyUserId === elderlyUserId);
  }

  getHistoryFor(elderlyUserId?: string): ReminderHistory[] {
    if (!elderlyUserId) return this.history;
    return this.history.filter(h => h.elderlyUserId === elderlyUserId);
  }

  getStatsFor(elderlyUserId?: string): AppStats {
    const meds = this.getMedicinesFor(elderlyUserId).filter(m => m.active);
    const rems = this.getRemindersFor(elderlyUserId);
    const completedToday = rems.filter(r => r.status === 'TAKEN').length;
    const pendingToday = rems.filter(r => r.status === 'PENDING' || r.status === 'DUE').length;
    const unconfirmedToday = rems.filter(r => r.status === 'NOT_CONFIRMED' || r.status === 'FOLLOW_UP').length;
    const escalatedToday = rems.filter(r => r.status === 'ESCALATED').length;
    const activeAlerts = this.notifications.filter(n => {
      if (n.read || n.type !== 'ESCALATION_ALERT') return false;
      return !elderlyUserId || n.elderlyUserId === elderlyUserId;
    }).length;

    return {
      totalMedicines: meds.length,
      completedToday,
      pendingToday,
      unconfirmedToday,
      escalatedToday,
      activeCaregiverAlerts: activeAlerts
    };
  }
}

export const dbStore = new CareStore();
