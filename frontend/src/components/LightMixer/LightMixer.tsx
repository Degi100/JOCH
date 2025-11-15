// ============================================
// JOCH Bandpage - Light Mixer Component
// Professional DMX-Style Light Control Panel
// ============================================

import React, { useState, useEffect } from 'react';
import styles from './LightMixer.module.scss';

interface LightMixerProps {
  isActive: boolean;
}

const LightMixer: React.FC<LightMixerProps> = ({ isActive }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [autoMode, setAutoMode] = useState(true);

  // Moving Heads Controls
  const [movingHeadMode, setMovingHeadMode] = useState(0);
  const [movingHeadIntensity, setMovingHeadIntensity] = useState(0.7);
  const [movingHeadColor, setMovingHeadColor] = useState('#ff6b35');

  // Main Spots Controls
  const [spotMode, setSpotMode] = useState(0);
  const [spotIntensity, setSpotIntensity] = useState(0.4);
  const [spotColor, setSpotColor] = useState('#e63946');

  // Master Controls
  const [masterIntensity, setMasterIntensity] = useState(1.0);
  const [strobeActive, setStrobeActive] = useState(false);
  const [fogTrigger, setFogTrigger] = useState(false);
  const [darkBeatTrigger, setDarkBeatTrigger] = useState(false);

  // Mode definitions (matching the components)
  // WICHTIG: Nur sinnvolle Kombinationen (niemals 0+1 oder 2+3 zu nah beieinander)
  const movingHeadModes = [
    'BLACKOUT', 'DUAL_OUTER', 'DUAL_INNER',
    'DIAGONAL_1', 'DIAGONAL_2', 'CHASE', 'BOUNCE',
    'ALTERNATE', 'RANDOM', 'ALL'
  ];

  const spotModes = [
    'DUAL_OUTER', 'DUAL_INNER',
    'DIAGONAL_1', 'DIAGONAL_2', 'CHASE', 'BOUNCE',
    'ALTERNATE', 'RANDOM', 'ALL', 'BLACKOUT'
  ];

  // Dispatch control events
  const dispatchControl = (type: string, data: any) => {
    window.dispatchEvent(new CustomEvent('lightControl', {
      detail: { type, data }
    }));
    console.log('🎛️ Light Control:', type, data);
  };

  // Handle mode changes
  useEffect(() => {
    if (!autoMode && isActive) {
      dispatchControl('movingHeadMode', {
        mode: movingHeadMode,
        intensity: movingHeadIntensity,
        color: movingHeadColor
      });
    }
  }, [movingHeadMode, movingHeadIntensity, movingHeadColor, autoMode, isActive]);

  useEffect(() => {
    if (!autoMode && isActive) {
      dispatchControl('spotMode', {
        mode: spotMode,
        intensity: spotIntensity,
        color: spotColor
      });
    }
  }, [spotMode, spotIntensity, spotColor, autoMode, isActive]);

  useEffect(() => {
    if (isActive) {
      dispatchControl('master', {
        intensity: masterIntensity,
        strobe: strobeActive
      });
    }
  }, [masterIntensity, strobeActive, isActive]);

  useEffect(() => {
    if (isActive) {
      dispatchControl('autoMode', { enabled: autoMode });
    }
  }, [autoMode, isActive]);

  // Fog trigger (one-shot)
  useEffect(() => {
    if (fogTrigger && isActive) {
      dispatchControl('fog', { trigger: true });
      setTimeout(() => setFogTrigger(false), 200);
    }
  }, [fogTrigger, isActive]);

  // Dark Beat trigger (one-shot blackout)
  useEffect(() => {
    if (darkBeatTrigger && isActive) {
      dispatchControl('darkBeat', { trigger: true, duration: 2000 }); // 2 second blackout
      setTimeout(() => setDarkBeatTrigger(false), 200);
    }
  }, [darkBeatTrigger, isActive]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive || autoMode) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Moving Heads: 1-7
      if (e.key >= '1' && e.key <= '7') {
        setMovingHeadMode(parseInt(e.key) - 1);
      }
      // Spots: Q,W,E,R,A,S,D (7 modes)
      const spotKeys = ['q', 'w', 'e', 'r', 'a', 's', 'd'];
      const keyIndex = spotKeys.indexOf(e.key.toLowerCase());
      if (keyIndex !== -1) {
        setSpotMode(keyIndex);
      }
      // Strobe: Space
      if (e.key === ' ') {
        e.preventDefault();
        setStrobeActive(prev => !prev);
      }
      // Fog: G
      if (e.key.toLowerCase() === 'g') {
        setFogTrigger(true);
      }
      // Dark Beat (Blackout): B
      if (e.key.toLowerCase() === 'b') {
        setDarkBeatTrigger(true);
      }
      // Auto Mode: M
      if (e.key.toLowerCase() === 'm') {
        setAutoMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, autoMode]);

  if (!isActive) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsVisible(!isVisible)}
        title="Toggle Light Mixer"
      >
        🎛️
      </button>

      {/* Mixer Panel */}
      <div className={`${styles.mixer} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.mixerHeader}>
          <h3 className={styles.mixerTitle}>LIGHT MIXER</h3>
          <button
            className={styles.closeButton}
            onClick={() => setIsVisible(false)}
          >
            ✕
          </button>
        </div>

        <div className={styles.mixerContent}>
          {/* Auto Mode Toggle */}
          <div className={styles.section}>
            <button
              className={`${styles.autoModeButton} ${autoMode ? styles.active : ''}`}
              onClick={() => setAutoMode(!autoMode)}
            >
              <div className={styles.led} />
              {autoMode ? 'AUTO MODE' : 'MANUAL MODE'}
            </button>
          </div>

          {/* Moving Heads Section */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>MOVING HEADS</h4>

            {/* Mode Buttons */}
            <div className={styles.modeGrid}>
              {movingHeadModes.map((mode, index) => (
                <button
                  key={mode}
                  className={`${styles.modeButton} ${movingHeadMode === index ? styles.active : ''} ${autoMode ? styles.disabled : ''}`}
                  onClick={() => !autoMode && setMovingHeadMode(index)}
                  disabled={autoMode}
                  title={`Key: ${index + 1}`}
                >
                  <div className={styles.led} />
                  {mode}
                </button>
              ))}
            </div>

            {/* Intensity Fader */}
            <div className={styles.faderGroup}>
              <label className={styles.faderLabel}>
                INTENSITY: {Math.round(movingHeadIntensity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={movingHeadIntensity}
                onChange={(e) => setMovingHeadIntensity(parseFloat(e.target.value))}
                className={styles.fader}
                disabled={autoMode}
              />
            </div>

            {/* Color Picker */}
            <div className={styles.colorGroup}>
              <label className={styles.colorLabel}>COLOR</label>
              <input
                type="color"
                value={movingHeadColor}
                onChange={(e) => setMovingHeadColor(e.target.value)}
                className={styles.colorPicker}
                disabled={autoMode}
              />
            </div>
          </div>

          {/* Main Spots Section */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>MAIN SPOTS</h4>

            {/* Mode Buttons */}
            <div className={styles.modeGrid}>
              {spotModes.map((mode, index) => {
                const keys = ['Q', 'W', 'E', 'R', 'A', 'S', 'D'];
                return (
                  <button
                    key={mode}
                    className={`${styles.modeButton} ${spotMode === index ? styles.active : ''} ${autoMode ? styles.disabled : ''}`}
                    onClick={() => !autoMode && setSpotMode(index)}
                    disabled={autoMode}
                    title={`Key: ${keys[index]}`}
                  >
                    <div className={styles.led} />
                    {mode}
                  </button>
                );
              })}
            </div>

            {/* Intensity Fader */}
            <div className={styles.faderGroup}>
              <label className={styles.faderLabel}>
                INTENSITY: {Math.round(spotIntensity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={spotIntensity}
                onChange={(e) => setSpotIntensity(parseFloat(e.target.value))}
                className={styles.fader}
                disabled={autoMode}
              />
            </div>

            {/* Color Picker */}
            <div className={styles.colorGroup}>
              <label className={styles.colorLabel}>COLOR</label>
              <input
                type="color"
                value={spotColor}
                onChange={(e) => setSpotColor(e.target.value)}
                className={styles.colorPicker}
                disabled={autoMode}
              />
            </div>
          </div>

          {/* Master Controls */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>MASTER</h4>

            {/* Master Intensity */}
            <div className={styles.faderGroup}>
              <label className={styles.faderLabel}>
                MASTER: {Math.round(masterIntensity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterIntensity}
                onChange={(e) => setMasterIntensity(parseFloat(e.target.value))}
                className={`${styles.fader} ${styles.masterFader}`}
              />
            </div>

            {/* Effect Buttons */}
            <div className={styles.effectButtons}>
              <button
                className={`${styles.effectButton} ${strobeActive ? styles.active : ''}`}
                onClick={() => setStrobeActive(!strobeActive)}
                title="Toggle Strobe (Space)"
              >
                <div className={styles.led} />
                STROBE
              </button>
              <button
                className={`${styles.effectButton} ${fogTrigger ? styles.active : ''}`}
                onClick={() => setFogTrigger(true)}
                title="Fog Burst (G)"
              >
                <div className={styles.led} />
                FOG
              </button>
              <button
                className={`${styles.effectButton} ${darkBeatTrigger ? styles.active : ''}`}
                onClick={() => setDarkBeatTrigger(true)}
                title="Dark Beat Blackout (B)"
              >
                <div className={styles.led} />
                DARK-BEAT
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className={styles.shortcuts}>
            <small>
              1-0: Moving Heads | Q-D: Spots | Space: Strobe | G: Fog | B: Dark-Beat | M: Auto/Manual
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(LightMixer);
