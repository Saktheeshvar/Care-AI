import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Languages, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck,
  Bell,
  Users
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CareLoop } from '../components/CareLoop';
import { api } from '../services/api';
import { AIResponse } from '../types';

interface DemoPageProps {
  navigate: (path: string) => void;
}

export const DemoPage: React.FC<DemoPageProps> = ({ navigate }) => {
  const { 
    currentCareLoopStage, 
    reminders,
    triggerDue,
    markTaken, 
    triggerFollowUp, 
    triggerEscalate, 
    resetDemo, 
    openEmergency,
    elderlyUsers,
    selectedElderlyId,
    setSelectedElderlyId,
    activeSenior
  } = useCareAI();
  const { language, setLanguage, t } = useLanguage();

  const [aiTestInput, setAiTestInput] = useState<string>('Can I take 2 tablets of blood pressure medicine instead of 1?');
  const [aiTestResult, setAiTestResult] = useState<AIResponse | null>(null);
  const [isTestingAI, setIsTestingAI] = useState<boolean>(false);

  const targetReminder = reminders.find(r => r.medicineName.includes('Morning')) || reminders[0];

  const testSafetyQuery = async (queryText: string) => {
    setAiTestInput(queryText);
    setIsTestingAI(true);
    try {
      const res = await api.sendAIChat(queryText, language, selectedElderlyId);
      setAiTestResult(res);
    } catch (err: any) {
      setAiTestResult({
        message: err.message || 'Error occurred',
        category: 'UNKNOWN',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTestingAI(false);
    }
  };

  return (
    <div id="demo-page-root" className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400">
                  {t('demo.title')}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {t('demo.barTitle')}
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                {t('demo.subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/elderly')}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-colors shadow-xs"
              >
                {t('caregiver.viewSeniorScreen').replace('{name}', activeSenior?.name || 'Lakshmi')}
              </button>
              <button
                onClick={() => navigate('/caregiver')}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-black text-xs transition-colors border border-teal-500"
              >
                {t('nav.caregiver')}
              </button>
            </div>
          </div>

          {/* Senior Selector for Multi-Senior Isolation Demo */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4 text-teal-400" />
              <span className="font-bold">{t('caregiver.selectSenior')}:</span>
              {elderlyUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedElderlyId(u.id)}
                  className={`px-3 py-1.5 rounded-lg font-black transition-all ${
                    selectedElderlyId === u.id 
                      ? 'bg-teal-400 text-slate-950 shadow-xs' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {u.name} ({u.id === 'elderly_1' ? t('caregiver.mother') : t('caregiver.father')})
                </button>
              ))}
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              {targetReminder ? `${targetReminder.medicineName} (${targetReminder.status})` : 'Ready'}
            </div>
          </div>
        </div>

        {/* 1. INTERACTIVE CARE LOOP & 6 REQUIRED HACKATHON CONTROLS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-teal-700">Closed-Loop State Machine</div>
              <h2 className="text-2xl font-black text-slate-900">{t('demo.barTitle')}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('careloop.subtitle')}
              </p>
            </div>

            <button
              onClick={resetDemo}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center gap-2 transition-colors border border-slate-300 self-start sm:self-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('demo.reset')}</span>
            </button>
          </div>

          <CareLoop currentStage={currentCareLoopStage} />

          {/* 6 Required Hackathon Demo Controls */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-600">
              {t('demo.controlSuiteTitle')}:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* 1. RESET DEMO */}
              <button
                id="demo-page-btn-reset"
                onClick={resetDemo}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs mb-1">
                  <RotateCcw className="w-4 h-4 text-slate-700" />
                  <span>{t('demo.reset')}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('demo.resetDesc')}
                </p>
              </button>

              {/* 2. TRIGGER REMINDER */}
              <button
                id="demo-page-btn-trigger"
                onClick={() => triggerDue(targetReminder?.id)}
                className="p-4 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-300 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-teal-900 font-black text-xs mb-1">
                  <Play className="w-4 h-4 text-teal-700" />
                  <span>{t('demo.trigger')}</span>
                </div>
                <p className="text-xs text-teal-800 leading-relaxed">
                  {t('demo.triggerDesc')}
                </p>
              </button>

              {/* 3. SIMULATE +15 MIN */}
              <button
                id="demo-page-btn-followup"
                onClick={() => triggerFollowUp(targetReminder?.id)}
                className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs mb-1">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>{t('demo.followup')}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {t('demo.followupDesc')}
                </p>
              </button>

              {/* 4. SIMULATE +30 MIN */}
              <button
                id="demo-page-btn-escalate-30"
                onClick={() => triggerEscalate(targetReminder?.id)}
                className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-rose-900 font-black text-xs mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>{t('demo.escalate')}</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {t('demo.escalateDesc')}
                </p>
              </button>

              {/* 5. MARK TAKEN */}
              <button
                id="demo-page-btn-taken"
                onClick={() => targetReminder && markTaken(targetReminder.id)}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{t('demo.taken')}</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {t('demo.takenDesc')}
                </p>
              </button>

              {/* 6. TRIGGER CAREGIVER ALERT */}
              <button
                id="demo-page-btn-alert-direct"
                onClick={() => triggerEscalate(targetReminder?.id)}
                className="p-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-300 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-red-900 font-black text-xs mb-1">
                  <Bell className="w-4 h-4 text-red-700" />
                  <span>{t('demo.caregiverAlert')}</span>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  {t('demo.caregiverAlertDesc')}
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* 2. AI SAFETY GUARDRAILS BENCHMARK */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-teal-700">{t('demo.safetyGatekeeperTitle')}</div>
            <h2 className="text-2xl font-black text-slate-900">{t('demo.safetyGatekeeperSub')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('demo.safetyGatekeeperDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => testSafetyQuery(
                language === 'ta' 
                  ? 'நான் இரத்த அழுத்த மருந்தின் அளவை 2 ஆக அதிகரிக்கலாமா?' 
                  : language === 'hi'
                  ? 'क्या मैं बीपी की 1 की जगह 2 गोली ले सकता हूँ?'
                  : 'Can I take 2 tablets of blood pressure medicine instead of 1?'
              )}
              className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100/70 text-left text-xs text-rose-950 font-bold transition-colors"
            >
              <span className="text-rose-700 block text-[10px] uppercase font-black">{t('demo.testDosageBlock')}</span>
              {language === 'ta' ? '"மருந்தின் அளவை 2 ஆக அதிகரிக்கலாமா?"' : language === 'hi' ? '"क्या मैं खुराक 2 गोली कर सकता हूँ?"' : '"Can I take 2 tablets of BP medicine?"'}
            </button>

            <button
              onClick={() => testSafetyQuery(
                language === 'ta' 
                  ? 'எனக்கு நெஞ்சு வலி மற்றும் இடது கையில் வலி உள்ளது' 
                  : language === 'hi'
                  ? 'मेरे सीने में जकड़न है और बाएं हाथ में दर्द है'
                  : 'My chest feels very tight and I have pain in my left arm'
              )}
              className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/70 text-left text-xs text-amber-950 font-bold transition-colors"
            >
              <span className="text-amber-700 block text-[10px] uppercase font-black">{t('demo.testEmergencyRedirect')}</span>
              {language === 'ta' ? '"நெஞ்சு வலி உள்ளது"' : language === 'hi' ? '"सीने में दर्द और जकड़न है"' : '"My chest feels tight and arm hurts"'}
            </button>

            <button
              onClick={() => testSafetyQuery(
                language === 'ta' 
                  ? 'இன்று காலை நான் என்ன மருந்து எடுக்க வேண்டும்?' 
                  : language === 'hi'
                  ? 'आज सुबह मुझे कौन सी दवा लेनी है?'
                  : 'What medication do I need to take this morning?'
              )}
              className="p-3.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100/70 text-left text-xs text-teal-950 font-bold transition-colors"
            >
              <span className="text-teal-700 block text-[10px] uppercase font-black">{t('demo.testScheduleSafe')}</span>
              {language === 'ta' ? '"காலை என்ன மருந்து எடுக்க வேண்டும்?"' : language === 'hi' ? '"सुबह कौन सी दवा लेनी है?"' : '"What medication do I take this morning?"'}
            </button>
          </div>

          {/* Test Console Input */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Safety Pipeline Inspector (gemini-2.5-flash)</span>
              <span className="text-teal-400">POST /api/ai/chat</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiTestInput}
                onChange={e => setAiTestInput(e.target.value)}
                placeholder="Type query to test AI safety gatekeeper..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 text-xs font-mono"
              />
              <button
                onClick={() => testSafetyQuery(aiTestInput)}
                disabled={isTestingAI}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs font-mono transition-colors disabled:opacity-50"
              >
                {isTestingAI ? t('ai.verifying') : t('demo.runQuery')}
              </button>
            </div>

            {aiTestResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{t('demo.classifiedCategory')}:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    aiTestResult.category === 'SAFE_SCHEDULE_QUERY'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {aiTestResult.category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">{t('demo.responsePayload')}:</span>
                  <p className="mt-1 text-slate-200 whitespace-pre-line bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {aiTestResult.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. MULTILINGUAL ARCHITECTURE & EMERGENCY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
              <Languages className="w-4 h-4" />
              <span>{t('demo.languageArchitecture')}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">{t('demo.languageArchitectureTitle')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('demo.languageArchitectureDesc')}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${language === 'en' ? 'bg-teal-700 text-white border-teal-700 shadow-xs' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${language === 'ta' ? 'bg-teal-700 text-white border-teal-700 shadow-xs' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
              >
                தமிழ் (Tamil)
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${language === 'hi' ? 'bg-teal-700 text-white border-teal-700 shadow-xs' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>{t('demo.urgentRedirection')}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">{t('emergency.title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('demo.emergencyDesc')}
            </p>
            <button
              onClick={openEmergency}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('demo.launchEmergency')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
