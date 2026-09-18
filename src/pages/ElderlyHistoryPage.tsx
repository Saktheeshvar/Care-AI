import React from 'react';
import { CheckCircle2, Clock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ElderlyHistoryPageProps {
  navigate: (path: string) => void;
}

export const ElderlyHistoryPage: React.FC<ElderlyHistoryPageProps> = ({ navigate }) => {
  const { history, activeSenior } = useCareAI();
  const { t } = useLanguage();

  return (
    <div id="elderly-history-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/elderly')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-base py-2 px-4 rounded-xl bg-white border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('nav.dashboard')}</span>
          </button>

          <span className="text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            {activeSenior?.name || 'Lakshmi'}
          </span>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950 tracking-tight mb-2">
            {t('history.title')}
          </h1>
          <p className="text-sm text-slate-600">
            {t('history.subtitle')}
          </p>

          <div className="mt-6 space-y-3">
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">
                {t('history.noRecords')}
              </div>
            ) : (
              history.map(item => {
                const isTaken = item.response === 'TAKEN' || item.status === 'TAKEN';
                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isTaken 
                        ? 'border-emerald-200 bg-emerald-50/50' 
                        : 'border-amber-200 bg-amber-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                        isTaken ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isTaken ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="text-lg font-black text-slate-900">
                          {item.medicineName}
                        </div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5">
                          {t('caregiver.colTime')}: {item.scheduledTime} • {t('history.logged')}: {new Date(item.responseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-auto">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${
                        isTaken
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {isTaken ? t('caregiver.completed') : t('caregiver.pending')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>{t('history.complianceAuditFooter')}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
