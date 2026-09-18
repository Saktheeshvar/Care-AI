import { SafetyCategory, Language } from '../../src/types';

export interface SafetyCheckResult {
  category: SafetyCategory;
  isSafeToProceedToAI: boolean;
  directResponse?: string;
  safetyNotice?: string;
}

export function classifyUserQuery(query: string, language: Language = 'en'): SafetyCheckResult {
  const q = query.toLowerCase().trim();

  // 1. Check for Emergency or Serious Symptoms
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'can\'t breathe', 'cannot breathe', 'difficulty breathing',
    'shortness of breath', 'stroke', 'unconscious', 'fainted', 'bleeding heavily',
    'severe pain', 'overdose', 'poison', 'choking', 'paralysis', 'seizure',
    // Tamil
    'நெஞ்சு வலி', 'மூச்சு திணறல்', 'மயக்கம்', 'மாரடைப்பு', 'கடுமையான வலி',
    // Hindi
    'छाती में दर्द', 'दिल का दौरा', 'सांस लेने में तकलीफ', 'सांस फूलना', 'बेहोश', 
    'खून बहना', 'अत्यधिक दर्द', 'दौरा', 'जहर', 'गंभीर लक्षण'
  ];
  if (emergencyKeywords.some(k => q.includes(k))) {
    let directResponse = 'EMERGENCY ALERT: CareAI is not an emergency medical service. If you or Lakshmi are experiencing severe or sudden symptoms, please immediately dial emergency services (108 / 112) or call emergency caregiver Priya (+91 98400 12345).';
    if (language === 'ta') {
      directResponse = 'அவசர எச்சரிக்கை: CareAI அவசர சிகிச்சை அமைப்பு அல்ல. உடனடியாக அவசர மருத்துவ உதவிக்கு 108 / 112 அழைக்கவும் அல்லது உங்கள் அவசர தொடர்பாளர் பிரியாவை (+91 98400 12345) தொடர்பு கொள்ளவும்.';
    } else if (language === 'hi') {
      directResponse = 'आपातकालीन चेतावनी: CareAI आपातकालीन चिकित्सा सेवा नहीं है। यदि आप या वरिष्ठ नागरिक गंभीर लक्षणों का सामना कर रहे हैं, तो तुरंत आपातकालीन सेवाओं (108 / 112) पर कॉल करें या देखभालकर्ता प्रिया (+91 98400 12345) से संपर्क करें।';
    }
    
    return {
      category: 'EMERGENCY_OR_SERIOUS_SYMPTOM',
      isSafeToProceedToAI: false,
      directResponse,
      safetyNotice: 'CareAI prioritizes safety and redirects emergency symptoms immediately to healthcare providers.'
    };
  }

  // 2. Check for Dosage / Dose Change requests
  const dosageKeywords = [
    'dosage', 'dose', 'how many pills', 'how many tablets', 'how much to take',
    'mg', 'milligram', 'double dose', 'skip dose', 'increase dose', 'decrease dose',
    'take two', 'take 2', 'side effect', 'side-effects', 'can i take 3',
    // Tamil
    'அளவு', 'எத்தனை மாத்திரை', 'மருந்து அளவு', 'இரு மடங்கு',
    // Hindi
    'खुराक', 'डोज', 'कितनी गोली', 'कितनी दवाई', 'दो गोली', 'खुराक बदलना', 
    'डोज बढ़ाना', 'डबल डोज', 'साइड इफेक्ट'
  ];
  if (dosageKeywords.some(k => q.includes(k))) {
    let directResponse = 'CareAI cannot provide dosage or medication-change advice. Please consult your prescribing physician or licensed pharmacist.';
    if (language === 'ta') {
      directResponse = 'CareAI மருந்தளவு (Dosage) அல்லது மருந்து மாற்ற ஆலோசனை வழங்க முடியாது. உங்கள் மருத்துவர் அல்லது மருந்தாளரை அணுகவும்.';
    } else if (language === 'hi') {
      directResponse = 'CareAI दवा की खुराक या दवा परिवर्तन की सलाह नहीं दे सकता है। कृपया अपने चिकित्सक या अधिकृत फार्मासिस्ट से परामर्श लें।';
    }

    return {
      category: 'DOSAGE_REQUEST',
      isSafeToProceedToAI: false,
      directResponse,
      safetyNotice: 'Medication dosage modifications must always be approved by a medical professional.'
    };
  }

  // 3. Check for Medical Diagnosis requests
  const diagnosisKeywords = [
    'diagnose', 'diagnosis', 'do i have', 'am i sick', 'symptoms of', 'cure for',
    'disease', 'infection', 'diabetes test', 'cancer', 'covid', 'flu', 'treat my',
    // Tamil
    'நோய்', 'காரணம் என்ன', 'பரிசோதனை', 'சிகிச்சை',
    // Hindi
    'बीमारी', 'रोग', 'निदान', 'इलाज', 'जांच', 'क्या मुझे कोई बीमारी है', 'लक्षण क्या हैं'
  ];
  if (diagnosisKeywords.some(k => q.includes(k))) {
    let directResponse = 'CareAI cannot diagnose medical conditions. Please consult a qualified healthcare provider for proper evaluation.';
    if (language === 'ta') {
      directResponse = 'CareAI மருத்துவ நோயறிதல் (Diagnosis) செய்ய முடியாது. தயவுசெய்து தகுதியான மருத்துவரை அணுகவும்.';
    } else if (language === 'hi') {
      directResponse = 'CareAI चिकित्सीय स्थितियों का निदान नहीं कर सकता। उचित परीक्षण के लिए कृपया किसी योग्य चिकित्सक से परामर्श लें।';
    }

    return {
      category: 'DIAGNOSIS_REQUEST',
      isSafeToProceedToAI: false,
      directResponse,
      safetyNotice: 'Diagnostic claims require in-person clinical examination.'
    };
  }

  // 4. Check for Safe Schedule Queries
  const scheduleKeywords = [
    'reminder', 'schedule', 'today', 'next', 'morning', 'afternoon', 'evening',
    'confirmed', 'taken', 'what time', 'medicine', 'medicines', 'when', 'list',
    'show', 'what do i have', 'how many reminders', 'pending',
    // Tamil
    'நினைவூட்டல்', 'இன்று', 'அடுத்த மருந்து', 'அட்டவணை', 'காலை', 'மதியம்', 'இரவு',
    // Hindi
    'दवाई', 'दवा', 'याद दिलाएं', 'समय', 'सुबह', 'दोपहर', 'रात', 'आज', 'अनुसूची',
    'अगली दवा', 'सूची', 'स्थिति', 'क्या मैंने ली'
  ];
  if (scheduleKeywords.some(k => q.includes(k))) {
    return {
      category: 'SAFE_SCHEDULE_QUERY',
      isSafeToProceedToAI: true
    };
  }

  // 5. Default / Unknown query
  let directResponse = 'CareAI is your reminder and schedule assistant. You can ask: "What reminders do I have today?", "What is my next reminder?", or "Have I confirmed my morning medicine?".';
  if (language === 'ta') {
    directResponse = 'CareAI உங்கள் நினைவூட்டல் உதவியாளர். இன்றைய நினைவூட்டல்கள், அடுத்த மருந்து நேரம் அல்லது உறுதிப்படுத்தல் நிலை குறித்து நீங்கள் கேட்கலாம்.';
  } else if (language === 'hi') {
    directResponse = 'CareAI आपका दवा स्मरण और समय सारिणी सहायक है। आप पूछ सकते हैं: "आज मुझे कौन सी दवाइयाँ लेनी हैं?", "मेरी अगली दवा कौन सी है?", या "क्या मैंने सुबह की दवा ले ली है?".';
  }

  return {
    category: 'UNKNOWN',
    isSafeToProceedToAI: false,
    directResponse,
    safetyNotice: 'CareAI answers schedule-related questions from verified stored records.'
  };
}
