import { Header } from './components/Header';
import { VisualScene } from './components/VisualScene';
import { SoundsGrid } from './components/SoundsGrid';
import { Presets } from './components/Presets';
import { MasterControls } from './components/MasterControls';
import { useAudioManager } from './hooks/useAudioManager';
import './App.css';

function App() {
  const {
    playing,
    volumes,
    masterVolume,
    isPaused,
    hasActiveSounds,
    toggleSound,
    setVolume,
    setMasterVolume,
    pauseAll,
    applyPreset,
  } = useAudioManager();

  return (
    <>
      <VisualScene playing={playing} volumes={volumes} />

      <div className="app">
        <main className="main-content">
          <Header />

          <SoundsGrid
            playing={playing}
            volumes={volumes}
            onToggleSound={toggleSound}
            onVolumeChange={setVolume}
          />

          <Presets onApplyPreset={applyPreset} playing={playing} />

          <MasterControls
            masterVolume={masterVolume}
            onMasterVolumeChange={setMasterVolume}
            isPaused={isPaused}
            onPauseAll={pauseAll}
            hasActiveSounds={hasActiveSounds}
          />
        </main>
      </div>
    </>
  );
}

export default App;
