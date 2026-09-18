import React from 'react';
import { Phone, AlertCircle, X, ShieldAlert, HeartPulse, User } from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';

interface EmergencyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ 
  isOpen: propIsOpen, 
  onClose: propOnClose 
}) => {
  const { isEmergencyOpen, closeEmergency, activeSenior } = useCareAI();
  const { t } = useLanguage();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isEmergencyOpen;
  const handleClose = propOnClose || closeEmergency;

  if (!isOpen) return null;

  const seniorName = activeSenior?.name || 'Lakshmi';

  return (
    <div 
      id="emergency-modal-backdrop" 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-dialog-title"
    >
      <div 
        id="emergency-modal-content"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-rose-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="emergency-dialog-title" className="text-xl font-extrabold tracking-tight">
                {t('emergency.title')}
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                {t('emergency.subtitle').replace('{name}', seniorName)}
              </p>
            </div>
          </div>
          <button 
            id="close-emergency-btn"
            onClick={handleClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Official Ambulance Helpline */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  {t('emergency.ambulanceTitle')}
                </div>
                <div className="text-lg font-black text-rose-900">108 / 112</div>
              </div>
            </div>
            <a 
              id="call-108-btn"
              href="tel:108" 
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t('emergency.call')}
            </a>
          </div>

          {/* Primary Caregiver */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  {t('emergency.primaryCaregiver')}
                </div>
                <div className="text-base font-bold text-slate-900">Priya Caregiver</div>
                <div className="text-xs text-slate-600 font-mono">+91 98765 43210</div>
              </div>
            </div>
            <a 
              id="call-caregiver-btn"
              href="tel:+919876543210" 
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t('emergency.call')}
            </a>
          </div>

          {/* Family Physician */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  {t('emergency.familyDoctor')}
                </div>
                <div className="text-base font-bold text-slate-900">Dr. Rajesh Kumar</div>
                <div className="text-xs text-slate-600 font-mono">+91 98400 12345</div>
              </div>
            </div>
            <a 
              id="call-physician-btn"
              href="tel:+919840012345" 
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t('emergency.call')}
            </a>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {t('ai.disclaimer')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            id="close-emergency-footer-btn"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold transition-colors"
          >
            {t('emergency.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
