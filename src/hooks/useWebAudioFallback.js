/**
 * Web Audio API fallback for generating ambient sounds
 * Creates more realistic and distinct ambient soundscapes
 */

const soundInstances = {};

// Create a noise buffer with specified characteristics
function createNoiseBuffer(audioContext, type = 'white') {
  const bufferSize = 4 * audioContext.sampleRate;
  const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const output = buffer.getChannelData(channel);

    if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
  }

  return buffer;
}

// Rain: Layered filtered noise with high-frequency droplets
function createRain(audioContext) {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Base rain layer - brown noise, low-mid frequencies
  const baseNoise = audioContext.createBufferSource();
  baseNoise.buffer = createNoiseBuffer(audioContext, 'brown');
  baseNoise.loop = true;

  const baseLowpass = audioContext.createBiquadFilter();
  baseLowpass.type = 'lowpass';
  baseLowpass.frequency.value = 1000;
  baseLowpass.Q.value = 0.5;

  const baseGain = audioContext.createGain();
  baseGain.gain.value = 0.4;

  baseNoise.connect(baseLowpass);
  baseLowpass.connect(baseGain);
  baseGain.connect(masterGain);

  // High frequency droplet layer
  const dropletNoise = audioContext.createBufferSource();
  dropletNoise.buffer = createNoiseBuffer(audioContext, 'white');
  dropletNoise.loop = true;

  const dropletHighpass = audioContext.createBiquadFilter();
  dropletHighpass.type = 'highpass';
  dropletHighpass.frequency.value = 4000;

  const dropletLowpass = audioContext.createBiquadFilter();
  dropletLowpass.type = 'lowpass';
  dropletLowpass.frequency.value = 8000;

  const dropletGain = audioContext.createGain();
  dropletGain.gain.value = 0.15;

  // Modulate droplets for variation
  const dropletLFO = audioContext.createOscillator();
  dropletLFO.frequency.value = 0.3;
  const dropletLFOGain = audioContext.createGain();
  dropletLFOGain.gain.value = 0.05;
  dropletLFO.connect(dropletLFOGain);
  dropletLFOGain.connect(dropletGain.gain);

  dropletNoise.connect(dropletHighpass);
  dropletHighpass.connect(dropletLowpass);
  dropletLowpass.connect(dropletGain);
  dropletGain.connect(masterGain);

  masterGain.connect(audioContext.destination);

  baseNoise.start();
  dropletNoise.start();
  dropletLFO.start();

  return { masterGain, baseVolume: 0.5 };
}

// Thunder: Deep rumbling with slow modulation
function createThunder(audioContext) {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Deep rumble
  const rumbleNoise = audioContext.createBufferSource();
  rumbleNoise.buffer = createNoiseBuffer(audioContext, 'brown');
  rumbleNoise.loop = true;

  const rumbleLowpass = audioContext.createBiquadFilter();
  rumbleLowpass.type = 'lowpass';
  rumbleLowpass.frequency.value = 150;
  rumbleLowpass.Q.value = 1;

  const rumbleGain = audioContext.createGain();
  rumbleGain.gain.value = 0.6;

  // Slow modulation for rolling thunder effect
  const lfo = audioContext.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08;
  const lfoGain = audioContext.createGain();
  lfoGain.gain.value = 0.3;
  lfo.connect(lfoGain);
  lfoGain.connect(rumbleGain.gain);

  // Second LFO for more complexity
  const lfo2 = audioContext.createOscillator();
  lfo2.type = 'sine';
  lfo2.frequency.value = 0.03;
  const lfo2Gain = audioContext.createGain();
  lfo2Gain.gain.value = 0.2;
  lfo2.connect(lfo2Gain);
  lfo2Gain.connect(rumbleGain.gain);

  rumbleNoise.connect(rumbleLowpass);
  rumbleLowpass.connect(rumbleGain);
  rumbleGain.connect(masterGain);
  masterGain.connect(audioContext.destination);

  rumbleNoise.start();
  lfo.start();
  lfo2.start();

  return { masterGain, baseVolume: 0.45 };
}

