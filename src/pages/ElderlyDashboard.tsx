import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ShieldAlert, 
  Mic, 
  AlertTriangle, 
  Calendar, 
  Volume2
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ReminderStatus } from '../types';

interface ElderlyDashboardProps {
  navigate: (path: string) => void;
}

export const ElderlyDashboard: React.FC<ElderlyDashboardProps> = ({ navigate }) => {
  const { 
    reminders, 
    markTaken, 
    markNotYet, 
    openEmergency, 
    feedbackMessage,
    activeSenior,
    speakText
  } = useCareAI();
  const { t, language } = useLanguage();

  const seniorName = activeSenior?.name || 'Lakshmi';

  // Find next reminder needing action (DUE, PENDING, FOLLOW_UP, ESCALATED, or next UPCOMING)
  const dueOrPending = reminders.find(r => ['DUE', 'PENDING', 'FOLLOW_UP', 'ESCALATED'].includes(r.status));
  const nextUpcoming = reminders.find(r => r.status === 'UPCOMING');
  const highlightedReminder = dueOrPending || nextUpcoming || reminders[0];

  const handleSpeakReminder = () => {
    if (!highlightedReminder) return;
    if (language === 'ta') {
      const msg = `வணக்கம் ${seniorName}. இப்போது ${highlightedReminder.scheduledTime} மணிக்கு நீங்கள் ${highlightedReminder.medicineName} மருந்தை எடுத்துக்கொள்ள வேண்டும்.`;
      speakText(msg, 'ta');
    } else if (language === 'hi') {
      const msg = `नमस्ते ${seniorName}. अब ${highlightedReminder.scheduledTime} बजे आपकी ${highlightedReminder.medicineName} दवा का समय है। कृपया इसे पानी के साथ लें।`;
      speakText(msg, 'hi');
    } else {
      const msg = `Hello ${seniorName}. It is time for your ${highlightedReminder.scheduledTime} medication, ${highlightedReminder.medicineName}. Please take it with water.`;
      speakText(msg, 'en');
    }
  };

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case 'TAKEN':
        return {
          label: t('status.TAKEN'),
          classes: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: CheckCircle2
        };
      case 'DUE':
        return {
          label: t('status.DUE'),
          classes: 'bg-teal-100 text-teal-900 border-teal-400 animate-pulse',
          icon: Bell
        };
      case 'PENDING':
        return {
          label: t('status.PENDING'),
          classes: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Clock
        };
      case 'FOLLOW_UP':
        return {
          label: t('status.FOLLOW_UP'),
          classes: 'bg-amber-200 text-amber-950 border-amber-400 font-extrabold',
          icon: Clock
        };
      case 'ESCALATED':
        return {
          label: t('status.ESCALATED'),
          classes: 'bg-rose-100 text-rose-900 border-rose-400 font-extrabold',
          icon: AlertTriangle
        };
      default:
        return {
          label: t('status.UPCOMING'),
          classes: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Calendar
        };
    }
  };

  return (
    <div id="elderly-dashboard-root" className="min-h-screen bg-slate-50 pb-24 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className="p-4 rounded-2xl bg-teal-800 text-white font-bold text-base shadow-lg flex items-center justify-between animate-in slide-in-from-top-4">
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Header Greeting with High-Contrast Typography */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  {t('elderly.headerTitle')}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Profile: <strong className="text-slate-900">{seniorName}</strong>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight">
                {t('elderly.greeting').replace('{name}', seniorName)}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mt-1 font-semibold">
                {t('elderly.caregiverNotified')}
              </p>
            </div>

            {/* Quick Voice Assistant Button */}
            <button
              id="elderly-header-voice-btn"
              onClick={() => navigate('/elderly/assistant')}
              className="px-6 py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] transition-transform"
            >
              <Mic className="w-6 h-6 text-teal-200 animate-pulse" />
              <span>{t('elderly.talkToCareAI')}</span>
            </button>
          </div>
        </div>

        {/* 1. FEATURED NEXT REMINDER CARD */}
        {highlightedReminder && (
          <div 
            id="featured-next-reminder-card"
            className="bg-white rounded-3xl border-3 border-teal-600 p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-900 border border-teal-300">
                {t('elderly.nextReminder')}
              </span>
              <div className="flex items-center gap-2">
                {/* Audio Spoken Reminder Button */}
                <button
                  onClick={handleSpeakReminder}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors"
                  title="Speak reminder out loud"
                >
                  <Volume2 className="w-4 h-4 text-teal-700" />
                  <span>{t('elderly.readOutLoud')}</span>
                </button>

                {(() => {
                  const badge = getStatusBadge(highlightedReminder.status);
                  const Icon = badge.icon;
                  return (
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${badge.classes}`}>
                      <Icon className="w-4 h-4" />
                      <span>{badge.label}</span>
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="my-4">
              <div className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                {highlightedReminder.medicineName}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-800 font-mono mt-2">
                Scheduled: {highlightedReminder.scheduledTime}
              </div>
            </div>

            {/* LARGE ACCESSIBLE ACTION BUTTONS */}
            {highlightedReminder.status === 'TAKEN' ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-center gap-4 text-emerald-900">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xl font-extrabold">{t('elderly.confirmedTakenTitle')}</div>
                  <div className="text-sm font-semibold text-emerald-800">
                    {t('elderly.confirmedTakenSub')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button
                  id="elderly-btn-taken"
                  onClick={() => markTaken(highlightedReminder.id)}
                  className="py-6 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-2xl tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-emerald-700/20 transition-all hover:scale-[1.02]"
                >
                  <CheckCircle2 className="w-8 h-8" />
                  <span>{t('elderly.taken')}</span>
                </button>

                <button
                  id="elderly-btn-not-yet"
                  onClick={() => markNotYet(highlightedReminder.id)}
                  className="py-6 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-2xl tracking-wide flex items-center justify-center gap-3 shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02]"
                >
                  <Clock className="w-8 h-8" />
                  <span>{t('elderly.notYet')}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. TODAY'S REMINDERS LIST */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">
              {t('elderly.todaysReminders')}
            </h2>
            <span className="text-sm font-bold text-slate-500">
              {t('elderly.scheduledDoses').replace('{count}', String(reminders.length))}
            </span>
          </div>

          <div className="space-y-4">
            {reminders.map(rem => {
              const badge = getStatusBadge(rem.status);
              const Icon = badge.icon;
              const isConfirmed = rem.status === 'TAKEN';

              return (
                <div
                  key={rem.id}
                  id={`reminder-row-${rem.id}`}
                  className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    rem.id === highlightedReminder?.id
                      ? 'border-teal-400 bg-teal-50/40'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-teal-800 font-mono font-black text-lg">
                      {rem.scheduledTime}
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-900">
                        {rem.medicineName}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 mt-0.5">
                        {t('elderly.dailyScheduleVerified')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 ${badge.classes}`}>
                      <Icon className="w-4 h-4" />
                      <span>{badge.label}</span>
                    </span>

                    {!isConfirmed && (
                      <button
                        onClick={() => markTaken(rem.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-xs transition-colors"
                      >
                        {t('elderly.taken')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SENIOR ASSISTANCE & EMERGENCY ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            id="elderly-contact-caregiver-btn"
            onClick={() => {
              window.location.href = 'tel:+919876543210';
            }}
            className="p-6 rounded-3xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xl flex items-center justify-center gap-4 shadow-md transition-all hover:scale-[1.01]"
          >
            <Phone className="w-8 h-8 text-blue-200" />
            <div className="text-left">
              <div>{t('elderly.contactCaregiver')}</div>
              <div className="text-xs text-blue-200 font-normal">{t('elderly.callPriya')}</div>
            </div>
          </button>

          <button
            id="elderly-emergency-btn"
            onClick={openEmergency}
            className="p-6 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xl flex items-center justify-center gap-4 shadow-md transition-all hover:scale-[1.01]"
          >
            <ShieldAlert className="w-8 h-8 text-rose-200" />
            <div className="text-left">
              <div>{t('elderly.emergencyContact')}</div>
              <div className="text-xs text-rose-100 font-normal">
                {t('elderly.physicianAndAmbulance')}
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
