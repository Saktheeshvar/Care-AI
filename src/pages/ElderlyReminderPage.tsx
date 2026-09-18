import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  ShieldAlert
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ElderlyReminderPageProps {
  reminderId: string;
  navigate: (path: string) => void;
}

export const ElderlyReminderPage: React.FC<ElderlyReminderPageProps> = ({ reminderId, navigate }) => {
  const { reminders, markTaken, markNotYet, openEmergency, feedbackMessage } = useCareAI();
  const { t } = useLanguage();

  const reminder = reminders.find(r => r.id === reminderId) || reminders[0];

  if (!reminder) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reminder Not Found</h2>
          <button 
            onClick={() => navigate('/elderly')}
            className="mt-4 px-6 py-3 rounded-xl bg-teal-700 text-white font-bold text-base"
          >
            {t('nav.dashboard')}
          </button>
        </div>
      </div>
    );
  }

  const isTaken = reminder.status === 'TAKEN';

  return (
    <div id="elderly-reminder-page-root" className="min-h-[90vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/elderly')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-base py-2 px-4 rounded-xl bg-white border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('nav.dashboard')}</span>
        </button>

        {feedbackMessage && (
          <div className="p-4 rounded-2xl bg-teal-800 text-white font-bold text-base text-center shadow-md animate-in fade-in">
            {feedbackMessage}
          </div>
        )}

        {/* Focused Hero Reminder Display */}
        <div className="bg-white rounded-3xl border-4 border-teal-600 p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-900 font-black text-sm uppercase tracking-wider">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>{t('elderly.nextReminder')}</span>
          </div>

          <div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight">
              {reminder.medicineName}
            </h1>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-800 font-mono mt-3">
              {reminder.scheduledTime}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold max-w-md mx-auto">
            {t('elderly.dailyScheduleVerified')}
          </div>

          {/* Action Buttons */}
          {isTaken ? (
            <div className="p-8 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 space-y-2">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <div className="text-3xl font-black">{t('elderly.confirmedTakenTitle')}</div>
              <p className="text-sm font-bold text-emerald-800">
                {t('elderly.confirmedTakenSub')}
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate('/elderly')}
                  className="px-8 py-3 rounded-xl bg-emerald-700 text-white font-bold text-base hover:bg-emerald-800"
                >
                  {t('nav.dashboard')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <button
                id="reminder-screen-taken-btn"
                onClick={() => markTaken(reminder.id)}
                className="w-full py-7 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-3xl tracking-wide flex items-center justify-center gap-4 shadow-xl shadow-emerald-700/30 transition-transform hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-10 h-10" />
                <span>{t('elderly.taken')}</span>
              </button>

              <button
                id="reminder-screen-not-yet-btn"
                onClick={() => markNotYet(reminder.id)}
                className="w-full py-6 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-2xl tracking-wide flex items-center justify-center gap-4 shadow-lg shadow-amber-600/30 transition-transform hover:scale-[1.02]"
              >
                <Clock className="w-8 h-8" />
                <span>{t('elderly.notYet')}</span>
              </button>
            </div>
          )}

          {/* Emergency trigger if senior feels unwell */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4">
            <button
              onClick={openEmergency}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-rose-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('elderly.emergencyContact')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
