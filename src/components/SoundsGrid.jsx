import { sounds } from '../data/sounds';
import { SoundCard } from './SoundCard';
import './SoundsGrid.css';

export function SoundsGrid({ playing, volumes, onToggleSound, onVolumeChange }) {
  return (
    <div className="sounds-grid">
      {sounds.map(sound => (
        <SoundCard
          key={sound.id}
          sound={sound}
          isActive={playing[sound.id] || false}
          volume={volumes[sound.id] || 50}
          onToggle={() => onToggleSound(sound.id)}
          onVolumeChange={(volume) => onVolumeChange(sound.id, volume)}
        />
      ))}
    </div>
  );
}
