# Murmur

An ambient soundscape mixer for focus and relaxation. Layer multiple environmental sounds like rain, fireplace, cafe chatter, and more to create your perfect atmosphere.

## Features

- **8 Ambient Sounds**: Rain, Thunder, Fire, Forest, Waves, Cafe, Wind, Night
- **Individual Volume Controls**: Fine-tune each sound layer
- **Visual Scene**: Background visually responds to active sounds
- **Presets**: Quick-start combinations like "Rainy Cafe", "Cosy Cabin", "Sleep"
- **Master Controls**: Global volume and pause/resume
- **LocalStorage Persistence**: Your mix is saved and restored on reload
- **Web Audio Fallback**: Works even without audio files using generated ambient sounds

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Adding Audio Files

For the best experience, add MP3 audio files to `/public/sounds/`:

- `rain.mp3`
- `thunder.mp3`
- `fire.mp3`
- `forest.mp3`
- `waves.mp3`
- `cafe.mp3`
- `wind.mp3`
- `night.mp3`

You can find free ambient sounds on [Pixabay](https://pixabay.com/sound-effects/).

The app works without audio files using Web Audio API generated sounds as a fallback.

## Tech Stack

- React 19
- Vite
- Web Audio API
- CSS (no external libraries)

## Project Structure

```
src/
  App.jsx           # Main app component
  components/
    Header.jsx      # Logo and tagline
    SoundCard.jsx   # Individual sound toggle/volume
    SoundsGrid.jsx  # Grid of sound cards
    Presets.jsx     # Preset buttons
    MasterControls.jsx  # Master volume and pause
    VisualScene.jsx # Animated background
  hooks/
    useAudioManager.js      # Audio playback logic
    useWebAudioFallback.js  # Generated sound fallback
  data/
    sounds.js       # Sound definitions
    presets.js      # Preset definitions
  styles/
    global.css      # Global styles and CSS variables
```
