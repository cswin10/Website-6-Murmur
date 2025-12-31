/**
 * Web Audio API fallback for generating ambient sounds
 * Used when MP3 files are not available
 */

const audioContexts = {};
const gainNodes = {};
const noiseNodes = {};

// Create brown noise buffer
function createBrownNoiseBuffer(audioContext) {
  const bufferSize = 2 * audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // Amplify
  }

  return buffer;
}

// Create pink noise buffer
function createPinkNoiseBuffer(audioContext) {
  const bufferSize = 2 * audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.11;
    b6 = white * 0.115926;
  }

  return buffer;
}

// Sound configurations for generating different ambiences
const soundConfigs = {
  rain: {
    type: 'brown-noise',
    filterFreq: 800,
    filterQ: 0.5,
    volume: 0.4,
  },
  thunder: {
    type: 'brown-noise',
    filterFreq: 200,
    filterQ: 1,
    volume: 0.3,
  },
  fire: {
    type: 'crackle',
    filterFreq: 2000,
    filterQ: 0.3,
    volume: 0.35,
  },
  forest: {
    type: 'pink-noise',
    filterFreq: 3000,
    filterQ: 0.2,
    volume: 0.25,
  },
  waves: {
    type: 'modulated-noise',
    filterFreq: 400,
    filterQ: 0.8,
    volume: 0.35,
    modulationRate: 0.1,
  },
  cafe: {
    type: 'pink-noise',
    filterFreq: 1500,
    filterQ: 0.3,
    volume: 0.2,
  },
  wind: {
    type: 'modulated-noise',
    filterFreq: 600,
    filterQ: 0.6,
    volume: 0.3,
    modulationRate: 0.05,
  },
  night: {
    type: 'pink-noise',
    filterFreq: 4000,
    filterQ: 0.2,
    volume: 0.15,
  },
};

export function createFallbackSound(id) {
  const config = soundConfigs[id];
  if (!config) return null;

  // Create audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioContexts[id] = audioContext;

  // Create gain node
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0;
  gainNodes[id] = gainNode;

  // Create filter
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = config.filterFreq;
  filter.Q.value = config.filterQ;

  // Create noise source
  let noiseBuffer;
  if (config.type === 'brown-noise' || config.type === 'crackle') {
    noiseBuffer = createBrownNoiseBuffer(audioContext);
  } else {
    noiseBuffer = createPinkNoiseBuffer(audioContext);
  }

  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  noiseNodes[id] = noiseSource;

  // Add modulation for waves/wind
  if (config.type === 'modulated-noise') {
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    lfo.frequency.value = config.modulationRate;
    lfoGain.gain.value = config.volume * 0.3;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
  }

  // Connect nodes
  noiseSource.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Start noise
  noiseSource.start();

  return {
    play: () => {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      gainNode.gain.linearRampToValueAtTime(config.volume, audioContext.currentTime + 0.5);
    },
    pause: () => {
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    },
    setVolume: (volume) => {
      gainNode.gain.linearRampToValueAtTime(
        config.volume * (volume / 100),
        audioContext.currentTime + 0.1
      );
    },
    stop: () => {
      noiseSource.stop();
      audioContext.close();
      delete audioContexts[id];
      delete gainNodes[id];
      delete noiseNodes[id];
    },
  };
}

export function cleanupAllFallbackSounds() {
  Object.keys(audioContexts).forEach(id => {
    try {
      if (noiseNodes[id]) noiseNodes[id].stop();
      if (audioContexts[id]) audioContexts[id].close();
    } catch {
      // Ignore cleanup errors
    }
  });
}
