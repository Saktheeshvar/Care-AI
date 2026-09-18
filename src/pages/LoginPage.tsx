import React, { useState } from 'react';
import { 
  HeartPulse, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('CAREGIVER');
  const [emailInput, setEmailInput] = useState('priya@careai.family');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmailInput(role === 'CAREGIVER' ? 'priya@careai.family' : 'lakshmi@careai.senior');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(selectedRole, emailInput);
      if (selectedRole === 'CAREGIVER') {
        navigate('/caregiver');
      } else {
        navigate('/elderly');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    try {
      await login(role, role === 'CAREGIVER' ? 'priya@careai.family' : 'lakshmi@careai.senior');
      if (role === 'CAREGIVER') {
        navigate('/caregiver');
      } else {
        navigate('/elderly');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-page-root" className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Sign In to CareAI
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Select your identity or use 1-click verified demo profiles
          </p>
        </div>

        {/* 1-Click Fast Track for Judges & Users */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Instant Demo Credentials
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="login-as-caregiver-btn"
              type="button"
              onClick={() => handleQuickLogin('CAREGIVER')}
              disabled={isSubmitting}
              className="p-3.5 rounded-2xl border-2 border-teal-600 bg-teal-50 hover:bg-teal-100/80 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-teal-900 uppercase">Caregiver</span>
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              </div>
              <div className="text-sm font-bold text-slate-900">Priya Caregiver</div>
              <div className="text-[11px] text-teal-700 mt-1">Full schedule & alert control</div>
            </button>

            <button
              id="login-as-elderly-btn"
              type="button"
              onClick={() => handleQuickLogin('ELDERLY')}
              disabled={isSubmitting}
              className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-slate-100 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-700 uppercase">Senior</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="text-sm font-bold text-slate-900">Lakshmi</div>
              <div className="text-[11px] text-slate-500 mt-1">Large buttons & voice UI</div>
            </button>
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Account Email
            </label>
            <input
              id="login-email-input"
              type="email"
              required
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
              placeholder="name@careai.family"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Role Access
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('CAREGIVER')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  selectedRole === 'CAREGIVER'
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Caregiver
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('ELDERLY')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                  selectedRole === 'ELDERLY'
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Elderly User
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter {selectedRole === 'CAREGIVER' ? 'Caregiver Portal' : 'Elderly Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & Roles disclaimer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>
            <strong>Role-Based Access:</strong> Seniors can confirm reminders and speak with CareAI. Only authorized caregivers can manage medications or view clinical history.
          </span>
        </div>
      </div>
    </div>
  );
};
