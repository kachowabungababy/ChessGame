// Web Audio API Synthesizer playing the iconic 8-bit GBA Littleroot Town Theme from Pokémon Ruby/Sapphire/Emerald

let activeOscillators = [];
let isThemePlaying = false;

export function playLittlerootTownTheme() {
  if (isThemePlaying) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    isThemePlaying = true;

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

    let startTime = ctx.currentTime + 0.1;
    const tempo = 0.42; // Peaceful GBA tempo

    melody.forEach(([noteName, beats]) => {
      const freq = notes[noteName];
      if (freq) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // GBA Warm Sine/Triangle Chiptune Lead
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + beats * tempo - 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + beats * tempo);

        activeOscillators.push(osc);
      }
      startTime += beats * tempo;
    });

    // Loop Theme
    const totalDuration = startTime - ctx.currentTime;
    setTimeout(() => {
      isThemePlaying = false;
      if (isThemePlaying) playLittlerootTownTheme();
    }, totalDuration * 1000);

  } catch (e) {
    console.error('Littleroot theme synth error:', e);
  }
}

export function stopLittlerootTownTheme() {
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
