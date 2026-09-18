import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Medicine, Reminder, ReminderHistory, Notification, AppStats, CareLoopStage, ElderlyUser } from '../types';
import { api } from '../services/api';

interface CareAIContextType {
  medicines: Medicine[];
  reminders: Reminder[];
  history: ReminderHistory[];
  notifications: Notification[];
  unreadNotificationCount: number;
  stats: AppStats | null;
  currentCareLoopStage: CareLoopStage;
  isLoading: boolean;
  elderlyUsers: ElderlyUser[];
  selectedElderlyId: string;
  setSelectedElderlyId: (id: string) => void;
  activeSenior: ElderlyUser | undefined;
  refreshAll: () => Promise<void>;
  triggerDue: (reminderId?: string) => Promise<void>;
  markTaken: (reminderId: string) => Promise<void>;
  markNotYet: (reminderId: string) => Promise<void>;
  triggerFollowUp: (reminderId?: string) => Promise<void>;
  triggerEscalate: (reminderId?: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  isEmergencyOpen: boolean;
  openEmergency: () => void;
  closeEmergency: () => void;
  feedbackMessage: string | null;
  clearFeedback: () => void;
  speakText: (text: string, lang?: 'en' | 'ta') => void;
}

const CareAIContext = createContext<CareAIContextType | undefined>(undefined);

export const CareAIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [elderlyUsers, setElderlyUsers] = useState<ElderlyUser[]>([]);
  const [selectedElderlyId, setSelectedElderlyIdState] = useState<string>('elderly_1');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [history, setHistory] = useState<ReminderHistory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const setSelectedElderlyId = (id: string) => {
    setSelectedElderlyIdState(id);
    try {
      localStorage.setItem('careai_selected_senior', id);
    } catch {
      // ignore
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(prev => (prev === msg ? null : prev));
    }, 4500);
  };

  // Text to Speech helper for spoken reminders
  const speakText = (text: string, lang: Language = 'en') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Clear, comfortable speaking rate for elderly
      utterance.pitch = 1.0;
      if (lang === 'ta') {
        utterance.lang = 'ta-IN';
      } else if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const refreshAll = useCallback(async () => {
    try {
      const [seniorsRes, medsRes, remsRes, histRes, notifsRes, statsRes] = await Promise.all([
        api.getElderlyUsers(),
        api.getMedicines(selectedElderlyId),
        api.getTodayReminders(selectedElderlyId),
        api.getHistory({ elderlyUserId: selectedElderlyId }),
        api.getNotifications(selectedElderlyId),
        api.getStats(selectedElderlyId)
      ]);
      setElderlyUsers(seniorsRes);
      setMedicines(medsRes);
      setReminders(remsRes);
      setHistory(histRes);
      setNotifications(notifsRes.notifications);
      setUnreadNotificationCount(notifsRes.unreadCount);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to refresh CareAI data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedElderlyId]);

  useEffect(() => {
    // Restore preferred selected senior from storage if present
    try {
      const saved = localStorage.getItem('careai_selected_senior');
      if (saved && (saved === 'elderly_1' || saved === 'elderly_2')) {
        setSelectedElderlyIdState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const activeSenior = elderlyUsers.find(u => u.id === selectedElderlyId) || elderlyUsers[0];

  // Compute Care Loop Stage dynamically from current reminders
  let currentCareLoopStage: CareLoopStage = 1;
  const hasEscalated = reminders.some(r => r.status === 'ESCALATED');
  const hasFollowUp = reminders.some(r => r.status === 'FOLLOW_UP');
  const hasResponse = reminders.some(r => r.status === 'PENDING' || r.status === 'TAKEN');
  const hasDue = reminders.some(r => r.status === 'DUE');

  if (hasEscalated) {
    currentCareLoopStage = 5; // Caregiver Alert
  } else if (hasFollowUp) {
    currentCareLoopStage = 4; // Follow-up (+15m)
  } else if (hasResponse) {
    currentCareLoopStage = 3; // Elderly Response / Pending
  } else if (hasDue) {
    currentCareLoopStage = 2; // Reminder Sent & Due
  } else {
    currentCareLoopStage = 1; // Medication Scheduled
  }

  const triggerDue = async (reminderId?: string) => {
    try {
      const targetId = reminderId || reminders.find(r => r.status === 'UPCOMING')?.id || reminders[0]?.id || 'rem_1';
      const res = await api.triggerDue(targetId);
      showFeedback(res.message);
      await refreshAll();
    } catch (err: any) {
      showFeedback(err.message || 'Error triggering reminder');
    }
  };

  const markTaken = async (reminderId: string) => {
    try {
      const res = await api.markTaken(reminderId);
      showFeedback(res.message);
      await refreshAll();
    } catch (err: any) {
      showFeedback(err.message || 'Error updating reminder');
    }
  };

  const markNotYet = async (reminderId: string) => {
    try {
      const res = await api.markNotYet(reminderId);
      showFeedback(res.message);
      await refreshAll();
    } catch (err: any) {
      showFeedback(err.message || 'Error updating reminder');
    }
  };

  const triggerFollowUp = async (reminderId?: string) => {
    try {
      const targetId = reminderId || reminders.find(r => r.medicineName.includes('Morning'))?.id || reminders[0]?.id || 'rem_1';
      const res = await api.triggerFollowUp(targetId);
      showFeedback(res.message);
      await refreshAll();
    } catch (err: any) {
      showFeedback(err.message || 'Error triggering follow-up');
    }
  };

  const triggerEscalate = async (reminderId?: string) => {
    try {
      const targetId = reminderId || reminders.find(r => r.medicineName.includes('Morning'))?.id || reminders[0]?.id || 'rem_1';
      const res = await api.triggerEscalate(targetId);
      showFeedback(res.message);
      await refreshAll();
    } catch (err: any) {
      showFeedback(err.message || 'Error triggering escalation');
    }
  };

  const resetDemo = async () => {
    try {
      const res = await api.resetDemo();
      showFeedback(res.message);
      await refreshAll();
    } catch (err: any) {
      showFeedback(err.message || 'Error resetting demo');
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CareAIContext.Provider
      value={{
        medicines,
        reminders,
        history,
        notifications,
        unreadNotificationCount,
        stats,
        currentCareLoopStage,
        isLoading,
        elderlyUsers,
        selectedElderlyId,
        setSelectedElderlyId,
        activeSenior,
        refreshAll,
        triggerDue,
        markTaken,
        markNotYet,
        triggerFollowUp,
        triggerEscalate,
        resetDemo,
        markNotificationRead,
        markAllNotificationsRead,
        isEmergencyOpen,
        openEmergency: () => setIsEmergencyOpen(true),
        closeEmergency: () => setIsEmergencyOpen(false),
        feedbackMessage,
        clearFeedback: () => setFeedbackMessage(null),
        speakText
      }}
    >
      {children}
    </CareAIContext.Provider>
  );
};

export function useCareAI() {
  const context = useContext(CareAIContext);
  if (!context) throw new Error('useCareAI must be used within a CareAIProvider');
  return context;
}
