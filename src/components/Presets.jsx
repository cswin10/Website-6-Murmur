import { presets } from '../data/presets';
import './Presets.css';

export function Presets({ onApplyPreset, playing }) {
  // Determine if a preset is currently active
  const getActivePreset = () => {
    for (const preset of presets) {
      const presetSoundIds = Object.keys(preset.sounds);
      const activeSoundIds = Object.keys(playing).filter(id => playing[id]);

      // Check if all preset sounds are playing and no extra sounds
      if (presetSoundIds.length === activeSoundIds.length) {
        const allMatch = presetSoundIds.every(id => playing[id]);
        if (allMatch) return preset.id;
      }
    }
    return null;
  };

  const activePresetId = getActivePreset();

  return (
    <div className="presets-row">
      {presets.map(preset => (
        <button
          key={preset.id}
          className={`preset-btn ${activePresetId === preset.id ? 'active' : ''}`}
          onClick={() => onApplyPreset(preset)}
          aria-pressed={activePresetId === preset.id}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
