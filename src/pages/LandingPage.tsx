import React from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Languages, 
  Mic, 
  ArrowRight, 
  Users, 
  ShieldAlert,
  ChevronRight,
  Activity
} from 'lucide-react';
import { CareLoop } from '../components/CareLoop';
import { useCareAI } from '../contexts/CareAIContext';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { currentCareLoopStage } = useCareAI();

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-teal-50/20 to-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-900 text-xs font-bold mb-6 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            CareAI Healthcare Assistant
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto font-display leading-[1.12]">
            Helping seniors stay on schedule.<br className="hidden sm:inline" />
            <span className="text-teal-700"> Helping families stay informed.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            CareAI helps elderly users manage medication reminders with large, accessible interfaces while keeping authorized caregivers informed when reminders are not confirmed.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-try-careai-btn"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-700/20 transition-all hover:scale-[1.02]"
            >
              <span>TRY CAREAI</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              id="hero-view-demo-btn"
              onClick={() => navigate('/demo')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-base flex items-center justify-center gap-2 border border-slate-300 shadow-xs transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>VIEW LIVE DEMO</span>
            </button>
          </div>

          {/* Key Safety Callout */}
          <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Reminder & Awareness System — Zero dosage suggestions, zero diagnosis speculation.</span>
          </div>
        </div>
      </section>

      {/* 2. THE CARE LOOP (Section 9) */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs uppercase font-bold tracking-widest text-teal-700 mb-2">Automated Lifecycle</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">The 5-Stage Closed-Loop Escalation</h3>
          <p className="mt-2 text-sm text-slate-600">
            A reliable protocol that transitions from gentle senior notifications to urgent caregiver awareness.
          </p>
        </div>

        <CareLoop currentStage={currentCareLoopStage} />
      </section>

      {/* 3. PROBLEM & SOLUTION (Sections 1 & 2) */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* The Problem */}
            <div className="p-8 rounded-2xl bg-rose-50/50 border border-rose-200/80">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">The Healthcare Non-Adherence Gap</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                  <span><strong>Seniors Forget:</strong> Over 50% of seniors miss prescribed medicine doses due to cluttered phone notifications or complex interfaces.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                  <span><strong>Caregivers In The Dark:</strong> Adult children working away from home have no reliable way to verify if morning tablets were taken.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                  <span><strong>Language & Visual Barriers:</strong> Most modern apps use tiny fonts, English-only text, and confusing nested navigation bars.</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-2xl bg-teal-50/50 border border-teal-200/80">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">The CareAI Closed-Loop Solution</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0"></span>
                  <span><strong>Dual-Role Architecture:</strong> A large-button, high-contrast UI for seniors and a granular dashboard for caregivers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0"></span>
                  <span><strong>Smart 30-Minute Escalation:</strong> Unconfirmed reminders trigger a follow-up at 15m and an urgent family notification at 30m.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 shrink-0"></span>
                  <span><strong>Bilingual Voice Assistant:</strong> Seniors can speak naturally in English or Tamil to query their schedule safely.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SMART REMINDER ESCALATION (Section 4) */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase font-bold tracking-widest text-teal-700 mb-2">Deterministic Escalation</h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Smart Reminder Escalation Timeline</h3>
          <p className="mt-2 text-sm text-slate-600">
            CareAI prevents missed medications by ensuring family members are notified before health is compromised.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-mono font-bold">08:00 AM</span>
              <span className="text-xs font-bold text-slate-400">STAGE 1</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Initial Reminder</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lakshmi receives a fullscreen, high-contrast prompt with two clear choices: <strong>TAKEN</strong> or <strong>NOT YET</strong>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-mono font-bold">08:15 AM (+15m)</span>
              <span className="text-xs font-bold text-slate-400">STAGE 2</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Follow-Up Prompt</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If Lakshmi clicked "Not Yet" or hasn't responded, an audible follow-up re-alert is initiated to prevent oversight.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2 border-rose-300 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-mono font-bold">08:30 AM (+30m)</span>
              <span className="text-xs font-bold text-rose-600">STAGE 3 (ALERT)</span>
            </div>
            <h4 className="text-base font-bold text-rose-900 mb-2">Caregiver Alert</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Priya Caregiver receives an urgent dispatch: <em>“Lakshmi has not confirmed the 8:00 AM reminder.”</em>
            </p>
          </div>
        </div>
      </section>

      {/* 5. AI SAFETY & GEMINI ASSISTANT (Sections 5 & 6) */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30 mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Multi-Tier AI Safety Architecture</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Powered by Gemini. Constrained by Clinical Rigor.
              </h2>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Most AI healthcare apps hallucinate risky medical advice. CareAI runs an authoritative server-side classification engine <strong>before</strong> queries reach Gemini:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-teal-300 uppercase tracking-wide">SAFE_SCHEDULE_QUERY</div>
                    <div className="text-xs text-slate-300">Answered accurately using verified, live stored database schedules.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-rose-900/60 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-rose-300 uppercase tracking-wide">DOSAGE & DIAGNOSIS BLOCK</div>
                    <div className="text-xs text-slate-300">Hard-blocks requests for dosages, mg adjustments, or disease diagnoses.</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/90 border border-amber-900/60 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">EMERGENCY REDIRECTION</div>
                    <div className="text-xs text-slate-300">Chest pain or acute distress immediately triggers 108 ambulance & caregiver guidance.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Preview Simulator Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Live AI Safety Sandbox</span>
                </div>
                <span className="text-[11px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  gemini-3.8-flash
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
                  <span className="text-teal-400 font-bold">Elderly:</span> "What reminders do I have today?"
                  <div className="text-slate-400 mt-1 pl-3 border-l-2 border-teal-500/50">
                    → "Today you have 3 reminders: Morning Medicine at 08:00, Afternoon Medicine at 14:00, and Evening Medicine at 20:00."
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-rose-950/80 text-slate-300">
                  <span className="text-rose-400 font-bold">User:</span> "Can I take 2 tablets instead of 1?"
                  <div className="text-rose-300 mt-1 pl-3 border-l-2 border-rose-500">
                    → <span className="font-bold">BLOCKED:</span> "CareAI cannot provide dosage or medication-change advice. Please consult your physician."
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end">
                <button
                  onClick={() => navigate('/elderly/assistant')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Voice Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ENGLISH + TAMIL SUPPORT (Section 8) */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-teal-800 to-teal-700 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-4">
              <Languages className="w-4 h-4" />
              <span>English & Tamil Dual Interface</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              Inclusive Healthcare for Vernacular Seniors
            </h3>
            <p className="text-sm text-teal-100 leading-relaxed">
              Every critical action — from TAKEN ("சாப்பிட்டாயிற்று") to NOT YET ("இன்னும் இல்லை") and speech recognition — is fully localized so language is never a barrier to medication safety.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/elderly')}
              className="px-6 py-3.5 rounded-xl bg-white text-teal-900 font-bold text-sm hover:bg-teal-50 transition-colors text-center shadow-md"
            >
              Experience Elderly UI
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="px-6 py-3.5 rounded-xl bg-teal-900/60 hover:bg-teal-900 text-white border border-teal-500 font-bold text-sm transition-colors text-center"
            >
              Test Hackathon Flow
            </button>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA (Section 10) */}
      <section className="py-16 border-t border-slate-200 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto mb-4">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to experience smart elderly healthcare?
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Log in as Priya Caregiver or Lakshmi, or use the interactive Hackathon Demo Simulator to test the entire 30-minute escalation cycle in 10 seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="cta-try-careai-bottom"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md transition-all"
            >
              TRY CAREAI NOW
            </button>
            <button
              id="cta-view-demo-bottom"
              onClick={() => navigate('/demo')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm border border-slate-300 transition-all"
            >
              EXPLORE DEMO CENTER
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>© 2026 CareAI — Smart Elderly Healthcare Assistant. Designed for Google AI Studio Hackathon.</p>
        <p className="mt-1 text-[11px] text-slate-400">
          CareAI is a reminder and caregiver awareness platform. It is not a doctor, prescription system, or diagnostic medical device.
        </p>
      </footer>
    </div>
  );
};
