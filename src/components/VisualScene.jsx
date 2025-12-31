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
    rain: 'linear-gradient(180deg, #0a1525 0%, #152540 40%, #0d1a30 100%)',
    thunder: 'linear-gradient(180deg, #12101f 0%, #1a1535 40%, #0f0d1a 100%)',
    fire: 'linear-gradient(180deg, #1a1008 0%, #251510 40%, #120a05 100%)',
    forest: 'linear-gradient(180deg, #0a150d 0%, #152518 40%, #0d1a10 100%)',
    waves: 'linear-gradient(180deg, #081520 0%, #0f2535 40%, #0a1a28 100%)',
    cafe: 'linear-gradient(180deg, #181008 0%, #201510 40%, #140c06 100%)',
    wind: 'linear-gradient(180deg, #101318 0%, #181d25 40%, #0d1015 100%)',
    night: 'linear-gradient(180deg, #08081a 0%, #101028 40%, #0a0a18 100%)',
  };
  return gradients[dominantId] || 'linear-gradient(180deg, #0a0a0a 0%, #151515 100%)';
}
