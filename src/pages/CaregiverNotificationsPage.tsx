import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowLeft
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';

interface CaregiverNotificationsPageProps {
  navigate: (path: string) => void;
}

export const CaregiverNotificationsPage: React.FC<CaregiverNotificationsPageProps> = ({ navigate }) => {
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationRead, 
    markAllNotificationsRead,
    activeSenior
  } = useCareAI();
  const { t } = useLanguage();

  return (
    <div id="caregiver-notifications-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/caregiver')}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors bg-white border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {t('nav.notifications')}
                </h1>
                {unreadNotificationCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold font-mono">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('caregiver.activeAlerts')} — {activeSenior?.name || 'Lakshmi'}
              </p>
            </div>
          </div>

          {unreadNotificationCount > 0 && (
            <button
              id="mark-all-notifications-read-btn"
              onClick={markAllNotificationsRead}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4 text-teal-600" />
              <span>{t('caregiver.markResolved')}</span>
            </button>
          )}
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-xs">
              {t('caregiver.allSeniorsOnSchedule')}
            </div>
          ) : (
            notifications.map((n) => {
              const isAlert = n.type === 'ESCALATION_ALERT';
              const isFollowUp = n.type === 'FOLLOW_UP';
              const isTaken = n.type === 'TAKEN_CONFIRMED';

              return (
                <div
                  key={n.id}
                  onClick={() => !n.read && markNotificationRead(n.id)}
                  className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                    !n.read 
                      ? isAlert 
                        ? 'bg-rose-50/80' 
                        : 'bg-teal-50/40' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isAlert
                        ? 'bg-rose-100 text-rose-700'
                        : isFollowUp
                        ? 'bg-amber-100 text-amber-700'
                        : isTaken
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isAlert ? (
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      ) : isFollowUp ? (
                        <Clock className="w-5 h-5" />
                      ) : isTaken ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${isAlert ? 'text-rose-900 font-black' : 'text-slate-900'}`}>
                          {n.title}
                        </h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="text-[10px] text-slate-400 font-mono mt-2">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(n.id);
                      }}
                      className="text-[11px] font-bold text-teal-700 hover:underline shrink-0"
                    >
                      {t('caregiver.markResolved')}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
