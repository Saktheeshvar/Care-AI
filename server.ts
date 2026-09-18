import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { dbStore, SEED_USERS, SEED_ELDERLY_USERS, SEED_ELDERLY } from './server/data/store';
import { processCareAIChat } from './server/ai/gemini';
import { Medicine, Reminder, ReminderHistory, Notification, ReminderStatus } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// Health check
// ----------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(), 
    app: 'CareAI',
    seniorsCount: dbStore.elderlyUsers.length,
    medicinesCount: dbStore.medicines.length
  });
});

// ----------------------------------------------------
// Authentication & Session API
// ----------------------------------------------------
let currentSessionUser = SEED_USERS[0]; // Default to Priya Caregiver
let activeElderlyId = 'elderly_1'; // Default active senior: Lakshmi

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, email, seniorId } = req.body;
  
  if (role === 'ELDERLY' || email?.includes('senior') || email?.includes('lakshmi') || email?.includes('raman')) {
    if (seniorId === 'elderly_2' || email?.includes('raman')) {
      currentSessionUser = SEED_USERS[2]; // Raman
      activeElderlyId = 'elderly_2';
    } else {
      currentSessionUser = SEED_USERS[1]; // Lakshmi
      activeElderlyId = 'elderly_1';
    }
  } else {
    currentSessionUser = SEED_USERS[0]; // Priya Caregiver
  }

  const seniorProfile = dbStore.getElderlyUser(activeElderlyId) || SEED_ELDERLY;

  res.json({
    user: currentSessionUser,
    elderlyProfile: seniorProfile,
    assignedElderlyUsers: dbStore.elderlyUsers,
    message: `Logged in successfully as ${currentSessionUser.name}`
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const seniorProfile = dbStore.getElderlyUser(activeElderlyId) || SEED_ELDERLY;
  res.json({
    user: currentSessionUser,
    elderlyProfile: seniorProfile,
    assignedElderlyUsers: dbStore.elderlyUsers
  });
});

// ----------------------------------------------------
// Elderly Users Directory (Multiple Senior Management)
// ----------------------------------------------------
app.get('/api/elderly-users', (req: Request, res: Response) => {
  const list = dbStore.elderlyUsers.map(senior => {
    const stats = dbStore.getStatsFor(senior.id);
    const meds = dbStore.getMedicinesFor(senior.id);
    const rems = dbStore.getRemindersFor(senior.id);
    return {
      ...senior,
      stats,
      medicinesCount: meds.length,
      todayRemindersCount: rems.length,
      completedTodayCount: rems.filter(r => r.status === 'TAKEN').length,
      pendingTodayCount: rems.filter(r => r.status === 'PENDING' || r.status === 'DUE').length
    };
  });
  res.json(list);
});

app.get('/api/elderly-users/:id', (req: Request, res: Response) => {
  const senior = dbStore.getElderlyUser(req.params.id);
  if (!senior) {
    res.status(404).json({ error: 'Elderly user not found' });
    return;
  }
  const stats = dbStore.getStatsFor(senior.id);
  res.json({ ...senior, stats });
});

// ----------------------------------------------------
// Statistics API (Multi-Senior Aware)
// ----------------------------------------------------
app.get('/api/stats', (req: Request, res: Response) => {
  const seniorId = typeof req.query.elderlyUserId === 'string' ? req.query.elderlyUserId : undefined;
  const stats = dbStore.getStatsFor(seniorId);
  res.json(stats);
});

// ----------------------------------------------------
// Role-Based Authorization Guard for Medication Schedule Changes
// Requirement 1 & 23: Elderly users CANNOT modify medicines
// ----------------------------------------------------
function requireCaregiverRole(req: Request, res: Response, next: NextFunction) {
  const roleHeader = req.headers['x-user-role'];
  if (roleHeader === 'ELDERLY' || currentSessionUser.role === 'ELDERLY') {
    res.status(403).json({
      error: 'Access Denied: Elderly users are not authorized to add, modify, or delete medication schedules.',
      code: 'FORBIDDEN_ROLE_RESTRICTION'
    });
    return;
  }
  next();
}

