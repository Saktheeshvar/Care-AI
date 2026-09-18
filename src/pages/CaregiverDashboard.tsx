import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Bell, 
  Plus, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Calendar,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CareLoop } from '../components/CareLoop';
import { ReminderStatus } from '../types';

interface CaregiverDashboardProps {
  navigate: (path: string) => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ navigate }) => {
  const { 
    medicines, 
    reminders, 
    notifications, 
    unreadNotificationCount, 
    stats, 
    currentCareLoopStage,
    markTaken,
    triggerEscalate,
    elderlyUsers,
    selectedElderlyId,
    setSelectedElderlyId,
    activeSenior
  } = useCareAI();
  const { t, language } = useLanguage();

  const escalatedReminders = reminders.filter(r => r.status === 'ESCALATED');
  const seniorName = activeSenior?.name || 'Lakshmi';

  return (
    <div id="caregiver-dashboard-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title & Senior Switcher Tabs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  {t('caregiver.commandCenter')}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t('caregiver.welcome')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t('caregiver.supervising').replace('{name}', seniorName)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="caregiver-add-medicine-btn"
                onClick={() => navigate('/caregiver/medicines/new')}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{t('caregiver.addMedication')}</span>
              </button>

              <button
                id="caregiver-view-senior-btn"
                onClick={() => navigate('/elderly')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 transition-colors border border-slate-300"
              >
                <Users className="w-4 h-4 text-slate-600" />
                <span>{t('caregiver.viewSeniorScreen').replace('{name}', seniorName)}</span>
              </button>

              <button
                id="caregiver-manage-seniors-btn"
                onClick={() => navigate('/caregiver/users')}
                className="px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-teal-200"
              >
                <UserCheck className="w-4 h-4 text-teal-700" />
                <span>{t('caregiver.allProfiles')}</span>
              </button>
            </div>
          </div>

          {/* Multiple Elderly Selector Tabs */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {t('caregiver.selectSenior')}
              </span>
              <div className="flex items-center gap-2">
                {elderlyUsers.map(senior => {
                  const isSelected = selectedElderlyId === senior.id;
                  const relLabel = senior.id === 'elderly_1' ? t('caregiver.mother') : t('caregiver.father');
                  return (
                    <button
                      key={senior.id}
                      onClick={() => setSelectedElderlyId(senior.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
                        isSelected 
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span>{senior.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-teal-800 text-teal-200' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {relLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              {seniorName} • {activeSenior?.relationship || 'Supervised Senior'}
            </div>
          </div>
        </div>

        {/* PROMINENT ACTIVE CAREGIVER ALERTS BANNER */}
        {escalatedReminders.length > 0 && (
          <div 
            id="caregiver-alert-active-banner"
            className="p-6 rounded-3xl bg-rose-600 text-white shadow-lg border-2 border-rose-400 animate-in fade-in"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-7 h-7 text-white animate-bounce" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-rose-200">
                    {t('caregiver.activeAlerts')}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                    {seniorName}: {escalatedReminders[0].medicineName} ({escalatedReminders[0].scheduledTime})
                  </h3>
                  <p className="text-xs text-rose-100 mt-1">
                    {seniorName} {t('caregiver.urgentAttention')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${activeSenior?.emergencyContactPhone || '+919840012345'}`}
                  className="px-5 py-2.5 rounded-xl bg-white text-rose-800 font-extrabold text-xs hover:bg-rose-50 shadow-md transition-colors whitespace-nowrap"
                >
                  {t('caregiver.callSenior').replace('{name}', seniorName)}
                </a>
                <button
                  onClick={() => markTaken(escalatedReminders[0].id)}
                  className="px-4 py-2.5 rounded-xl bg-rose-800/80 hover:bg-rose-900 text-white font-bold text-xs border border-rose-300 whitespace-nowrap"
                >
                  {t('caregiver.markResolved')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('caregiver.totalMedicines')}</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats?.totalMedicines ?? medicines.length}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">{seniorName}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('caregiver.completedToday')}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{stats?.completedToday ?? 0}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">{t('status.TAKEN')}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('caregiver.pendingFollowUp')}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-600">{stats?.pendingToday ?? 0}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">{t('status.PENDING')}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('caregiver.alerts')}</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-rose-600">{stats?.escalatedToday ?? 0}</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">{t('status.ESCALATED')}</div>
          </div>
        </div>

        {/* CARE LOOP VISUALIZATION */}
        <CareLoop currentStage={currentCareLoopStage} />

        {/* 2-COLUMN SECTION: TODAY'S REMINDERS & NOTIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Active Reminders Schedule */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {t('caregiver.todaysScheduleTitle')} ({seniorName})
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t('careloop.step').replace('{step}', String(currentCareLoopStage))}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/caregiver/medicines')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <span>{t('nav.medicines')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {reminders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    {t('caregiver.allSeniorsOnSchedule')}
                  </div>
                ) : (
                  reminders.map(reminder => (
                    <div 
                      key={reminder.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-base">
                              {reminder.scheduledTime}
                            </span>
                            <span className="font-bold text-slate-800 text-sm">
                              {reminder.medicineName}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>+15m: {reminder.followUpTime || '—'}</span>
                            <span>•</span>
                            <span>+30m: {reminder.escalationTime || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={reminder.status} t={t} />

                        {reminder.status !== 'TAKEN' && (
                          <button
                            onClick={() => markTaken(reminder.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors"
                          >
                            {t('elderly.taken')}
                          </button>
                        )}
                        {reminder.status !== 'ESCALATED' && reminder.status !== 'TAKEN' && (
                          <button
                            onClick={() => triggerEscalate(reminder.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors"
                          >
                            {t('caregiver.actionSimulateAlert')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900">{t('caregiver.recentHistoryTitle')}</h3>
                <p className="text-xs text-slate-500">{t('history.subtitle')}</p>
              </div>
              <button
                onClick={() => navigate('/caregiver/history')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <span>{t('caregiver.viewAllHistory')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Column 3: Live Notifications Stream */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-700" />
                  <h2 className="text-lg font-black text-slate-900">{t('nav.notifications')}</h2>
                </div>
                {unreadNotificationCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    {t('caregiver.allSeniorsOnSchedule')}
                  </div>
                ) : (
                  notifications.slice(0, 8).map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        notif.type === 'ESCALATION_ALERT'
                          ? 'bg-rose-50 border-rose-200 text-rose-950'
                          : notif.type === 'TAKEN_CONFIRMED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Demo Access banner */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-mono text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4" />
                <span>{t('demo.title')}</span>
              </div>
              <h4 className="font-black text-sm">{t('demo.barTitle')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('demo.subtitle')}
              </p>
              <button
                onClick={() => navigate('/demo')}
                className="w-full mt-2 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
              >
                {t('demo.fullScreen')}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

function StatusBadge({ status, t }: { status: ReminderStatus; t: (key: string) => string }) {
  switch (status) {
    case 'TAKEN':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
          {t('status.TAKEN')}
        </span>
      );
    case 'ESCALATED':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          {t('status.ESCALATED')}
        </span>
      );
    case 'FOLLOW_UP':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
          {t('status.FOLLOW_UP')}
        </span>
      );
    case 'PENDING':
    case 'DUE':
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
          {t('status.DUE')}
        </span>
      );
    case 'UPCOMING':
    default:
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 border border-slate-200">
          {t('status.UPCOMING')}
        </span>
      );
  }
}