// Fire: Crackling with random amplitude pops
function createFire(audioContext) {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Base crackle - filtered noise
  const crackleNoise = audioContext.createBufferSource();
  crackleNoise.buffer = createNoiseBuffer(audioContext, 'white');
  crackleNoise.loop = true;

  // Bandpass for crackle character
  const bandpass = audioContext.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 2000;
  bandpass.Q.value = 0.8;

  const crackleGain = audioContext.createGain();
  crackleGain.gain.value = 0.2;

  // Low rumble for body
  const rumbleNoise = audioContext.createBufferSource();
  rumbleNoise.buffer = createNoiseBuffer(audioContext, 'brown');
  rumbleNoise.loop = true;

  const rumbleLowpass = audioContext.createBiquadFilter();
  rumbleLowpass.type = 'lowpass';
  rumbleLowpass.frequency.value = 300;

  const rumbleGain = audioContext.createGain();
  rumbleGain.gain.value = 0.25;

  // Random modulation for crackling effect
  const mod1 = audioContext.createOscillator();
  mod1.type = 'sawtooth';
  mod1.frequency.value = 3;
  const mod1Gain = audioContext.createGain();
  mod1Gain.gain.value = 0.15;
  mod1.connect(mod1Gain);
  mod1Gain.connect(crackleGain.gain);

  const mod2 = audioContext.createOscillator();
  mod2.type = 'square';
  mod2.frequency.value = 7;
  const mod2Gain = audioContext.createGain();
  mod2Gain.gain.value = 0.08;
  mod2.connect(mod2Gain);
  mod2Gain.connect(crackleGain.gain);

  crackleNoise.connect(bandpass);
  bandpass.connect(crackleGain);
  crackleGain.connect(masterGain);

  rumbleNoise.connect(rumbleLowpass);
  rumbleLowpass.connect(rumbleGain);
  rumbleGain.connect(masterGain);

  masterGain.connect(audioContext.destination);

  crackleNoise.start();
  rumbleNoise.start();
  mod1.start();
  mod2.start();

  return { masterGain, baseVolume: 0.5 };
}

// Forest: Layered nature sounds with bird-like chirps
function createForest(audioContext) {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Ambient rustling - pink noise, filtered
  const rustleNoise = audioContext.createBufferSource();
  rustleNoise.buffer = createNoiseBuffer(audioContext, 'pink');
  rustleNoise.loop = true;

  const rustleFilter = audioContext.createBiquadFilter();
  rustleFilter.type = 'bandpass';
  rustleFilter.frequency.value = 3000;
  rustleFilter.Q.value = 0.3;

  const rustleGain = audioContext.createGain();
  rustleGain.gain.value = 0.15;

  // Gentle LFO for wind in trees
  const windLFO = audioContext.createOscillator();
  windLFO.frequency.value = 0.15;
  const windLFOGain = audioContext.createGain();
  windLFOGain.gain.value = 0.08;
  windLFO.connect(windLFOGain);
  windLFOGain.connect(rustleGain.gain);

  // Bird chirp simulation using oscillators
  const birdOsc1 = audioContext.createOscillator();
  birdOsc1.type = 'sine';
  birdOsc1.frequency.value = 2800;

  const birdOsc2 = audioContext.createOscillator();
  birdOsc2.type = 'sine';
  birdOsc2.frequency.value = 3200;

  const birdGain = audioContext.createGain();
  birdGain.gain.value = 0.03;

  // Modulate bird frequency for chirp effect
  const birdMod = audioContext.createOscillator();
  birdMod.frequency.value = 5;
  const birdModGain = audioContext.createGain();
  birdModGain.gain.value = 200;
  birdMod.connect(birdModGain);
  birdModGain.connect(birdOsc1.frequency);
  birdModGain.connect(birdOsc2.frequency);

  // Amplitude modulation for intermittent chirps
  const chirpMod = audioContext.createOscillator();
  chirpMod.type = 'square';
  chirpMod.frequency.value = 0.5;
  const chirpModGain = audioContext.createGain();
  chirpModGain.gain.value = 0.03;
  chirpMod.connect(chirpModGain);
  chirpModGain.connect(birdGain.gain);

  rustleNoise.connect(rustleFilter);
  rustleFilter.connect(rustleGain);
  rustleGain.connect(masterGain);

  birdOsc1.connect(birdGain);
  birdOsc2.connect(birdGain);
  birdGain.connect(masterGain);

  masterGain.connect(audioContext.destination);

  rustleNoise.start();
  windLFO.start();
  birdOsc1.start();
  birdOsc2.start();
  birdMod.start();
  chirpMod.start();

  return { masterGain, baseVolume: 0.4 };
}

