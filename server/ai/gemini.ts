import { GoogleGenAI } from '@google/genai';
import { dbStore, SEED_ELDERLY } from '../data/store';
import { classifyUserQuery } from './safety';
import { AIResponse, Language } from '../../src/types';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!genAIClient) {
    try {
      genAIClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.warn('Could not initialize GoogleGenAI client:', err);
      return null;
    }
  }
  return genAIClient;
}

export async function processCareAIChat(
  query: string, 
  language: Language = 'en',
  elderlyUserId?: string
): Promise<AIResponse> {
  const timestamp = new Date().toISOString();

  // 1. Run safety classification BEFORE touching Gemini
  const safetyCheck = classifyUserQuery(query, language);

  if (!safetyCheck.isSafeToProceedToAI) {
    return {
      message: safetyCheck.directResponse || 'Safe fallback response',
      category: safetyCheck.category,
      safetyNote: safetyCheck.safetyNotice,
      timestamp
    };
  }

  // 2. Fetch verified schedule from store for the specific senior
  const seniorId = elderlyUserId || 'elderly_1';
  const seniorProfile = dbStore.getElderlyUser(seniorId) || SEED_ELDERLY;
  const seniorName = seniorProfile.name;

  const medicines = dbStore.getMedicinesFor(seniorId).filter(m => m.active);
  const reminders = dbStore.getRemindersFor(seniorId);

  const scheduleSummaryEn = medicines.map(m => {
    const rem = reminders.find(r => r.medicineId === m.id);
    const status = rem ? rem.status : 'SCHEDULED';
    return `• ${m.name} at ${m.time} (${m.frequency}) — Status: ${status}`;
  }).join('\n') || 'No active medicines scheduled for today.';

  const scheduleSummaryTa = medicines.map(m => {
    const rem = reminders.find(r => r.medicineId === m.id);
    const status = rem ? rem.status : 'திட்டமிடப்பட்டுள்ளது';
    return `• ${m.name} (${m.time}) — நிலை: ${status}`;
  }).join('\n') || 'இன்று திட்டமிடப்பட்ட மருந்துகள் ஏதுமில்லை.';

  const scheduleSummaryHi = medicines.map(m => {
    const rem = reminders.find(r => r.medicineId === m.id);
    const status = rem ? rem.status : 'निर्धारित';
    return `• ${m.name} (${m.time}) — स्थिति: ${status}`;
  }).join('\n') || 'आज के लिए कोई निर्धारित दवाइयां नहीं हैं।';

  // Next reminder calculation
  const nextReminder = reminders.find(r => r.status === 'DUE' || r.status === 'UPCOMING' || r.status === 'PENDING') || reminders[0];

  // Try calling Gemini if configured
  const ai = getGeminiClient();
  if (ai) {
    try {
      const systemInstruction = `You are CareAI, a polite, supportive, and clear reminder assistant for elderly user ${seniorName} and caregiver Priya.
Current Verified Schedule for ${seniorName}:
${scheduleSummaryEn}

Next active reminder: ${nextReminder ? `${nextReminder.medicineName} at ${nextReminder.scheduledTime} (Status: ${nextReminder.status})` : 'None'}

CRITICAL SAFETY DIRECTIVES:
- Only answer schedule, time, or reminder-related questions based STRICTLY on the verified schedule above.
- NEVER invent new medicines, dosages, medical advice, diagnoses, or condition details.
- Keep sentences short, comforting, and easily readable for seniors.
- Language directive:
  * If target language is Tamil ('ta'), write naturally in respectful Tamil.
  * If target language is Hindi ('hi'), write naturally in respectful Hindi (Devanagari script).
  * If target language is English ('en'), write in clean, encouraging English.`;

      const langLabel = language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English';
      const prompt = `User query (${langLabel} requested): "${query}"
Please provide a helpful, verified response strictly adhering to the safety instructions in ${langLabel}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2, // low temperature for high factual accuracy
        }
      });

      const text = response.text?.trim();
      if (text) {
        return {
          message: text,
          category: 'SAFE_SCHEDULE_QUERY',
          safetyNote: 'Verified schedule assistance powered by Gemini AI with real-time application data.',
          timestamp
        };
      }
    } catch (apiError) {
      console.warn('Gemini API call failed, falling back to deterministic engine:', apiError);
    }
  }

  // 3. High-Quality Deterministic Fallback (when API key absent or offline)
  const q = query.toLowerCase();
  let fallbackMessage = '';

  if (language === 'ta') {
    if (q.includes('அடுத்த') || q.includes('next')) {
      fallbackMessage = nextReminder 
        ? `${seniorName}, உங்கள் அடுத்த நினைவூட்டல் ${nextReminder.scheduledTime} மணிக்கு ${nextReminder.medicineName} (நிலை: ${nextReminder.status}).`
        : 'இன்று அடுத்து திட்டமிடப்பட்ட நினைவூட்டல்கள் எதுவும் இல்லை.';
    } else {
      fallbackMessage = `${seniorName} அவர்களுக்கான இன்றைய சரிபார்க்கப்பட்ட மருந்துகள்:\n\n${scheduleSummaryTa}\n\nஅடுத்த நினைவூட்டல்: ${nextReminder ? `${nextReminder.medicineName} (${nextReminder.scheduledTime})` : 'எதுவுமில்லை'}.`;
    }
  } else if (language === 'hi') {
    if (q.includes('अगली') || q.includes('अगला') || q.includes('next')) {
      fallbackMessage = nextReminder
        ? `नमस्ते ${seniorName}, आपकी अगली निर्धारित दवा ${nextReminder.medicineName} है जो ${nextReminder.scheduledTime} बजे ली जानी है (स्थिति: ${nextReminder.status})।`
        : 'आज के लिए कोई आगामी दवा लंबित नहीं है।';
    } else {
      fallbackMessage = `नमस्ते ${seniorName}, आज के लिए आपकी सत्यापित दवा समय-सारिणी:\n\n${scheduleSummaryHi}\n\nअगली दवा: ${nextReminder ? `${nextReminder.medicineName} (${nextReminder.scheduledTime})` : 'सभी पूर्ण'}.`;
    }
  } else {
    if (q.includes('next')) {
      fallbackMessage = nextReminder
        ? `Hello ${seniorName}, your next reminder is for ${nextReminder.medicineName} at ${nextReminder.scheduledTime} (Status: ${nextReminder.status}).`
        : 'You have no further pending reminders for today.';
    } else {
      fallbackMessage = `Hello ${seniorName}, here is your verified schedule for today:\n\n${scheduleSummaryEn}\n\nYour next reminder is ${nextReminder ? `${nextReminder.medicineName} at ${nextReminder.scheduledTime}` : 'all caught up'}.`;
    }
  }

  return {
    message: fallbackMessage,
    category: 'SAFE_SCHEDULE_QUERY',
    safetyNote: 'Schedule validated directly against verified application database records.',
    timestamp
  };
}