// ----------------------------------------------------
// Medicines Management (Caregiver CRUD, Role Protected)
// ----------------------------------------------------
app.get('/api/medicines', (req: Request, res: Response) => {
  const seniorId = typeof req.query.elderlyUserId === 'string' ? req.query.elderlyUserId : undefined;
  const list = dbStore.getMedicinesFor(seniorId);
  res.json(list);
});

app.get('/api/medicines/:id', (req: Request, res: Response) => {
  const medicine = dbStore.medicines.find(m => m.id === req.params.id);
  if (!medicine) {
    res.status(404).json({ error: 'Medication not found with specified ID' });
    return;
  }
  res.json(medicine);
});

app.post('/api/medicines', requireCaregiverRole, (req: Request, res: Response) => {
  const { name, time, frequency, startDate, notes, elderlyUserId } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Medication name is required and cannot be empty.' });
    return;
  }
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: 'Time must be in 24-hour format (e.g. 08:00).' });
    return;
  }
  if (!frequency || !['Daily', 'Twice Daily', 'Weekly', 'As Needed'].includes(frequency)) {
    res.status(400).json({ error: 'Invalid frequency. Choose Daily, Twice Daily, Weekly, or As Needed.' });
    return;
  }

  const assignedSeniorId = elderlyUserId || 'elderly_1';
  const seniorProfile = dbStore.getElderlyUser(assignedSeniorId);
  const seniorName = seniorProfile ? seniorProfile.name : 'Senior';

  const newMed: Medicine = {
    id: `med_${Date.now()}`,
    elderlyUserId: assignedSeniorId,
    name: name.trim(),
    time,
    frequency,
    startDate: startDate || new Date().toISOString().split('T')[0],
    active: true,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbStore.medicines.push(newMed);

  // Automatically generate active reminder for today
  const newReminder: Reminder = {
    id: `rem_${Date.now()}`,
    elderlyUserId: assignedSeniorId,
    medicineId: newMed.id,
    medicineName: newMed.name,
    scheduledTime: newMed.time,
    status: 'UPCOMING',
    followUpTime: computeOffsetTime(newMed.time, 15),
    escalationTime: computeOffsetTime(newMed.time, 30),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dbStore.reminders.push(newReminder);

  // Caregiver notification
  dbStore.notifications.unshift({
    id: `notif_${Date.now()}`,
    caregiverId: 'user_caregiver_1',
    elderlyUserId: assignedSeniorId,
    type: 'REMINDER_PENDING',
    title: 'New Medication Scheduled',
    message: `${newMed.name} scheduled for ${newMed.time} (${newMed.frequency}) for ${seniorName}.`,
    read: false,
    createdAt: new Date().toISOString(),
    reminderId: newReminder.id
  });

  dbStore.saveToDisk();

  res.status(201).json({
    medicine: newMed,
    reminder: newReminder,
    message: `Medication added successfully and scheduled into Care Loop for ${seniorName}.`
  });
});

app.put('/api/medicines/:id', requireCaregiverRole, (req: Request, res: Response) => {
  const index = dbStore.medicines.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Medication not found.' });
    return;
  }

  const { name, time, frequency, active, notes, elderlyUserId } = req.body;
  if (name !== undefined && name.trim().length === 0) {
    res.status(400).json({ error: 'Medication name cannot be blank.' });
    return;
  }
  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ error: 'Time must be in 24-hour format (e.g. 08:00).' });
    return;
  }

  const current = dbStore.medicines[index];
  const updated: Medicine = {
    ...current,
    name: name !== undefined ? name.trim() : current.name,
    time: time || current.time,
    frequency: frequency || current.frequency,
    active: active !== undefined ? Boolean(active) : current.active,
    notes: notes !== undefined ? notes : current.notes,
    elderlyUserId: elderlyUserId || current.elderlyUserId,
    updatedAt: new Date().toISOString()
  };

  dbStore.medicines[index] = updated;

  // Synchronize matching reminder name & time if changed
  const remIndex = dbStore.reminders.findIndex(r => r.medicineId === updated.id);
  if (remIndex !== -1) {
    dbStore.reminders[remIndex].medicineName = updated.name;
    dbStore.reminders[remIndex].scheduledTime = updated.time;
    dbStore.reminders[remIndex].elderlyUserId = updated.elderlyUserId;
    dbStore.reminders[remIndex].followUpTime = computeOffsetTime(updated.time, 15);
    dbStore.reminders[remIndex].escalationTime = computeOffsetTime(updated.time, 30);
    dbStore.reminders[remIndex].updatedAt = new Date().toISOString();
  }

  dbStore.saveToDisk();

  res.json({ medicine: updated, message: 'Medication updated successfully.' });
});

