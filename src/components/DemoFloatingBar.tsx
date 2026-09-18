import React, { useState } from 'react';
import { useCareAI } from '../contexts/CareAIContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Play, 
  RotateCcw, 
  Bell, 
  Clock, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  UserCheck,
  CheckCircle2,
  Users
} from 'lucide-react';
import { Language } from '../types';

interface DemoFloatingBarProps {
  navigate?: (path: string) => void;
}

export const DemoFloatingBar: React.FC<DemoFloatingBarProps> = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { 
    reminders, 
    triggerDue, 
    markTaken, 
    triggerFollowUp, 
    triggerEscalate, 
    resetDemo, 
    currentCareLoopStage,
    elderlyUsers,
    selectedElderlyId,
    setSelectedElderlyId,
    activeSenior
  } = useCareAI();
  const { role, switchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Find morning medicine or active target
  const targetReminder = reminders.find(r => r.medicineName.includes('Morning')) || reminders[0];

  const handleCycleLanguage = () => {
    const nextLang: Record<Language, Language> = {
      en: 'ta',
      ta: 'hi',
      hi: 'en'
    };
    setLanguage(nextLang[language]);
  };

  const languageLabels: Record<Language, string> = {
    en: 'English',
    ta: 'தமிழ்',
    hi: 'हिन्दी'
  };

  return (
    <div 
      id="demo-simulation-bar"
      className="fixed bottom-3 right-3 z-40 max-w-2xl w-[calc(100vw-24px)] md:w-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden"
    >
      {/* Header / Toggle */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-800 flex items-center justify-between cursor-pointer border-b border-slate-700/80 select-none"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {t('demo.barTitle')}
          </span>
          <span className="text-[11px] bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded border border-teal-500/30">
            {t('careloop.step').replace('{step}', String(currentCareLoopStage))}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Senior: <strong className="text-white">{activeSenior?.name || 'Lakshmi'}</strong>
          </span>
          <button 
            aria-label="Toggle Simulator Bar" 
            className="text-slate-400 hover:text-white"
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 bg-slate-900 space-y-2 text-xs">
          {/* Main 6 Hackathon Demo Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Control 1: RESET DEMO */}
            <button
              id="demo-btn-reset"
              onClick={resetDemo}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Restores clean seed state for Lakshmi and Raman"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              {t('demo.reset')}
            </button>

            {/* Control 2: TRIGGER REMINDER */}
            <button
              id="demo-btn-trigger"
              onClick={() => triggerDue(targetReminder?.id)}
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Transitions reminder to DUE / PENDING state"
            >
              <Play className="w-3.5 h-3.5" />
              {t('demo.trigger')}
            </button>

            {/* Control 3: SIMULATE +15 MIN */}
            <button
              id="demo-btn-followup"
              onClick={() => triggerFollowUp(targetReminder?.id)}
              className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Simulates +15 minutes without response; triggers follow-up reminder"
            >
              <Clock className="w-3.5 h-3.5" />
              {t('demo.followup')}
            </button>

            {/* Control 4: SIMULATE +30 MIN */}
            <button
              id="demo-btn-escalate-30m"
              onClick={() => triggerEscalate(targetReminder?.id)}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Simulates +30 minutes without response; triggers caregiver alert"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('demo.escalate')}
            </button>

            {/* Control 5: MARK TAKEN */}
            <button
              id="demo-btn-taken"
              onClick={() => targetReminder && markTaken(targetReminder.id)}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Simulates senior tapping TAKEN; stops escalation & logs history"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('demo.taken')}
            </button>

            {/* Control 6: TRIGGER CAREGIVER ALERT */}
            <button
              id="demo-btn-alert-direct"
              onClick={() => triggerEscalate(targetReminder?.id)}
              className="px-3 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Directly dispatches escalation alert to Priya"
            >
              <Bell className="w-3.5 h-3.5" />
              {t('demo.caregiverAlert')}
            </button>
          </div>

          {/* Quick Context Switchers: Senior, Role, and Language */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            {/* Senior selector */}
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('caregiver.selectSenior')}</span>
              {elderlyUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedElderlyId(u.id)}
                  className={`px-2 py-1 rounded font-bold transition-colors ${
                    selectedElderlyId === u.id 
                      ? 'bg-teal-500 text-slate-950 font-black' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {u.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Role toggle */}
              <button
                id="demo-btn-role-switch"
                onClick={() => switchRole(role === 'CAREGIVER' ? 'ELDERLY' : 'CAREGIVER')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1"
                title="Toggle View Role"
              >
                <UserCheck className="w-3 h-3 text-teal-400" />
                <span>{role === 'CAREGIVER' ? t('role.viewAsSenior') : t('role.viewAsCaregiver')}</span>
              </button>

              {/* Language toggle: cycles through English -> Tamil -> Hindi */}
              <button
                id="demo-btn-lang-switch"
                onClick={handleCycleLanguage}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold border border-slate-700"
                title="Cycle Language (EN / தமிழ் / हिन्दी)"
              >
                {languageLabels[language]}
              </button>

              {navigate && (
                <button
                  onClick={() => navigate('/demo')}
                  className="text-slate-400 hover:text-white underline"
                >
                  {t('demo.fullScreen')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
