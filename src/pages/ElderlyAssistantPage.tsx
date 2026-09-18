import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  User,
  RefreshCw,
  Languages
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { AIMessage, Language } from '../types';

interface ElderlyAssistantPageProps {
  navigate: (path: string) => void;
  userType?: 'elderly' | 'caregiver';
}

export const ElderlyAssistantPage: React.FC<ElderlyAssistantPageProps> = ({ 
  navigate,
  userType = 'elderly'
}) => {
  const { language, setLanguage, t } = useLanguage();

  const getWelcomeMessage = (lang: Language): string => {
    if (lang === 'ta') {
      return 'வணக்கம் லட்சுமி அம்மா! நான் CareAI. உங்கள் இன்றைய மருந்து நினைவூட்டல்கள் மற்றும் அட்டவணை பற்றி என்னிடம் கேட்கலாம்.';
    }
    if (lang === 'hi') {
      return 'नमस्ते लक्ष्मी जी! मैं CareAI हूँ। आप मुझसे अपनी दवाइयों के समय और आज के शेड्यूल के बारे में पूछ सकते हैं।';
    }
    return 'Hello Lakshmi! I am your CareAI reminder assistant. You can ask me about your schedule, upcoming reminders, or check whether your morning dose has been recorded.';
  };

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome_1',
      userId: 'user_elderly_1',
      role: 'assistant',
      content: getWelcomeMessage(language),
      category: 'SAFE_SCHEDULE_QUERY',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceState, setVoiceState] = useState<'IDLE' | 'LISTENING' | 'SPEAKING' | 'ERROR'>('IDLE');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // When language changes, update initial assistant message if only welcome message exists
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome_1') {
        return [{
          ...prev[0],
          content: getWelcomeMessage(language)
        }];
      }
      return prev;
    });
  }, [language]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Suggested questions in all 3 languages
  const getSuggestedQuestions = (lang: Language): string[] => {
    if (lang === 'ta') {
      return [
        'இன்று எனக்கு என்ன நினைவூட்டல்கள் உள்ளன?',
        'எனது அடுத்த மருந்து நேரம் என்ன?',
        'காலை மருந்தை நான் உறுதிப்படுத்தினேனா?',
        'மருந்தின் அளவை 2 ஆக மாற்றலாமா? (பாதுகாப்பு சோதனை)'
      ];
    }
    if (lang === 'hi') {
      return [
        'आज मुझे कौन सी दवाइयाँ लेनी हैं?',
        'मेरी अगली दवा का समय क्या है?',
        'क्या मेरी सुबह की दवा दर्ज हो गई है?',
        'क्या मैं खुराक 2 गोली कर सकता हूँ? (सुरक्षा जांच)'
      ];
    }
    return [
      'What reminders do I have today?',
      'What is my next reminder?',
      'Have I confirmed my morning reminder?',
      'Can I increase my dosage? (Safety Test)'
    ];
  };

  const suggestedQuestions = getSuggestedQuestions(language);

  // Speech Synthesis Helper
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setVoiceState('SPEAKING');
      utterance.onend = () => setVoiceState('IDLE');
      utterance.onerror = () => setVoiceState('IDLE');
      window.speechSynthesis.speak(utterance);
    } catch {
      setVoiceState('IDLE');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoiceState('IDLE');
    }
  };

  // Browser Speech Recognition
  const toggleVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice input is not available in this browser. You can use text instead.');
      return;
    }

    if (voiceState === 'LISTENING') {
      recognitionRef.current?.stop();
      setVoiceState('IDLE');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setVoiceState('LISTENING');
        setVoiceNotice(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setVoiceState('IDLE');
        if (event.error === 'not-allowed') {
          setVoiceNotice('Microphone permission was denied. Please allow microphone access to speak.');
        } else {
          setVoiceNotice('Could not recognize voice. Please try again or type below.');
        }
      };

      recognition.onend = () => {
        setVoiceState('IDLE');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn(err);
      setVoiceNotice('Voice input is not available in this browser. You can use text instead.');
      setVoiceState('IDLE');
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isProcessing) return;

    setInputText('');
    const userMsg: AIMessage = {
      id: `msg_${Date.now()}`,
      userId: 'user_elderly_1',
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const res = await api.sendAIChat(query, language);
      const assistantMsg: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        userId: 'user_elderly_1',
        role: 'assistant',
        content: res.message,
        category: res.category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Speak answer automatically for senior accessibility
      speakText(res.message);
    } catch (err: any) {
      const fallbackContent = language === 'ta'
        ? 'மன்னிக்கவும், தற்போது அட்டவணை விவரங்களை பெற முடியவில்லை. தயவுசெய்து உங்கள் முகப்புப் பக்கத்தைப் பார்க்கவும்.'
        : language === 'hi'
        ? 'क्षमा करें, इस समय शेड्यूल डेटा प्राप्त नहीं हो सका। कृपया अपने डैशबोर्ड पर देखें।'
        : 'I apologize, but I could not access the schedule data right now. Please view your dashboard to see active reminders.';

      const errorMsg: AIMessage = {
        id: `msg_${Date.now() + 1}`,
        userId: 'user_elderly_1',
        role: 'assistant',
        content: fallbackContent,
        category: 'UNKNOWN',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="elderly-assistant-root" className="min-h-screen bg-slate-100 flex flex-col pb-8 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col space-y-4">
        
        {/* Top Header */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(userType === 'caregiver' ? '/caregiver' : '/elderly')}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-tight">
                  {t('ai.title')}
                </h1>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {t('ai.assistantSub')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {voiceState === 'SPEAKING' && (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1 animate-pulse"
              >
                <VolumeX className="w-4 h-4" />
                <span>{t('ai.muteVoice')}</span>
              </button>
            )}

            {/* Language Switcher supporting English, Tamil, Hindi */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  language === 'en' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  language === 'ta' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  language === 'hi' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-teal-900">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <span>
            {t('ai.safetyConstraint')}
          </span>
        </div>

        {voiceNotice && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <span>{voiceNotice}</span>
            <button onClick={() => setVoiceNotice(null)} className="text-amber-700 font-bold ml-2">Dismiss</button>
          </div>
        )}

        {/* Chat History Container */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 overflow-y-auto max-h-[55vh] space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isBlockedCategory = msg.category && msg.category !== 'SAFE_SCHEDULE_QUERY';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-sm font-medium ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : isBlockedCategory
                      ? 'bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-tl-none'
                      : 'bg-slate-100 text-slate-900 rounded-tl-none'
                  }`}
                >
                  {isBlockedCategory && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t('ai.safetyBoundaryEnforced')}: {msg.category}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-line leading-relaxed text-base sm:text-lg">
                    {msg.content}
                  </div>

                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 ml-2"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t('ai.speak')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex gap-3 items-center text-sm text-slate-500 font-semibold p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>{t('ai.verifying')}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Grid */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            {t('ai.suggestedTitle')}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:border-teal-400 transition-colors disabled:opacity-50 text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Voice Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 sm:p-3 shadow-md flex items-center gap-2">
          {/* Big Voice Microphone Button */}
          <button
            id="assistant-voice-mic-btn"
            type="button"
            onClick={toggleVoiceListening}
            className={`p-4 rounded-xl font-bold flex items-center justify-center transition-all ${
              voiceState === 'LISTENING'
                ? 'bg-rose-600 text-white animate-pulse shadow-md'
                : 'bg-teal-700 hover:bg-teal-800 text-white'
            }`}
            title="Press to talk in English, Tamil, or Hindi"
            aria-label="Toggle voice listening"
          >
            {voiceState === 'LISTENING' ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {/* Text Input */}
          <input
            id="assistant-query-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              voiceState === 'LISTENING'
                ? t('ai.listening')
                : t('ai.placeholder')
            }
            className="flex-1 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none rounded-xl"
            disabled={isProcessing}
          />

          {/* Send Button */}
          <button
            id="assistant-send-btn"
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isProcessing}
            className="p-3.5 rounded-xl bg-slate-900 hover:bg-black text-white transition-colors disabled:opacity-40"
            aria-label="Send query"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
