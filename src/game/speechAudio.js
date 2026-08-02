// Web Speech API helper for reading NPC text aloud to young trainers

export function speakText(text) {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel(); // Stop active speech

    // Remove emojis for cleaner TTS reading
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.88; // Slightly slower, clear speaking rate for young kids
    utterance.pitch = 1.08; // Friendly, upbeat voice pitch
    utterance.lang = 'en-US';

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
