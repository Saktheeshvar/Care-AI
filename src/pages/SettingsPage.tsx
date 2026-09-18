import React, { useState } from 'react';
import { 
  Languages, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  Volume2, 
  Sparkles,
  Sliders,
  Type
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsPageProps {
  navigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ navigate }) => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [largeFont, setLargeFont] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div id="settings-page-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(role === 'CAREGIVER' ? '/caregiver' : '/elderly')}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors bg-white border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Application Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Customize language, accessibility, and alert preferences
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-teal-800 text-white font-bold text-sm flex items-center gap-2 animate-in fade-in">
            <Check className="w-5 h-5 text-teal-300" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Profile Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>Active Profile</span>
          </h2>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-slate-900">{user?.name}</div>
              <div className="text-xs text-slate-500 font-mono">{user?.email}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              Role: {role}
            </span>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Languages className="w-4 h-4 text-teal-600" />
            <span>Interface Language</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-2xl border-2 font-bold text-sm text-left transition-all ${
                language === 'en'
                  ? 'border-teal-600 bg-teal-50 text-teal-950'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-base font-black">English</div>
              <div className="text-xs text-slate-500 mt-0.5">Primary system language</div>
            </button>

            <button
              onClick={() => setLanguage('ta')}
              className={`p-4 rounded-2xl border-2 font-bold text-sm text-left transition-all ${
                language === 'ta'
                  ? 'border-teal-600 bg-teal-50 text-teal-950'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-base font-black">தமிழ் (Tamil)</div>
              <div className="text-xs text-slate-500 mt-0.5">முழுமையான தமிழ் இடைமுகம்</div>
            </button>
          </div>
        </div>

        {/* Accessibility & Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-600" />
            <span>Accessibility & Notifications</span>
          </h2>

          <div className="divide-y divide-slate-100">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Audio Chimes on Reminder</div>
                <div className="text-xs text-slate-500">Play pleasant sound alert when medication is due</div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={e => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Caregiver Alert Escalations</div>
                <div className="text-xs text-slate-500">Dispatch alerts if reminder unconfirmed past 30m</div>
              </div>
              <input
                type="checkbox"
                checked={pushAlerts}
                onChange={e => setPushAlerts(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">Senior High-Contrast Font Tuning</div>
                <div className="text-xs text-slate-500">Boost font weights for elderly legibility</div>
              </div>
              <input
                type="checkbox"
                checked={largeFont}
                onChange={e => setLargeFont(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Sign Out & Safety */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900">Session Security</div>
            <div className="text-xs text-slate-500">Log out of current device session</div>
          </div>

          <button
            id="settings-logout-btn"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-2 border border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
