import './MasterControls.css';

export function MasterControls({
  masterVolume,
  onMasterVolumeChange,
  isPaused,
  onPauseAll,
  hasActiveSounds,
}) {
  const getVolumeIcon = () => {
    if (masterVolume === 0) return '🔇';
    if (masterVolume < 30) return '🔈';
    if (masterVolume < 70) return '🔉';
    return '🔊';
  };

  return (
    <div className="master-controls">
      <span className="master-volume-icon" aria-hidden="true">
        {getVolumeIcon()}
      </span>
      <input
        type="range"
        className="master-volume-slider"
        min="0"
        max="100"
        value={masterVolume}
        onChange={(e) => onMasterVolumeChange(parseInt(e.target.value, 10))}
        aria-label="Master volume"
      />
      <span className="master-volume-value">{masterVolume}%</span>
      <button
        className={`pause-all-btn ${isPaused ? 'paused' : ''}`}
        onClick={onPauseAll}
        disabled={!hasActiveSounds}
        aria-label={isPaused ? 'Resume all sounds' : 'Pause all sounds'}
      >
        <span aria-hidden="true">{isPaused ? '▶️' : '⏸️'}</span>
        <span>{isPaused ? 'Resume' : 'Pause'}</span>
      </button>
    </div>
  );
}