app.delete('/api/medicines/:id', requireCaregiverRole, (req: Request, res: Response) => {
  const index = dbStore.medicines.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Medication not found.' });
    return;
  }

  const removed = dbStore.medicines.splice(index, 1)[0];
  // Remove linked reminders
  dbStore.reminders = dbStore.reminders.filter(r => r.medicineId !== removed.id);

  dbStore.saveToDisk();

  res.json({ success: true, message: `Removed ${removed.name} from schedule.` });
});

// ----------------------------------------------------
// Reminders API & State Machine
// ----------------------------------------------------
app.get('/api/reminders/today', (req: Request, res: Response) => {
  const seniorId = typeof req.query.elderlyUserId === 'string' ? req.query.elderlyUserId : undefined;
  const list = dbStore.getRemindersFor(seniorId);
  const sorted = [...list].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  res.json(sorted);
});

app.get('/api/reminders/:id', (req: Request, res: Response) => {
  const rem = dbStore.reminders.find(r => r.id === req.params.id);
  if (!rem) {
    res.status(404).json({ error: 'Reminder not found.' });
    return;
  }
  res.json(rem);
});

// Action: TRIGGER REMINDER (Moves to DUE / PENDING)
app.post('/api/reminders/:id/due', (req: Request, res: Response) => {
  const rem = dbStore.reminders.find(r => r.id === req.params.id);
  if (!rem) {
    res.status(404).json({ error: 'Reminder not found.' });
    return;
  }

  const nowIso = new Date().toISOString();
  rem.status = 'DUE';
  rem.updatedAt = nowIso;
  dbStore.saveToDisk();

  res.json({
    reminder: rem,
    message: `Reminder for ${rem.medicineName} (${rem.scheduledTime}) is now DUE and awaiting confirmation.`
  });
});

// Action: TAKEN (Confirms, stops escalation, writes history)
app.post('/api/reminders/:id/taken', (req: Request, res: Response) => {
  const rem = dbStore.reminders.find(r => r.id === req.params.id);
  if (!rem) {
    res.status(404).json({ error: 'Reminder not found.' });
    return;
  }

  const seniorProfile = dbStore.getElderlyUser(rem.elderlyUserId || 'elderly_1');
  const seniorName = seniorProfile ? seniorProfile.name : 'Senior';

  const nowIso = new Date().toISOString();
  rem.status = 'TAKEN';
  rem.respondedAt = nowIso;
  rem.updatedAt = nowIso;

  // Add to History
  const historyEntry: ReminderHistory = {
    id: `hist_${Date.now()}`,
    elderlyUserId: rem.elderlyUserId,
    reminderId: rem.id,
    medicineName: rem.medicineName,
    scheduledTime: rem.scheduledTime,
    status: 'TAKEN',
    response: 'TAKEN',
    responseTime: nowIso,
    date: nowIso.split('T')[0]
  };
  dbStore.history.unshift(historyEntry);

  // Add Caregiver confirmation notification
  dbStore.notifications.unshift({
    id: `notif_${Date.now()}`,
    caregiverId: 'user_caregiver_1',
    elderlyUserId: rem.elderlyUserId,
    type: 'TAKEN_CONFIRMED',
    title: 'Medication Confirmed Taken',
    message: `${seniorName} confirmed taking ${rem.medicineName} scheduled for ${rem.scheduledTime}.`,
    read: false,
    createdAt: nowIso,
    reminderId: rem.id
  });

  dbStore.saveToDisk();

  res.json({
    reminder: rem,
    historyEntry,
    message: `${rem.medicineName} marked as TAKEN. Caregiver dashboard updated.`
  });
});

