// Web Audio API Synthesizer playing the iconic 8-bit GBA Littleroot Town Theme from Pokémon Ruby/Sapphire/Emerald

// This module holds live singleton state (an AudioContext + a "should I keep looping"
// flag). Vite's HMR hot-swaps modules in place by default, which would leave the OLD
// loop running against OLD state while a second, independent copy of this module's
// singletons spins up — i.e. two overlapping music loops. Force a full page reload
// instead of a hot-patch whenever this file changes.
if (import.meta.hot) {
  import.meta.hot.decline();
}

let ctx = null;
let activeOscillators = [];
let isThemePlaying = false;
let stopRequested = false;

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) ctx = new AudioCtx();
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function playLittlerootTownTheme() {
  if (isThemePlaying) return;
  try {
    const audioCtx = getCtx();
    if (!audioCtx) return;
    isThemePlaying = true;
    stopRequested = false;

    // Frequencies mapping for Littleroot Town melody notes (D Major / G Major key)
    const notes = {
      D4: 293.66, E4: 329.63, Fs4: 369.99, G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880.00
    };

    // Iconic Littleroot Town Opening & Main Melody Phrase
    const melody = [
      ['D4', 0.5], ['Fs4', 0.5], ['A4', 1.0], ['D5', 1.0], ['Cs5', 0.5], ['B4', 0.5], ['A4', 1.5],
      ['G4', 0.5], ['Fs4', 0.5], ['E4', 1.0], ['A4', 1.0], ['G4', 0.5], ['Fs4', 0.5], ['E4', 1.5],
      ['D4', 0.5], ['Fs4', 0.5], ['A4', 1.0], ['D5', 1.0], ['Fs5', 1.0], ['E5', 0.5], ['D5', 1.5],
      ['B4', 0.5], ['Cs5', 0.5], ['D5', 1.0], ['A4', 1.0], ['Fs4', 0.5], ['E4', 0.5], ['D4', 2.0],
    ];

    let startTime = audioCtx.currentTime + 0.1;
    const tempo = 0.42; // Peaceful GBA tempo

    melody.forEach(([noteName, beats]) => {
      const freq = notes[noteName];
      if (freq) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // GBA Warm Sine/Triangle Chiptune Lead
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + beats * tempo - 0.04);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + beats * tempo);

        activeOscillators.push(osc);
      }
      startTime += beats * tempo;
    });

    // Loop Theme — keep replaying until stopLittlerootTownTheme() is called
    const totalDuration = startTime - audioCtx.currentTime;
    setTimeout(() => {
      isThemePlaying = false;
      activeOscillators = [];
      if (!stopRequested) playLittlerootTownTheme();
    }, totalDuration * 1000);

  } catch (e) {
    console.error('Littleroot theme synth error:', e);
  }
}

export function stopLittlerootTownTheme() {
  stopRequested = true;
  isThemePlaying = false;
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch (e) {
      // ignore
    }
  });
  activeOscillators = [];
}