// Waves: Rhythmic ocean swells
function createWaves(audioContext) {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Main wave noise
  const waveNoise = audioContext.createBufferSource();
  waveNoise.buffer = createNoiseBuffer(audioContext, 'pink');
  waveNoise.loop = true;

  const waveLowpass = audioContext.createBiquadFilter();
  waveLowpass.type = 'lowpass';
  waveLowpass.frequency.value = 600;
  waveLowpass.Q.value = 0.7;

  const waveGain = audioContext.createGain();
  waveGain.gain.value = 0.3;

  // Slow swell modulation
  const swellLFO = audioContext.createOscillator();
  swellLFO.type = 'sine';
  swellLFO.frequency.value = 0.08; // ~7.5 second cycle
  const swellGain = audioContext.createGain();
  swellGain.gain.value = 0.25;
  swellLFO.connect(swellGain);
  swellGain.connect(waveGain.gain);

  // Secondary faster rhythm
  const rhythmLFO = audioContext.createOscillator();
  rhythmLFO.type = 'sine';
  rhythmLFO.frequency.value = 0.15;
  const rhythmGain = audioContext.createGain();
  rhythmGain.gain.value = 0.1;
  rhythmLFO.connect(rhythmGain);
  rhythmGain.connect(waveGain.gain);

  // High frequency foam/spray
  const foamNoise = audioContext.createBufferSource();
  foamNoise.buffer = createNoiseBuffer(audioContext, 'white');
  foamNoise.loop = true;

  const foamHighpass = audioContext.createBiquadFilter();
  foamHighpass.type = 'highpass';
  foamHighpass.frequency.value = 3000;

  const foamGain = audioContext.createGain();
  foamGain.gain.value = 0.05;

  // Modulate foam with wave swell
  const foamMod = audioContext.createGain();
  foamMod.gain.value = 0.05;
  swellLFO.connect(foamMod);
  foamMod.connect(foamGain.gain);

  waveNoise.connect(waveLowpass);
  waveLowpass.connect(waveGain);
  waveGain.connect(masterGain);

  foamNoise.connect(foamHighpass);
  foamHighpass.connect(foamGain);
  foamGain.connect(masterGain);

  masterGain.connect(audioContext.destination);

  waveNoise.start();
  foamNoise.start();
  swellLFO.start();
  rhythmLFO.start();

  return { masterGain, baseVolume: 0.5 };
}