// Action: NOT YET (Keeps reminder pending, continues escalation timer)
app.post('/api/reminders/:id/not-yet', (req: Request, res: Response) => {
  const rem = dbStore.reminders.find(r => r.id === req.params.id);
  if (!rem) {
    res.status(404).json({ error: 'Reminder not found.' });
    return;
  }

  const seniorProfile = dbStore.getElderlyUser(rem.elderlyUserId || 'elderly_1');
  const seniorName = seniorProfile ? seniorProfile.name : 'Senior';

  const nowIso = new Date().toISOString();
  rem.status = 'PENDING';
  rem.respondedAt = nowIso;
  rem.updatedAt = nowIso;

  // Add to History
  const historyEntry: ReminderHistory = {
    id: `hist_${Date.now()}`,
    elderlyUserId: rem.elderlyUserId,
    reminderId: rem.id,
    medicineName: rem.medicineName,
    scheduledTime: rem.scheduledTime,
    status: 'PENDING',
    response: 'NOT_YET',
    responseTime: nowIso,
    date: nowIso.split('T')[0]
  };
  dbStore.history.unshift(historyEntry);

  // Notification for Caregiver
  dbStore.notifications.unshift({
    id: `notif_${Date.now()}`,
    caregiverId: 'user_caregiver_1',
    elderlyUserId: rem.elderlyUserId,
    type: 'REMINDER_PENDING',
    title: 'Reminder Pending — "Not Yet" Selected',
    message: `${seniorName} selected "Not Yet" for ${rem.medicineName} (${rem.scheduledTime}). Eligible for follow-up in 15 minutes.`,
    read: false,
    createdAt: nowIso,
    reminderId: rem.id
  });

  dbStore.saveToDisk();

  res.json({
    reminder: rem,
    historyEntry,
    message: `Recorded "Not Yet". Reminder is pending and queued for follow-up.`
  });
});

// Action: TRIGGER FOLLOW-UP (+15m)
app.post('/api/reminders/:id/follow-up', (req: Request, res: Response) => {
  const rem = dbStore.reminders.find(r => r.id === req.params.id);
  if (!rem) {
    res.status(404).json({ error: 'Reminder not found.' });
    return;
  }

  const seniorProfile = dbStore.getElderlyUser(rem.elderlyUserId || 'elderly_1');
  const seniorName = seniorProfile ? seniorProfile.name : 'Senior';

  const nowIso = new Date().toISOString();
  rem.status = 'FOLLOW_UP';
  rem.updatedAt = nowIso;

  dbStore.notifications.unshift({
    id: `notif_${Date.now()}`,
    caregiverId: 'user_caregiver_1',
    elderlyUserId: rem.elderlyUserId,
    type: 'FOLLOW_UP',
    title: 'Follow-Up Reminder Triggered',
    message: `Follow-up reminder sent to ${seniorName} for ${rem.medicineName} (${rem.scheduledTime}). Escalation alert in 15m if unconfirmed.`,
    read: false,
    createdAt: nowIso,
    reminderId: rem.id
  });

  dbStore.saveToDisk();

  res.json({
    reminder: rem,
    message: `Follow-up reminder triggered for ${rem.medicineName}.`
  });
});

