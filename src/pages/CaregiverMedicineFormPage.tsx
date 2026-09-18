import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  ShieldCheck, 
  AlertCircle, 
  Users 
} from 'lucide-react';
import { useCareAI } from '../contexts/CareAIContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { MedicationFrequency } from '../types';

interface CaregiverMedicineFormPageProps {
  medicineId?: string;
  navigate: (path: string) => void;
}

export const CaregiverMedicineFormPage: React.FC<CaregiverMedicineFormPageProps> = ({ 
  medicineId, 
  navigate 
}) => {
  const { medicines, refreshAll, elderlyUsers, selectedElderlyId } = useCareAI();
  const { t } = useLanguage();
  const isEdit = Boolean(medicineId);

  const [elderlyUserId, setElderlyUserId] = useState<string>(selectedElderlyId);
  const [name, setName] = useState('');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState<MedicationFrequency>('Daily');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && medicineId) {
      const existing = medicines.find(m => m.id === medicineId);
      if (existing) {
        setName(existing.name);
        setTime(existing.time);
        setFrequency(existing.frequency);
        setStartDate(existing.startDate || new Date().toISOString().split('T')[0]);
        setActive(existing.active);
        setNotes(existing.notes || '');
        if (existing.elderlyUserId) {
          setElderlyUserId(existing.elderlyUserId);
        }
      } else {
        setErrorMsg('Medication not found.');
      }
    }
  }, [isEdit, medicineId, medicines]);

  const assignedSenior = elderlyUsers.find(u => u.id === elderlyUserId) || elderlyUsers[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validations
    if (!name.trim()) {
      setErrorMsg('Medication name is required.');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      setErrorMsg('Time must be in 24-hour format HH:mm (e.g. 08:00 or 14:30).');
      return;
    }
    if (!startDate) {
      setErrorMsg('Valid start date is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && medicineId) {
        await api.updateMedicine(medicineId, {
          elderlyUserId,
          name: name.trim(),
          time,
          frequency,
          startDate,
          active,
          notes
        });
      } else {
        await api.createMedicine({
          elderlyUserId,
          name: name.trim(),
          time,
          frequency,
          startDate,
          active,
          notes
        });
      }
      await refreshAll();
      navigate('/caregiver/medicines');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save medication schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="caregiver-medicine-form-root" className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/caregiver/medicines')}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors bg-white border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? t('medicines.editSchedule') : t('medicines.addSchedule')}
            </h1>
            <p className="text-xs text-slate-500">
              {t('medicines.assignedSenior')}: <strong>{assignedSenior?.name || 'Lakshmi'}</strong>
            </p>
          </div>
        </div>

        {/* Safety Note banner */}
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3 text-xs text-teal-950">
          <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <span>
            {t('medicines.safetyDirective')}
          </span>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Elderly User Target Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-700" />
              <span>{t('medicines.targetSenior')} *</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {elderlyUsers.map(user => {
                const rel = user.id === 'elderly_1' ? t('caregiver.mother') : t('caregiver.father');
                return (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => setElderlyUserId(user.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-black transition-all ${
                      elderlyUserId === user.id
                        ? 'border-teal-600 bg-teal-50 text-teal-950 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">{user.name}</div>
                    <div className="text-[11px] font-normal text-slate-500">{rel}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t('medicines.nameLabel')} *
            </label>
            <input
              id="medicine-name-input"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning Blood Pressure Medicine"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {t('medicines.noDosageHint')}
            </p>
          </div>

          {/* Time & Frequency Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('medicines.timeLabel')} (24H) *
              </label>
              <div className="relative">
                <input
                  id="medicine-time-input"
                  type="time"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                +15m Follow-up • +30m Escalation
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('medicines.frequencyLabel')} *
              </label>
              <select
                id="medicine-frequency-select"
                value={frequency}
                onChange={e => setFrequency(e.target.value as MedicationFrequency)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium bg-white"
              >
                <option value="Daily">{t('medicines.daily')}</option>
                <option value="Twice Daily">{t('medicines.twiceDaily')}</option>
                <option value="Weekly">{t('medicines.weekly')}</option>
                <option value="As Needed">{t('medicines.asNeeded')}</option>
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('medicines.startDateLabel')} *
              </label>
              <input
                id="medicine-startdate-input"
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('medicines.statusLabel')}
              </label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  id="medicine-active-checkbox"
                  type="checkbox"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-800">
                  {active ? t('medicines.activeInLoop') : t('medicines.scheduleSuspended')}
                </span>
              </div>
            </div>
          </div>

          {/* Context Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t('medicines.notesLabel')}
            </label>
            <input
              id="medicine-notes-input"
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Schedule after breakfast with warm water"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/caregiver/medicines')}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              {t('medicines.cancel')}
            </button>

            <button
              id="save-medicine-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? t('medicines.saving') : isEdit ? t('medicines.updateSchedule') : t('medicines.createSchedule')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