// Cafe: Murmured voices and ambient chatter
function createCafe(audioContext) {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Voice-like murmur - bandpass filtered noise
  const voiceNoise = audioContext.createBufferSource();
  voiceNoise.buffer = createNoiseBuffer(audioContext, 'pink');
  voiceNoise.loop = true;

  // Multiple bandpass filters for voice formants
  const formant1 = audioContext.createBiquadFilter();
  formant1.type = 'bandpass';
  formant1.frequency.value = 500;
  formant1.Q.value = 2;

  const formant2 = audioContext.createBiquadFilter();
  formant2.type = 'bandpass';
  formant2.frequency.value = 1500;
  formant2.Q.value = 2;

  const formant3 = audioContext.createBiquadFilter();
  formant3.type = 'bandpass';
  formant3.frequency.value = 2500;
  formant3.Q.value = 2;

  const voice1Gain = audioContext.createGain();
  voice1Gain.gain.value = 0.15;
  const voice2Gain = audioContext.createGain();
  voice2Gain.gain.value = 0.1;
  const voice3Gain = audioContext.createGain();
  voice3Gain.gain.value = 0.05;

  // Modulation for speech-like rhythm
  const speechMod = audioContext.createOscillator();
  speechMod.type = 'sine';
  speechMod.frequency.value = 3;
  const speechModGain = audioContext.createGain();
  speechModGain.gain.value = 0.08;
  speechMod.connect(speechModGain);
  speechModGain.connect(voice1Gain.gain);

  // Second voice layer with different rhythm
  const voiceNoise2 = audioContext.createBufferSource();
  voiceNoise2.buffer = createNoiseBuffer(audioContext, 'pink');
  voiceNoise2.loop = true;

  const formant4 = audioContext.createBiquadFilter();
  formant4.type = 'bandpass';
  formant4.frequency.value = 800;
  formant4.Q.value = 1.5;

  const voice4Gain = audioContext.createGain();
  voice4Gain.gain.value = 0.1;

  const speechMod2 = audioContext.createOscillator();
  speechMod2.type = 'sine';
  speechMod2.frequency.value = 2.3;
  const speechMod2Gain = audioContext.createGain();
  speechMod2Gain.gain.value = 0.06;
  speechMod2.connect(speechMod2Gain);
  speechMod2Gain.connect(voice4Gain.gain);

  // Ambient room tone
  const roomNoise = audioContext.createBufferSource();
  roomNoise.buffer = createNoiseBuffer(audioContext, 'brown');
  roomNoise.loop = true;

  const roomFilter = audioContext.createBiquadFilter();
  roomFilter.type = 'lowpass';
  roomFilter.frequency.value = 400;

  const roomGain = audioContext.createGain();
  roomGain.gain.value = 0.08;

  voiceNoise.connect(formant1);
  voiceNoise.connect(formant2);
  voiceNoise.connect(formant3);
  formant1.connect(voice1Gain);
  formant2.connect(voice2Gain);
  formant3.connect(voice3Gain);
  voice1Gain.connect(masterGain);
  voice2Gain.connect(masterGain);
  voice3Gain.connect(masterGain);

  voiceNoise2.connect(formant4);
  formant4.connect(voice4Gain);
  voice4Gain.connect(masterGain);

  roomNoise.connect(roomFilter);
  roomFilter.connect(roomGain);
  roomGain.connect(masterGain);

  masterGain.connect(audioContext.destination);

  voiceNoise.start();
  voiceNoise2.start();
  roomNoise.start();
  speechMod.start();
  speechMod2.start();

  return { masterGain, baseVolume: 0.4 };
}

// Wind: Howling with slow modulation
function createWind(audioContext) {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Main wind body
  const windNoise = audioContext.createBufferSource();
  windNoise.buffer = createNoiseBuffer(audioContext, 'pink');
  windNoise.loop = true;

  const windFilter = audioContext.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 400;
  windFilter.Q.value = 0.5;

  const windGain = audioContext.createGain();
  windGain.gain.value = 0.35;

  // Slow howling modulation
  const howlLFO = audioContext.createOscillator();
  howlLFO.type = 'sine';
  howlLFO.frequency.value = 0.05;
  const howlGain = audioContext.createGain();
  howlGain.gain.value = 0.2;
  howlLFO.connect(howlGain);
  howlGain.connect(windGain.gain);

  // Modulate filter frequency for howling effect
  const filterLFO = audioContext.createOscillator();
  filterLFO.frequency.value = 0.07;
  const filterLFOGain = audioContext.createGain();
  filterLFOGain.gain.value = 200;
  filterLFO.connect(filterLFOGain);
  filterLFOGain.connect(windFilter.frequency);

  // Higher whistling layer
  const whistleNoise = audioContext.createBufferSource();
  whistleNoise.buffer = createNoiseBuffer(audioContext, 'white');
  whistleNoise.loop = true;

  const whistleFilter = audioContext.createBiquadFilter();
  whistleFilter.type = 'bandpass';
  whistleFilter.frequency.value = 2000;
  whistleFilter.Q.value = 3;

  const whistleGain = audioContext.createGain();
  whistleGain.gain.value = 0.04;

  // Modulate whistle
  const whistleLFO = audioContext.createOscillator();
  whistleLFO.frequency.value = 0.1;
  const whistleLFOGain = audioContext.createGain();
  whistleLFOGain.gain.value = 500;
  whistleLFO.connect(whistleLFOGain);
  whistleLFOGain.connect(whistleFilter.frequency);

  windNoise.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(masterGain);

  whistleNoise.connect(whistleFilter);
  whistleFilter.connect(whistleGain);
  whistleGain.connect(masterGain);

  masterGain.connect(audioContext.destination);

  windNoise.start();
  whistleNoise.start();
  howlLFO.start();
  filterLFO.start();
  whistleLFO.start();

  return { masterGain, baseVolume: 0.45 };
}