// Action: TRIGGER CAREGIVER ALERT (ESCALATION at +30m)
app.post('/api/reminders/:id/escalate', (req: Request, res: Response) => {
  const rem = dbStore.reminders.find(r => r.id === req.params.id);
  if (!rem) {
    res.status(404).json({ error: 'Reminder not found.' });
    return;
  }

  const seniorProfile = dbStore.getElderlyUser(rem.elderlyUserId || 'elderly_1');
  const seniorName = seniorProfile ? seniorProfile.name : 'Senior';

  const nowIso = new Date().toISOString();
  rem.status = 'ESCALATED';
  rem.updatedAt = nowIso;

  // Add Escalated history record
  dbStore.history.unshift({
    id: `hist_${Date.now()}`,
    elderlyUserId: rem.elderlyUserId,
    reminderId: rem.id,
    medicineName: rem.medicineName,
    scheduledTime: rem.scheduledTime,
    status: 'ESCALATED',
    response: 'AUTO_ESCALATED',
    responseTime: nowIso,
    date: nowIso.split('T')[0]
  });

  // Critical Notification for Caregiver
  const alertNotif: Notification = {
    id: `notif_${Date.now()}`,
    caregiverId: 'user_caregiver_1',
    elderlyUserId: rem.elderlyUserId,
    type: 'ESCALATION_ALERT',
    title: '🚨 Caregiver Alert: Unconfirmed Reminder',
    message: `${seniorName} has not confirmed the ${rem.scheduledTime} reminder (${rem.medicineName}). Please check in with them.`,
    read: false,
    createdAt: nowIso,
    reminderId: rem.id
  };
  dbStore.notifications.unshift(alertNotif);

  dbStore.saveToDisk();

  res.json({
    reminder: rem,
    notification: alertNotif,
    message: `Caregiver Alert dispatched! Priya notified that ${seniorName} has not confirmed the ${rem.scheduledTime} reminder.`
  });
});

// ----------------------------------------------------
// History & Notifications (Multi-Senior Aware)
// ----------------------------------------------------
app.get('/api/history', (req: Request, res: Response) => {
  const { status, medicine, date, elderlyUserId } = req.query;
  const seniorId = typeof elderlyUserId === 'string' ? elderlyUserId : undefined;
  let list = dbStore.getHistoryFor(seniorId);

  if (status && typeof status === 'string') {
    list = list.filter(h => h.status === status);
  }
  if (medicine && typeof medicine === 'string') {
    list = list.filter(h => h.medicineName.toLowerCase().includes(medicine.toLowerCase()));
  }
  if (date && typeof date === 'string') {
    list = list.filter(h => h.date === date);
  }

  res.json(list);
});

app.get('/api/notifications', (req: Request, res: Response) => {
  const seniorId = typeof req.query.elderlyUserId === 'string' ? req.query.elderlyUserId : undefined;
  const notifs = seniorId 
    ? dbStore.notifications.filter(n => !n.elderlyUserId || n.elderlyUserId === seniorId)
    : dbStore.notifications;
  const unreadCount = notifs.filter(n => !n.read).length;
  res.json({
    notifications: notifs,
    unreadCount
  });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = dbStore.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    dbStore.saveToDisk();
  }
  res.json({ success: true, notification: notif });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  dbStore.notifications.forEach(n => { n.read = true; });
  dbStore.saveToDisk();
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ----------------------------------------------------
// AI Assistant API (with Safety Classifier & Schedule Grounding)
// ----------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { query, language, elderlyUserId } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    res.status(400).json({ error: 'Query is required and cannot be empty.' });
    return;
  }

  try {
    const result = await processCareAIChat(
      query, 
      language === 'ta' ? 'ta' : 'en',
      elderlyUserId || activeElderlyId
    );
    res.json(result);
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    res.status(500).json({
      message: 'CareAI assistant is temporarily unable to process your request. Please check your schedule directly on the dashboard.',
      category: 'UNKNOWN',
      safetyNote: 'Error handling fallback enabled.',
      timestamp: new Date().toISOString()
    });
  }
});

// ----------------------------------------------------
// Demo Presentation Simulation API
// ----------------------------------------------------
app.post('/api/demo/reset', (req: Request, res: Response) => {
  dbStore.reset();
  res.json({
    success: true,
    message: 'Demo state reset successfully. Priya Caregiver, Lakshmi (3 reminders), and Raman (4 reminders) restored to initial state.'
  });
});

// Helper: computes HH:mm + minutes offset
function computeOffsetTime(timeStr: string, addMinutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + addMinutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

// ----------------------------------------------------
// Server bootstrap & Vite middleware
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
