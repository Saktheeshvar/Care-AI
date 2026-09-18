import React from 'react';
import { CareLoopStage } from '../types';
import { Calendar, Bell, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CareLoopProps {
  currentStage?: CareLoopStage;
  interactive?: boolean;
  onSelectStage?: (stage: CareLoopStage) => void;
  compact?: boolean;
}

export const CareLoop: React.FC<CareLoopProps> = ({
  currentStage = 1,
  interactive = false,
  onSelectStage,
  compact = false
}) => {
  const { t } = useLanguage();

  const stages: {
    stage: CareLoopStage;
    title: string;
    sub: string;
    time: string;
    icon: React.ElementType;
    color: string;
    activeBg: string;
    borderColor: string;
  }[] = [
    {
      stage: 1,
      title: t('careloop.stage1.title'),
      sub: t('careloop.stage1.sub'),
      time: t('careloop.stage1.time'),
      icon: Calendar,
      color: 'text-blue-600',
      activeBg: 'bg-blue-50 text-blue-900 border-blue-500 ring-2 ring-blue-400',
      borderColor: 'border-blue-200'
    },
    {
      stage: 2,
      title: t('careloop.stage2.title'),
      sub: t('careloop.stage2.sub'),
      time: t('careloop.stage2.time'),
      icon: Bell,
      color: 'text-teal-600',
      activeBg: 'bg-teal-50 text-teal-900 border-teal-500 ring-2 ring-teal-400',
      borderColor: 'border-teal-200'
    },
    {
      stage: 3,
      title: t('careloop.stage3.title'),
      sub: t('careloop.stage3.sub'),
      time: t('careloop.stage3.time'),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-400',
      borderColor: 'border-emerald-200'
    },
    {
      stage: 4,
      title: t('careloop.stage4.title'),
      sub: t('careloop.stage4.sub'),
      time: t('careloop.stage4.time'),
      icon: Clock,
      color: 'text-amber-600',
      activeBg: 'bg-amber-50 text-amber-900 border-amber-500 ring-2 ring-amber-400',
      borderColor: 'border-amber-200'
    },
    {
      stage: 5,
      title: t('careloop.stage5.title'),
      sub: t('careloop.stage5.sub'),
      time: t('careloop.stage5.time'),
      icon: AlertTriangle,
      color: 'text-rose-600',
      activeBg: 'bg-rose-50 text-rose-900 border-rose-500 ring-2 ring-rose-400',
      borderColor: 'border-rose-200'
    }
  ];

  if (compact) {
    return (
      <div id="care-loop-compact" className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isActive = st.stage === currentStage;
            return (
              <React.Fragment key={st.stage}>
                <div
                  onClick={() => interactive && onSelectStage?.(st.stage)}
                  className={`flex-1 min-w-[130px] p-2.5 rounded-lg border text-center transition-all ${
                    isActive ? st.activeBg : 'bg-slate-50 border-slate-200 opacity-75'
                  } ${interactive ? 'cursor-pointer hover:opacity-100' : ''}`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icon className={`w-4 h-4 ${st.color}`} />
                    <span className="text-xs font-bold">{st.stage}. {st.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{st.time}</div>
                </div>

                {idx < stages.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 hidden md:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div id="care-loop-full" className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>{t('careloop.title')}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {t('careloop.step').replace('{step}', String(currentStage))}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 text-teal-800 self-start sm:self-auto">
          {t('careloop.active')}: {stages.find(s => s.stage === currentStage)?.title}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        {stages.map((st) => {
          const Icon = st.icon;
          const isActive = st.stage === currentStage;
          const isPassed = st.stage < currentStage;

          return (
            <div
              key={st.stage}
              id={`care-loop-stage-${st.stage}`}
              onClick={() => interactive && onSelectStage?.(st.stage)}
              className={`p-4 rounded-xl border-2 transition-all relative ${
                isActive 
                  ? `${st.activeBg} shadow-sm scale-[1.02]` 
                  : isPassed
                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 opacity-80'
              } ${interactive ? 'cursor-pointer hover:opacity-100 hover:border-slate-400' : ''}`}
            >
              {isActive && (
                <span className="absolute -top-2.5 right-3 bg-teal-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  NOW
                </span>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-xs' : 'bg-white/80'}`}>
                  <Icon className={`w-5 h-5 ${st.color}`} />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-white/60 px-1.5 py-0.5 rounded border border-slate-200/50">
                  {st.time}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-400">0{st.stage}</span>
                  <h4 className="text-xs font-black text-slate-900 leading-snug">{st.title}</h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{st.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
