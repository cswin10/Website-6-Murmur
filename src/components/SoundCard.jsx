import './SoundCard.css';

export function SoundCard({ sound, isActive, volume, onToggle, onVolumeChange }) {
  const handleClick = (e) => {
    // Don't toggle if clicking on the slider
    if (e.target.type === 'range') return;
    onToggle();
  };

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    onVolumeChange(parseInt(e.target.value, 10));
  };

  return (
    <div
      className={`sound-card ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      style={{
        '--sound-color': sound.color,
        '--sound-glow': `${sound.color}40`,
        '--sound-glow-subtle': `${sound.color}10`,
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`${sound.name} sound. ${isActive ? 'Playing' : 'Stopped'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <span className="sound-icon" aria-hidden="true">
        {sound.icon}
      </span>
      <span className="sound-name">{sound.name}</span>
      <input
        type="range"
        className="sound-volume"
        min="0"
        max="100"
        value={volume}
        onChange={handleVolumeChange}
        onClick={(e) => e.stopPropagation()}
        aria-label={`${sound.name} volume`}
        disabled={!isActive}
      />
    </div>
  );
}
