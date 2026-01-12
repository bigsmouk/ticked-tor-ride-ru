// Game sound effects using Web Audio API

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

// Train whistle / route claim sound
export const playRouteClaimSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Create oscillators for a train-like whistle
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Connect nodes
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Set frequencies for a pleasant chord
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
    osc2.frequency.setValueAtTime(392, now); // G4
    osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.1); // C5
    
    // Waveform
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    // Start and stop
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Card draw sound
export const playCardDrawSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    osc.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Success / destination complete sound
export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      osc.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now + i * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.35);
    });
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Turn notification sound - plays when it's your turn
export const playTurnNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Two quick ascending notes
    const notes = [587.33, 880]; // D5, A5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      osc.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now + i * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.12, now + i * 0.15 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2);
      
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.25);
    });
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Player joined sound - welcoming chime (ascending)
export const playPlayerJoinSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Ascending welcoming notes
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5 (A major chord arpeggio)
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      osc.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now + i * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.1, now + i * 0.08 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.25);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Player left sound - descending notification
export const playPlayerLeaveSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Descending notes (minor feel)
    const notes = [523.25, 392, 329.63]; // C5, G4, E4 (descending)
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      osc.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, now + i * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    });
  } catch (e) {
    console.log('Audio not available:', e);
  }
};
