import { useEffect, useRef } from 'react';
import './VisualScene.css';

export function VisualScene({ playing, volumes }) {
  const thunderRef = useRef(null);

  // Thunder flash effect
  useEffect(() => {
    if (!playing.thunder) return;

    const triggerFlash = () => {
      const flashEl = thunderRef.current;
      if (flashEl) {
        flashEl.classList.add('flash');
        setTimeout(() => flashEl.classList.remove('flash'), 200);
      }
    };

    // Random interval between 5-15 seconds
    let timeout;
    const scheduleFlash = () => {
      const delay = 5000 + Math.random() * 10000;
      timeout = setTimeout(() => {
        triggerFlash();
        scheduleFlash();
      }, delay);
    };

    // Initial flash after a short delay
    timeout = setTimeout(() => {
      triggerFlash();
      scheduleFlash();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [playing.thunder]);

  // Calculate which scene dominates based on volume-weighted activity
  const getDominantScene = () => {
    const activeScenes = Object.entries(playing)
      .filter(([, isPlaying]) => isPlaying)
      .map(([id]) => ({ id, volume: volumes[id] || 50 }));

    if (activeScenes.length === 0) return null;

    return activeScenes.reduce((max, current) =>
      current.volume > max.volume ? current : max
    ).id;
  };

  const dominantScene = getDominantScene();

  return (
    <div className="visual-scene">
      {/* Base gradient */}
      <div
        className="scene-base"
        style={{
          background: dominantScene
            ? getBaseGradient(dominantScene)
            : 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
        }}
      />

      {/* Rain effect */}
      <div className={`scene-rain ${playing.rain ? 'active' : ''}`} />

      {/* Fire effect */}
      <div className={`scene-fire ${playing.fire ? 'active' : ''}`} />

      {/* Forest effect */}
      <div className={`scene-forest ${playing.forest ? 'active' : ''}`} />

      {/* Waves effect */}
      <div className={`scene-waves ${playing.waves ? 'active' : ''}`} />

      {/* Cafe effect */}
      <div className={`scene-cafe ${playing.cafe ? 'active' : ''}`} />

      {/* Wind effect */}
      <div className={`scene-wind ${playing.wind ? 'active' : ''}`} />

      {/* Night effect */}
      <div className={`scene-night ${playing.night ? 'active' : ''}`} />

      {/* Thunder flash */}
      <div ref={thunderRef} className="scene-thunder" />
    </div>
  );
}

function getBaseGradient(dominantId) {
  const gradients = {
    rain: 'linear-gradient(135deg, #0f1520 0%, #1a2535 50%, #0f1520 100%)',
    thunder: 'linear-gradient(135deg, #15121f 0%, #1f1a2f 50%, #15121f 100%)',
    fire: 'linear-gradient(135deg, #1a1510 0%, #251a10 50%, #1a1510 100%)',
    forest: 'linear-gradient(135deg, #101a15 0%, #152515 50%, #101a15 100%)',
    waves: 'linear-gradient(135deg, #101520 0%, #152530 50%, #101520 100%)',
    cafe: 'linear-gradient(135deg, #1a1512 0%, #251a12 50%, #1a1512 100%)',
    wind: 'linear-gradient(135deg, #121518 0%, #1a1f25 50%, #121518 100%)',
    night: 'linear-gradient(135deg, #0f0f1a 0%, #15152a 50%, #0f0f1a 100%)',
  };
  return gradients[dominantId] || 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)';
}
