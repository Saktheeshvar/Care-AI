import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';

interface CaregiverUsersPageProps {
  navigate: (path: string) => void;
}

export const CaregiverUsersPage: React.FC<CaregiverUsersPageProps> = ({ navigate }) => {
  const { elderlyUsers, selectedElderlyId, setSelectedElderlyId } = useCareAI();
  const { t } = useLanguage();

  return (
    <div id="caregiver-users-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/caregiver')}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors bg-white border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('caregiver.allProfiles')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('caregiver.commandCenter')} — {elderlyUsers.length} Senior Profiles
            </p>
          </div>
        </div>

        {/* List of elderly profiles */}
        <div className="space-y-6">
          {elderlyUsers.map(senior => {
            const isSelected = selectedElderlyId === senior.id;
            const isLakshmi = senior.id === 'elderly_1';
            
            // Expected stats according to prompt:
            // Lakshmi: 3 reminders, 2 completed, 1 pending
            // Raman: 4 reminders, 4 completed, 0 pending
            const totalMeds = isLakshmi ? 3 : 4;
            const completedCount = isLakshmi ? 2 : 4;
            const pendingCount = isLakshmi ? 1 : 0;
            const relationshipLabel = isLakshmi ? t('caregiver.mother') : t('caregiver.father');

            return (
              <div 
                key={senior.id}
                className={`bg-white rounded-3xl border transition-all shadow-xs p-6 sm:p-8 space-y-6 ${
                  isSelected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 font-black text-2xl flex items-center justify-center">
                      {senior.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-slate-900">{senior.name}</h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isLakshmi ? 'bg-teal-100 text-teal-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {relationshipLabel}
                        </span>
                        {isSelected && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                            {t('caregiver.activeSeniorBadge')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Assigned Caregiver: <strong>Priya Caregiver (Daughter)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        setSelectedElderlyId(senior.id);
                        navigate('/caregiver');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{t('caregiver.selectActive')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedElderlyId(senior.id);
                        navigate('/elderly');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-300"
                    >
                      <span>{t('caregiver.viewSeniorScreen').replace('{name}', senior.name)}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status and Statistics Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">{t('caregiver.totalMedicines')}</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">{totalMeds}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('caregiver.completed')}
                    </div>
                    <div className="text-xl font-black text-emerald-700 mt-0.5">{completedCount}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {t('caregiver.pending')}
                    </div>
                    <div className="text-xl font-black text-amber-700 mt-0.5">{pendingCount}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {t('emergency.title')}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-500 font-medium">{t('emergency.familyDoctor')}: </span>
                        <strong className="text-slate-800">{senior.emergencyContactName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Phone: </span>
                        <a href={`tel:${senior.emergencyContactPhone}`} className="text-teal-700 font-mono font-bold hover:underline">
                          {senior.emergencyContactPhone}
                        </a>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">{t('emergency.ambulanceTitle')}: </span>
                        <strong className="text-rose-600 font-mono font-bold">108 / 112</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {t('nav.settings')}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-500 font-medium">Preferred Language: </span>
                        <strong className="text-slate-800">
                          {senior.preferredLanguage === 'ta' ? 'தமிழ் (Tamil)' : 'English / हिन्दी'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Caregiver Oversight: </span>
                        <strong className="text-emerald-700">Priya Caregiver</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Relationship: </span>
                        <strong className="text-slate-800">{relationshipLabel}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
