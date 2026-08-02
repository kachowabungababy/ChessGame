// Web Speech API helper with distinct voice profiles (Oak, Joy, Pikachu, Grunts, Kids)

export function speakText(text, speakerType = 'default') {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel(); // Stop active speech

    // Remove emojis for cleaner TTS reading
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();

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
      typeLower.includes('lass') ||
      typeLower.includes('picnicker')
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
      typeLower.includes('wattson') ||
      typeLower.includes('wallace') ||
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
    } else if (typeLower.includes('rocket') || typeLower.includes('grunt') || typeLower.includes('magma') || typeLower.includes('aqua')) {
      utterance.pitch = 0.72; // Mischievous, low villain voice
      utterance.rate = 0.95;
    } else if (typeLower.includes('timmy') || typeLower.includes('joey') || typeLower.includes('kid') || typeLower.includes('billy')) {
      utterance.pitch = 1.45; // High energetic kid voice
      utterance.rate = 0.92;
    } else {
      utterance.pitch = 1.08;
      utterance.rate = 0.88;
    }

    window.speechSynthesis.speak(utterance);
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
