// Web Audio API Synthesizer playing real 8-bit GBA Happy Birthday Song melody

export function playHappyBirthdaySong() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Notes mapping to frequencies
    const notes = {
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      F4: 349.23,
      G4: 392.00,
      A4: 440.00,
      Bb4: 466.16,
      B4: 493.88,
      C5: 523.25,
      D5: 587.33,
    };

    // Happy Birthday Melody Sequence: [note, durationInBeats]
    const melody = [
      ['C4', 0.75], ['C4', 0.25], ['D4', 1.0], ['C4', 1.0], ['F4', 1.0], ['E4', 2.0],
      ['C4', 0.75], ['C4', 0.25], ['D4', 1.0], ['C4', 1.0], ['G4', 1.0], ['F4', 2.0],
      ['C4', 0.75], ['C4', 0.25], ['C5', 1.0], ['A4', 1.0], ['F4', 1.0], ['E4', 1.0], ['D4', 2.0],
      ['Bb4', 0.75], ['Bb4', 0.25], ['A4', 1.0], ['F4', 1.0], ['G4', 1.0], ['F4', 2.5],
    ];

    let startTime = ctx.currentTime + 0.1;
    const tempo = 0.45; // seconds per beat

    melody.forEach(([noteName, beats]) => {
      const freq = notes[noteName];
      if (freq) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle'; // Retro game triangle synth
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + beats * tempo - 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + beats * tempo);
      }
      startTime += beats * tempo;
    });
  } catch (e) {
    console.error('Birthday song synth error:', e);
  }
}
