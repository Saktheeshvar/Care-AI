import { Medicine, Reminder, ReminderHistory, Notification, AIResponse, AppStats, User, ElderlyUser } from '../types';

function getCurrentRole(): string {
  try {
    return localStorage.getItem('careai_role') || 'CAREGIVER';
  } catch {
    return 'CAREGIVER';
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const currentRole = getCurrentRole();
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': currentRole,
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (role: 'CAREGIVER' | 'ELDERLY', email?: string, seniorId?: string) => 
    request<{ user: User; elderlyProfile: ElderlyUser; assignedElderlyUsers: ElderlyUser[]; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, email, seniorId })
    }),
  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  getMe: () => request<{ user: User; elderlyProfile: ElderlyUser; assignedElderlyUsers: ElderlyUser[] }>('/api/auth/me'),

  // Elderly Users Directory (Multi-Senior Management)
  getElderlyUsers: () => request<Array<ElderlyUser & { 
    stats: AppStats; 
    medicinesCount: number; 
    todayRemindersCount: number; 
    completedTodayCount: number; 
    pendingTodayCount: number; 
  }>>('/api/elderly-users'),
  getElderlyUser: (id: string) => request<ElderlyUser & { stats: AppStats }>(`/api/elderly-users/${id}`),

  // Stats
  getStats: (elderlyUserId?: string) => {
    const qs = elderlyUserId ? `?elderlyUserId=${encodeURIComponent(elderlyUserId)}` : '';
    return request<AppStats>(`/api/stats${qs}`);
  },

  // Medicines
  getMedicines: (elderlyUserId?: string) => {
    const qs = elderlyUserId ? `?elderlyUserId=${encodeURIComponent(elderlyUserId)}` : '';
    return request<Medicine[]>(`/api/medicines${qs}`);
  },
  getMedicine: (id: string) => request<Medicine>(`/api/medicines/${id}`),
  createMedicine: (data: Partial<Medicine>) => 
    request<{ medicine: Medicine; reminder: Reminder; message: string }>('/api/medicines', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateMedicine: (id: string, data: Partial<Medicine>) => 
    request<{ medicine: Medicine; message: string }>(`/api/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteMedicine: (id: string) => 
    request<{ success: boolean; message: string }>(`/api/medicines/${id}`, {
      method: 'DELETE'
    }),

  // Reminders & State Machine
  getTodayReminders: (elderlyUserId?: string) => {
    const qs = elderlyUserId ? `?elderlyUserId=${encodeURIComponent(elderlyUserId)}` : '';
    return request<Reminder[]>(`/api/reminders/today${qs}`);
  },
  getReminder: (id: string) => request<Reminder>(`/api/reminders/${id}`),
  triggerDue: (id: string) => 
    request<{ reminder: Reminder; message: string }>(`/api/reminders/${id}/due`, {
      method: 'POST'
    }),
  markTaken: (id: string) => 
    request<{ reminder: Reminder; historyEntry: ReminderHistory; message: string }>(`/api/reminders/${id}/taken`, {
      method: 'POST'
    }),
  markNotYet: (id: string) => 
    request<{ reminder: Reminder; historyEntry: ReminderHistory; message: string }>(`/api/reminders/${id}/not-yet`, {
      method: 'POST'
    }),
  triggerFollowUp: (id: string) => 
    request<{ reminder: Reminder; message: string }>(`/api/reminders/${id}/follow-up`, {
      method: 'POST'
    }),
  triggerEscalate: (id: string) => 
    request<{ reminder: Reminder; notification: Notification; message: string }>(`/api/reminders/${id}/escalate`, {
      method: 'POST'
    }),

  // History
  getHistory: (params?: { status?: string; medicine?: string; date?: string; elderlyUserId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.medicine) searchParams.set('medicine', params.medicine);
    if (params?.date) searchParams.set('date', params.date);
    if (params?.elderlyUserId) searchParams.set('elderlyUserId', params.elderlyUserId);
    const qs = searchParams.toString();
    return request<ReminderHistory[]>(`/api/history${qs ? `?${qs}` : ''}`);
  },

  // Notifications
  getNotifications: (elderlyUserId?: string) => {
    const qs = elderlyUserId ? `?elderlyUserId=${encodeURIComponent(elderlyUserId)}` : '';
    return request<{ notifications: Notification[]; unreadCount: number }>(`/api/notifications${qs}`);
  },
  markNotificationRead: (id: string) => 
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => 
    request<{ success: boolean }>('/api/notifications/mark-all-read', { method: 'POST' }),

  // AI Chat
  sendAIChat: (query: string, language: 'en' | 'ta', elderlyUserId?: string) => 
    request<AIResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query, language, elderlyUserId })
    }),

  // Demo Reset
  resetDemo: () => request<{ success: boolean; message: string }>('/api/demo/reset', { method: 'POST' })
};
