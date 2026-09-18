import React, { useState } from 'react';
import { 
  History, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  ArrowLeft, 
  ShieldCheck
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';

interface CaregiverHistoryPageProps {
  navigate: (path: string) => void;
}

export const CaregiverHistoryPage: React.FC<CaregiverHistoryPageProps> = ({ navigate }) => {
  const { history, activeSenior } = useCareAI();
  const { t } = useLanguage();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const seniorName = activeSenior?.name || 'Lakshmi';

  const filteredHistory = history.filter(item => {
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
      return false;
    }
    if (searchTerm && !item.medicineName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedDate && item.date !== selectedDate) {
      return false;
    }
    return true;
  });

  return (
    <div id="caregiver-history-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
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
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t('history.title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('history.subtitle')} ({seniorName})
              </p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('history.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-xs font-semibold"
            >
              <option value="ALL">{t('history.allStatuses')}</option>
              <option value="TAKEN">{t('status.TAKEN')}</option>
              <option value="PENDING">{t('status.PENDING')}</option>
              <option value="ESCALATED">{t('status.ESCALATED')}</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-xs font-semibold"
            />

            {(selectedStatus !== 'ALL' || searchTerm || selectedDate) && (
              <button
                onClick={() => {
                  setSelectedStatus('ALL');
                  setSearchTerm('');
                  setSelectedDate('');
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-teal-700 hover:bg-teal-50"
              >
                {t('history.reset')}
              </button>
            )}
          </div>
        </div>

        {/* History Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium text-xs">
              {t('history.noRecords')}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredHistory.map(item => {
                const isTaken = item.status === 'TAKEN';
                const isEscalated = item.status === 'ESCALATED';

                return (
                  <div 
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isTaken 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isEscalated 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isTaken ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isEscalated ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{item.medicineName}</h4>
                          <span className="font-mono text-xs text-slate-400">({item.scheduledTime})</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {t('history.date')}: {item.date} • {t('history.logged')}: {new Date(item.responseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isTaken 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : isEscalated
                          ? 'bg-rose-100 text-rose-800 border-rose-300 font-black'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {isTaken ? t('status.TAKEN') : isEscalated ? t('status.ESCALATED') : item.response}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>{t('history.complianceAuditFooter')}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
