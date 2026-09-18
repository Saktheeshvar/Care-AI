import React from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft,
  Users
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

interface CaregiverMedicinesPageProps {
  navigate: (path: string) => void;
}

export const CaregiverMedicinesPage: React.FC<CaregiverMedicinesPageProps> = ({ navigate }) => {
  const { medicines, refreshAll, elderlyUsers, selectedElderlyId, setSelectedElderlyId, activeSenior } = useCareAI();
  const { t } = useLanguage();

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.updateMedicine(id, { active: !currentActive });
      await refreshAll();
    } catch (err: any) {
      alert(err.message || 'Failed to update medicine status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(t('medicines.confirmRemove').replace('{name}', name))) {
      try {
        await api.deleteMedicine(id);
        await refreshAll();
      } catch (err: any) {
        alert(err.message || 'Failed to delete medicine');
      }
    }
  };

  const seniorName = activeSenior?.name || 'Lakshmi';

  return (
    <div id="caregiver-medicines-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
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
                {t('medicines.title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('medicines.manageScheduleFor').replace('{name}', seniorName)}
              </p>
            </div>
          </div>

          <button
            id="add-medicine-header-btn"
            onClick={() => navigate('/caregiver/medicines/new')}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('medicines.addNewMedication')}</span>
          </button>
        </div>

        {/* Senior Selector Tabs */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 ml-2" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('caregiver.selectSenior')}</span>
          {elderlyUsers.map(user => {
            const rel = user.id === 'elderly_1' ? t('caregiver.mother') : t('caregiver.father');
            return (
              <button
                key={user.id}
                onClick={() => setSelectedElderlyId(user.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedElderlyId === user.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {user.name} ({rel})
              </button>
            );
          })}
        </div>

        {/* Safety Note banner */}
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3 text-xs text-teal-950 font-medium">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <span>
            {t('medicines.safetyDirective')}
          </span>
        </div>

        {/* Medication Cards List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {medicines.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="text-base font-bold">{t('medicines.emptyTitle').replace('{name}', seniorName)}</div>
              <p className="text-xs text-slate-400 mt-1">{t('medicines.emptySub')}</p>
            </div>
          ) : (
            medicines.map((med) => (
              <div 
                key={med.id}
                id={`medicine-card-${med.id}`}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-mono font-black text-sm shrink-0">
                    {med.time}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{med.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        med.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {med.active ? t('medicines.active') : t('medicines.suspended')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                      <span>{med.frequency}</span>
                      <span>•</span>
                      <span>Start: {med.startDate}</span>
                      {med.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-600">"{med.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleToggleActive(med.id, med.active)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      med.active 
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                    }`}
                  >
                    {med.active ? t('medicines.pause') : t('medicines.activate')}
                  </button>

                  <button
                    onClick={() => navigate(`/caregiver/medicines/edit/${med.id}`)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                    title={t('medicines.edit')}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(med.id, med.name)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                    title={t('medicines.remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
