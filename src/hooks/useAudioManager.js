import { useRef, useEffect, useState, useCallback } from 'react';
import { sounds, defaultVolumes } from '../data/sounds';
import { createFallbackSound, cleanupAllFallbackSounds } from './useWebAudioFallback';

const STORAGE_KEY = 'murmur-state';

// Load saved state from localStorage
function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// Initialize volumes from localStorage or defaults
function getInitialVolumes() {
  const saved = loadSavedState();
  return saved?.volumes ? { ...defaultVolumes, ...saved.volumes } : defaultVolumes;
}

// Initialize master volume from localStorage or default
function getInitialMasterVolume() {
  const saved = loadSavedState();
  return saved?.masterVolume !== undefined ? saved.masterVolume : 80;
}

export function useAudioManager() {
  const audioRefs = useRef({});
  const fallbackRefs = useRef({});
  const isInitializedRef = useRef(false);
  const [playing, setPlaying] = useState({});
  const [volumes, setVolumes] = useState(getInitialVolumes);
  const [masterVolume, setMasterVolume] = useState(getInitialMasterVolume);
  const [isPaused, setIsPaused] = useState(false);
  const [audioError, setAudioError] = useState({});
  const [useFallback, setUseFallback] = useState({});

  // Initialize audio elements
  useEffect(() => {
    const soundIds = sounds.map(s => s.id);
    const currentAudioRefs = audioRefs.current;

    soundIds.forEach(id => {
      const audio = new Audio(`/sounds/${id}.mp3`);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = 'auto';

      // Track if this audio file loads successfully
      audio.addEventListener('canplaythrough', () => {
        setUseFallback(prev => ({ ...prev, [id]: false }));
      }, { once: true });

      audio.addEventListener('error', () => {
        setAudioError(prev => ({ ...prev, [id]: true }));
        setUseFallback(prev => ({ ...prev, [id]: true }));
        // Create fallback sound
        fallbackRefs.current[id] = createFallbackSound(id);
      });

      currentAudioRefs[id] = audio;
    });

    isInitializedRef.current = true;

    return () => {
      Object.values(currentAudioRefs).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      cleanupAllFallbackSounds();
    };
  }, []);

  // Save state to localStorage when volumes or masterVolume changes
  useEffect(() => {
    if (!isInitializedRef.current) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        volumes,
        masterVolume,
      }));
    } catch {
      // Ignore save errors
    }
  }, [volumes, masterVolume]);

  // Update volumes when they change
  useEffect(() => {
    Object.entries(volumes).forEach(([id, volume]) => {
      const effectiveVolume = (volume / 100) * (masterVolume / 100);

      if (playing[id] && !isPaused) {
        if (useFallback[id] && fallbackRefs.current[id]) {
          fallbackRefs.current[id].setVolume(volume * (masterVolume / 100));
        } else {
          const audio = audioRefs.current[id];
          if (audio) {
            audio.volume = effectiveVolume;
          }
        }
      }
    });
  }, [volumes, masterVolume, playing, isPaused, useFallback]);

  const toggleSound = useCallback((id) => {
    if (playing[id]) {
      // Stop the sound
      if (useFallback[id] && fallbackRefs.current[id]) {
        fallbackRefs.current[id].pause();
      } else {
        const audio = audioRefs.current[id];
        if (audio) audio.pause();
      }
      setPlaying(prev => ({ ...prev, [id]: false }));
    } else {
      // Play the sound
      const effectiveVolume = (volumes[id] / 100) * (masterVolume / 100);

      if (useFallback[id]) {
        // Use fallback if needed
        if (!fallbackRefs.current[id]) {
          fallbackRefs.current[id] = createFallbackSound(id);
        }
        if (fallbackRefs.current[id]) {
          fallbackRefs.current[id].setVolume(volumes[id] * (masterVolume / 100));
          fallbackRefs.current[id].play();
        }
      } else {
        const audio = audioRefs.current[id];
        if (audio) {
          audio.volume = effectiveVolume;
          audio.play().catch(err => {
            console.warn(`Failed to play ${id}, using fallback:`, err);
            setUseFallback(prev => ({ ...prev, [id]: true }));
            // Try fallback
            if (!fallbackRefs.current[id]) {
              fallbackRefs.current[id] = createFallbackSound(id);
            }
            if (fallbackRefs.current[id]) {
              fallbackRefs.current[id].setVolume(volumes[id] * (masterVolume / 100));
              fallbackRefs.current[id].play();
            }
          });
        }
      }

      setPlaying(prev => ({ ...prev, [id]: true }));
      setIsPaused(false);
    }
  }, [playing, volumes, masterVolume, useFallback]);

  const setVolume = useCallback((id, volume) => {
    setVolumes(prev => ({ ...prev, [id]: volume }));
  }, []);

  const pauseAll = useCallback(() => {
    Object.keys(audioRefs.current).forEach(id => {
      if (playing[id]) {
        if (isPaused) {
          // Resume
          const effectiveVolume = (volumes[id] / 100) * (masterVolume / 100);

          if (useFallback[id] && fallbackRefs.current[id]) {
            fallbackRefs.current[id].setVolume(volumes[id] * (masterVolume / 100));
            fallbackRefs.current[id].play();
          } else {
            const audio = audioRefs.current[id];
            if (audio) {
              audio.volume = effectiveVolume;
              audio.play().catch(console.error);
            }
          }
        } else {
          // Pause
          if (useFallback[id] && fallbackRefs.current[id]) {
            fallbackRefs.current[id].pause();
          } else {
            const audio = audioRefs.current[id];
            if (audio) audio.pause();
          }
        }
      }
    });
    setIsPaused(!isPaused);
  }, [playing, isPaused, volumes, masterVolume, useFallback]);

  const stopAll = useCallback(() => {
    Object.keys(audioRefs.current).forEach(id => {
      if (useFallback[id] && fallbackRefs.current[id]) {
        fallbackRefs.current[id].pause();
      } else {
        const audio = audioRefs.current[id];
        if (audio) audio.pause();
      }
    });
    setPlaying({});
    setIsPaused(false);
  }, [useFallback]);

  const applyPreset = useCallback((preset) => {
    // First, stop all sounds
    Object.keys(audioRefs.current).forEach(id => {
      if (useFallback[id] && fallbackRefs.current[id]) {
        fallbackRefs.current[id].pause();
      } else {
        audioRefs.current[id].pause();
      }
    });

    // Reset playing state
    setPlaying({});
    setIsPaused(false);

    // Apply preset after a brief delay
    setTimeout(() => {
      Object.entries(preset.sounds).forEach(([id, volume]) => {
        setVolumes(prev => ({ ...prev, [id]: volume }));

        const effectiveVolume = (volume / 100) * (masterVolume / 100);

        if (useFallback[id]) {
          if (!fallbackRefs.current[id]) {
            fallbackRefs.current[id] = createFallbackSound(id);
          }
          if (fallbackRefs.current[id]) {
            fallbackRefs.current[id].setVolume(volume * (masterVolume / 100));
            fallbackRefs.current[id].play();
          }
        } else {
          const audio = audioRefs.current[id];
          if (audio) {
            audio.volume = effectiveVolume;
            audio.play().catch(err => {
              console.warn(`Failed to play ${id}, using fallback:`, err);
              setUseFallback(prev => ({ ...prev, [id]: true }));
              if (!fallbackRefs.current[id]) {
                fallbackRefs.current[id] = createFallbackSound(id);
              }
              if (fallbackRefs.current[id]) {
                fallbackRefs.current[id].setVolume(volume * (masterVolume / 100));
                fallbackRefs.current[id].play();
              }
            });
          }
        }

        setPlaying(prev => ({ ...prev, [id]: true }));
      });
    }, 100);
  }, [masterVolume, useFallback]);

  const hasActiveSounds = Object.values(playing).some(Boolean);

  return {
    playing,
    volumes,
    masterVolume,
    isPaused,
    audioError,
    hasActiveSounds,
    toggleSound,
    setVolume,
    setMasterVolume,
    pauseAll,
    stopAll,
    applyPreset,
  };
}