// Night: Crickets and ambient darkness
function createNight(audioContext) {
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  // Cricket chirps using oscillators
  function createCricket(freq, rate) {
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = audioContext.createGain();
    gain.gain.value = 0;

    // Chirp envelope
    const chirpRate = audioContext.createOscillator();
    chirpRate.type = 'square';
    chirpRate.frequency.value = rate;

    const chirpGain = audioContext.createGain();
    chirpGain.gain.value = 0.02;

    chirpRate.connect(chirpGain);
    chirpGain.connect(gain.gain);

    osc.connect(gain);
    osc.start();
    chirpRate.start();

    return gain;
  }

  // Multiple crickets at different frequencies
  const cricket1 = createCricket(4200, 12);
  const cricket2 = createCricket(4800, 10);
  const cricket3 = createCricket(3800, 14);

  cricket1.connect(masterGain);
  cricket2.connect(masterGain);
  cricket3.connect(masterGain);

  // Ambient night air
  const ambientNoise = audioContext.createBufferSource();
  ambientNoise.buffer = createNoiseBuffer(audioContext, 'brown');
  ambientNoise.loop = true;

  const ambientFilter = audioContext.createBiquadFilter();
  ambientFilter.type = 'lowpass';
  ambientFilter.frequency.value = 200;

  const ambientGain = audioContext.createGain();
  ambientGain.gain.value = 0.1;

  // Gentle modulation
  const ambientLFO = audioContext.createOscillator();
  ambientLFO.frequency.value = 0.03;
  const ambientLFOGain = audioContext.createGain();
  ambientLFOGain.gain.value = 0.05;
  ambientLFO.connect(ambientLFOGain);
  ambientLFOGain.connect(ambientGain.gain);

  ambientNoise.connect(ambientFilter);
  ambientFilter.connect(ambientGain);
  ambientGain.connect(masterGain);

  masterGain.connect(audioContext.destination);

  ambientNoise.start();
  ambientLFO.start();

  return { masterGain, baseVolume: 0.35 };
}

const soundCreators = {
  rain: createRain,
  thunder: createThunder,
  fire: createFire,
  forest: createForest,
  waves: createWaves,
  cafe: createCafe,
  wind: createWind,
  night: createNight,
};

export function createFallbackSound(id) {
  const creator = soundCreators[id];
  if (!creator) return null;

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const { masterGain, baseVolume } = creator(audioContext);

  soundInstances[id] = { audioContext, masterGain, baseVolume };

  return {
    play: () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      masterGain.gain.linearRampToValueAtTime(baseVolume, audioContext.currentTime + 0.8);
    },
    pause: () => {
      masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    },
    setVolume: (volume) => {
      masterGain.gain.linearRampToValueAtTime(
        baseVolume * (volume / 100),
        audioContext.currentTime + 0.1
      );
    },
    stop: () => {
      audioContext.close();
      delete soundInstances[id];
    },
  };
}

export function cleanupAllFallbackSounds() {
  Object.keys(soundInstances).forEach(id => {
    try {
      if (soundInstances[id]?.audioContext) {
        soundInstances[id].audioContext.close();
      }
    } catch {
      // Ignore cleanup errors
    }
  });
}
