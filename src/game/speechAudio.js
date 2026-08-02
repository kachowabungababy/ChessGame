// Web Speech API helper with distinct voice profiles (Oak, Joy, Pikachu, Grunts, Kids)

let voicesLoaded = false;
let voicesCache = [];

function ensureVoices() {
  if (voicesLoaded && voicesCache.length > 0) return voicesCache;
  if (!('speechSynthesis' in window)) return [];
  voicesCache = window.speechSynthesis.getVoices();
  if (voicesCache.length > 0) voicesLoaded = true;
  return voicesCache;
}

// Pre-load voices as soon as possible
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    voicesCache = window.speechSynthesis.getVoices();
    voicesLoaded = true;
  };
  // Trigger initial load
  ensureVoices();
}

export function speakText(text, speakerType = 'default') {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    // Remove emojis for cleaner TTS reading
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}]/gu, '')
      .replace(/"/g, '')
      .trim();

    if (!cleanText) return;

    // Cancel any existing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.volume = 1.0;

    const voices = ensureVoices();
    const typeLower = (speakerType || '').toLowerCase();

    // Voice Pitch, Speed & Gender variations based on character persona
    if (typeLower.includes('pikachu') || typeLower.includes('pichu')) {
      utterance.pitch = 1.65; // Ultra cheerful, high pitch
      utterance.rate = 1.0;
    } else if (
      typeLower.includes('joy') ||
      typeLower.includes('misty') ||
      typeLower.includes('cynthia') ||
      typeLower.includes('marina') ||
      typeLower.includes('female') ||
      typeLower.includes('lady') ||
      typeLower.includes('mom') ||
      typeLower.includes('lass')
    ) {
      utterance.pitch = 1.35; // Gentle, warm female voice
      utterance.rate = 0.9;
      if (voices.length > 0) {
        const femaleVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Female') ||
              v.name.includes('Samantha') ||
              v.name.includes('Victoria') ||
              v.name.includes('Zira') ||
              v.name.includes('Karen'))
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      }
    } else if (
      typeLower.includes('oak') ||
      typeLower.includes('brock') ||
      typeLower.includes('lance') ||
      typeLower.includes('birch') ||
      typeLower.includes('male')
    ) {
      utterance.pitch = 0.85; // Deep, mentor male voice
      utterance.rate = 0.88;
      if (voices.length > 0) {
        const maleVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Male') ||
              v.name.includes('Alex') ||
              v.name.includes('Daniel') ||
              v.name.includes('David') ||
              v.name.includes('George'))
        );
        if (maleVoice) utterance.voice = maleVoice;
      }
    } else if (typeLower.includes('rocket') || typeLower.includes('grunt')) {
      utterance.pitch = 0.72; // Mischievous, low villain voice
      utterance.rate = 0.95;
    } else {
      utterance.pitch = 1.05;
      utterance.rate = 0.9;
    }

    // Chrome requires a longer delay after cancel() before speak() works
    setTimeout(() => {
      // Resume in case Chrome paused the synthesis
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);

      // Chrome bug workaround: speech can pause after ~15s, keep resuming
      const resumeInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(resumeInterval);
          return;
        }
        window.speechSynthesis.resume();
      }, 5000);

      utterance.onend = () => clearInterval(resumeInterval);
      utterance.onerror = () => clearInterval(resumeInterval);
    }, 150);
  } catch (e) {
    console.error('Web Speech API error:', e);
  }
}

export function stopSpeech() {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // ignore
  }
}
