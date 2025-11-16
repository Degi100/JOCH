// ============================================
// JOCH Bandpage - Light Mixer Component
// Professional DMX-Style Light Control Panel
// ============================================

import React, { useState, useEffect } from 'react';
import styles from './LightMixer.module.scss';

interface LightMixerProps {
  isActive: boolean;
  isPopout?: boolean; // Optional: Mark if this is rendered in pop-out window
}

const LightMixer: React.FC<LightMixerProps> = ({ isActive, isPopout = false }) => {
  const [isVisible, setIsVisible] = useState(isPopout); // Auto-open if in pop-out window
  const [autoMode, setAutoMode] = useState(true);
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [broadcastChannel] = useState(() => new BroadcastChannel('concert-mode-events'));

  // Moving Heads Controls
  const [movingHeadMode, setMovingHeadMode] = useState(0);
  const [movingHeadIntensity, setMovingHeadIntensity] = useState(0.7);
  const [movingHeadColors, setMovingHeadColors] = useState<string[]>([
    '#ff6b35', // Moving Head 1 - Orange
    '#e63946', // Moving Head 2 - Red
    '#06ffa5', // Moving Head 3 - Cyan
    '#a855f7', // Moving Head 4 - Purple
  ]);

  // Main Spots Controls
  const [spotMode, setSpotMode] = useState(0);
  const [spotIntensity, setSpotIntensity] = useState(0.4);
  const [spotColor, setSpotColor] = useState('#e63946');

  // Master Controls
  const [masterIntensity, setMasterIntensity] = useState(1.0);
  const [strobeActive, setStrobeActive] = useState(false);
  const [strobeTriggerMode, setStrobeTriggerMode] = useState<'continuous' | 'beat-2' | 'beat-4' | 'beat-8' | 'beat-16'>('continuous'); // Strobe trigger pattern
  const [fogTrigger, setFogTrigger] = useState(false);
  const [darkBeatTrigger, setDarkBeatTrigger] = useState(false);

  // Auto Mode Intensity (0.0 = CHILL, 1.0 = EXTREM)
  const [autoIntensity, setAutoIntensity] = useState(0.0); // DEFAULT: CHILL!

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
    const controlDetail = { type, data };

    window.dispatchEvent(new CustomEvent('lightControl', {
      detail: controlDetail
    }));

    // Broadcast to pop-out windows
    broadcastChannel.postMessage({
      type: 'lightControl',
      detail: controlDetail
    });

    console.log('🎛️ Light Control:', type, data);
  };

  // Sync state changes to pop-out windows
  const syncState = (stateUpdate: any) => {
    broadcastChannel.postMessage({
      type: 'stateSync',
      state: stateUpdate
    });
  };

  // Handle mode changes
  useEffect(() => {
    if (!autoMode && isActive) {
      dispatchControl('movingHeadMode', {
        mode: movingHeadMode,
        intensity: movingHeadIntensity,
        colors: movingHeadColors
      });
    }
  }, [movingHeadMode, movingHeadIntensity, movingHeadColors, autoMode, isActive]);

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
        strobe: strobeActive,
        strobeTriggerMode: strobeTriggerMode
      });
    }
  }, [masterIntensity, strobeActive, strobeTriggerMode, isActive]);

  useEffect(() => {
    if (isActive) {
      dispatchControl('autoMode', { enabled: autoMode, intensity: autoIntensity });
    }
  }, [autoMode, autoIntensity, isActive]);

  // Sync ALL state changes to pop-out windows (ONLY if this is NOT the pop-out window!)
  useEffect(() => {
    if (!isPopout) {
      syncState({
        autoMode,
        autoIntensity,
        movingHeadMode,
        movingHeadIntensity,
        movingHeadColors,
        spotMode,
        spotIntensity,
        spotColor,
        masterIntensity,
        strobeActive,
        strobeTriggerMode
      });
    }
  }, [
    autoMode,
    autoIntensity,
    movingHeadMode,
    movingHeadIntensity,
    movingHeadColors,
    spotMode,
    spotIntensity,
    spotColor,
    masterIntensity,
    strobeActive,
    strobeTriggerMode,
    isPopout
  ]);

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

  // Pop-out to new window
  const handlePopOut = () => {
    // Get the base URL and construct the popout URL
    const baseUrl = window.location.origin;
    const popoutUrl = `${baseUrl}/light-mixer-popout`;

    // Create new window with specific dimensions for dual monitor
    const popoutWindow = window.open(
      popoutUrl,
      'LightMixer',
      'width=500,height=900,left=100,top=100,menubar=no,toolbar=no,location=no,status=no'
    );

    if (popoutWindow) {
      // Close mixer in main window
      setIsVisible(false);
      setIsPoppedOut(true);

      // Send current state to pop-out window after a short delay
      setTimeout(() => {
        syncState({
          autoMode,
          autoIntensity,
          movingHeadMode,
          movingHeadIntensity,
          movingHeadColors,
          spotMode,
          spotIntensity,
          spotColor,
          masterIntensity,
          strobeActive,
          strobeTriggerMode
        });
      }, 500);

      console.log('🪟 Light Mixer popped out to new window!');
    }
  };


  // Listen for popout window close event
  useEffect(() => {
    const handleBroadcastMessage = (event: MessageEvent) => {
      const { type } = event.data;

      // Popout window closed - show toggle button again in main window
      if (type === 'popoutClosed' && !isPopout) {
        console.log('🪟 Popout closed - restoring toggle button');
        setIsPoppedOut(false);
      }
    };

    broadcastChannel.addEventListener('message', handleBroadcastMessage);
    return () => {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    };
  }, [broadcastChannel, isPopout]);

  // Listen for state sync from pop-out window (or main window if this IS the pop-out)
  useEffect(() => {
    const handleStateSync = (e: CustomEvent) => {
      const state = e.detail;
      console.log('🔄 LightMixer received state sync:', state);
      console.log('   Current autoMode:', autoMode, '→ New:', state.autoMode);

      // Update all state from synced data
      if (state.autoMode !== undefined) {
        setAutoMode(state.autoMode);
        console.log('   ✅ Set autoMode to:', state.autoMode);
      }
      if (state.autoIntensity !== undefined) setAutoIntensity(state.autoIntensity);
      if (state.movingHeadMode !== undefined) setMovingHeadMode(state.movingHeadMode);
      if (state.movingHeadIntensity !== undefined) setMovingHeadIntensity(state.movingHeadIntensity);
      if (state.movingHeadColors !== undefined) setMovingHeadColors(state.movingHeadColors);
      if (state.spotMode !== undefined) setSpotMode(state.spotMode);
      if (state.spotIntensity !== undefined) setSpotIntensity(state.spotIntensity);
      if (state.spotColor !== undefined) setSpotColor(state.spotColor);
      if (state.masterIntensity !== undefined) setMasterIntensity(state.masterIntensity);
      if (state.strobeActive !== undefined) setStrobeActive(state.strobeActive);
      if (state.strobeTriggerMode !== undefined) setStrobeTriggerMode(state.strobeTriggerMode);
    };

    window.addEventListener('lightMixerStateSync', handleStateSync as EventListener);
    return () => {
      window.removeEventListener('lightMixerStateSync', handleStateSync as EventListener);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive || autoMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
      // Strobe: Space (hold to activate!)
      if (e.key === ' ') {
        e.preventDefault(); // WICHTIG: Prevent scrolling!
        if (!e.repeat) {
          // Only activate on first press (not repeat events)
          setStrobeActive(true);
          console.log('⚡ STROBE HOLD STARTED');
        }
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

    const handleKeyUp = (e: KeyboardEvent) => {
      // Strobe: Release Space to deactivate
      if (e.key === ' ') {
        e.preventDefault();
        setStrobeActive(false);
        console.log('⚡ STROBE HOLD ENDED');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, autoMode]);

  if (!isActive) return null;

  return (
    <>
      {/* Toggle Button - hide if popped out in main window */}
      {!isPoppedOut && (
        <button
          className={styles.toggleButton}
          onClick={() => setIsVisible(!isVisible)}
          title="Toggle Light Mixer (or Pop-out with 🪟)"
        >
          🎛️
        </button>
      )}

      {/* Mixer Panel */}
      <div className={`${styles.mixer} ${isVisible ? styles.visible : ''}`}>
        <div className={styles.mixerHeader}>
          <h3 className={styles.mixerTitle}>LIGHT MIXER</h3>
          <div className={styles.headerButtons}>
            {!isPoppedOut && (
              <button
                className={styles.popoutButton}
                onClick={handlePopOut}
                title="Pop out to new window (Dual Monitor)"
              >
                🪟
              </button>
            )}
            <button
              className={styles.closeButton}
              onClick={() => setIsVisible(false)}
            >
              ✕
            </button>
          </div>
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

            {/* Auto Intensity Slider - nur sichtbar im Auto Mode */}
            {autoMode && (
              <div className={styles.faderGroup}>
                <label className={styles.faderLabel}>
                  AUTO INTENSITY
                  <span style={{ float: 'right', color: '#ff6b35' }}>
                    {autoIntensity === 0 ? 'CHILL' : autoIntensity < 0.33 ? 'RUHIG' : autoIntensity < 0.66 ? 'MITTEL' : autoIntensity < 0.85 ? 'INTENSIV' : 'EXTREM'}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={autoIntensity}
                  onChange={(e) => setAutoIntensity(parseFloat(e.target.value))}
                  className={styles.fader}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '11px', color: '#555' }}>
                  <span>CHILL</span>
                  <span>MITTEL</span>
                  <span>EXTREM</span>
                </div>
              </div>
            )}
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

            {/* Individual Color Selection for 4 Moving Heads */}
            <div className={styles.movingHeadColorsSection}>
              <label className={styles.colorLabel} style={{ marginBottom: '10px' }}>INDIVIDUAL COLORS</label>

              {/* Grid: 4 Moving Heads x 8 Colors */}
              {[0, 1, 2, 3].map((mhIndex) => (
                <div key={`mh-${mhIndex}`} className={styles.movingHeadColorRow}>
                  <label className={styles.movingHeadRowLabel}>MH {mhIndex + 1}</label>
                  <div className={styles.movingHeadColorButtons}>
                    {[
                      { name: 'Orange', color: '#ff6b35' },
                      { name: 'Red', color: '#e63946' },
                      { name: 'Cyan', color: '#06ffa5' },
                      { name: 'Purple', color: '#a855f7' },
                      { name: 'Yellow', color: '#ffd60a' },
                      { name: 'Blue', color: '#06b6d4' },
                      { name: 'Pink', color: '#ec4899' },
                      { name: 'White', color: '#ffffff' },
                    ].map((preset) => (
                      <button
                        key={`mh${mhIndex}-${preset.name}`}
                        className={`${styles.colorPresetButton} ${styles.small} ${movingHeadColors[mhIndex] === preset.color ? styles.active : ''}`}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => {
                          if (!autoMode) {
                            const newColors = [...movingHeadColors];
                            newColors[mhIndex] = preset.color;
                            setMovingHeadColors(newColors);
                          }
                        }}
                        disabled={autoMode}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Random Button for All Moving Heads */}
              <button
                className={`${styles.randomColorButton} ${autoMode ? styles.disabled : ''}`}
                onClick={() => {
                  if (!autoMode) {
                    // Random color for each Moving Head
                    const colorPresets = ['#ff6b35', '#e63946', '#06ffa5', '#a855f7', '#ffd60a', '#06b6d4', '#ec4899', '#ffffff'];
                    const randomColors = [0, 1, 2, 3].map(() =>
                      colorPresets[Math.floor(Math.random() * colorPresets.length)]
                    );
                    setMovingHeadColors(randomColors);
                  }
                }}
                disabled={autoMode}
                style={{ marginTop: '10px' }}
              >
                🎲 RANDOM COLORS (ALL MH)
              </button>
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

            {/* Color Presets + Random */}
            <div className={styles.colorPresets}>
              <label className={styles.colorLabel} style={{ marginBottom: '8px' }}>PRESETS</label>
              <div className={styles.colorPresetsGrid}>
                {[
                  { name: 'Orange', color: '#ff6b35' },
                  { name: 'Red', color: '#e63946' },
                  { name: 'Cyan', color: '#06ffa5' },
                  { name: 'Purple', color: '#a855f7' },
                  { name: 'Yellow', color: '#ffd60a' },
                  { name: 'Blue', color: '#06b6d4' },
                  { name: 'Pink', color: '#ec4899' },
                  { name: 'White', color: '#ffffff' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    className={`${styles.colorPresetButton} ${spotColor === preset.color ? styles.active : ''}`}
                    style={{ backgroundColor: preset.color }}
                    onClick={() => !autoMode && setSpotColor(preset.color)}
                    disabled={autoMode}
                    title={preset.name}
                  />
                ))}
              </div>
              <button
                className={`${styles.randomColorButton} ${autoMode ? styles.disabled : ''}`}
                onClick={() => {
                  if (!autoMode) {
                    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                    setSpotColor(randomColor);
                  }
                }}
                disabled={autoMode}
              >
                🎲 RANDOM COLOR
              </button>
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

            {/* Strobe Trigger Mode - nur sichtbar wenn Strobe aktiv */}
            {strobeActive && (
              <div className={styles.strobeTriggerSection}>
                <label className={styles.faderLabel}>STROBE TRIGGER</label>
                <div className={styles.triggerModeButtons}>
                  <button
                    className={`${styles.triggerModeButton} ${strobeTriggerMode === 'continuous' ? styles.active : ''}`}
                    onClick={() => setStrobeTriggerMode('continuous')}
                    title="Continuous Strobe"
                  >
                    CONT
                  </button>
                  <button
                    className={`${styles.triggerModeButton} ${strobeTriggerMode === 'beat-2' ? styles.active : ''}`}
                    onClick={() => setStrobeTriggerMode('beat-2')}
                    title="Every 2nd Beat"
                  >
                    1/2
                  </button>
                  <button
                    className={`${styles.triggerModeButton} ${strobeTriggerMode === 'beat-4' ? styles.active : ''}`}
                    onClick={() => setStrobeTriggerMode('beat-4')}
                    title="Every 4th Beat"
                  >
                    1/4
                  </button>
                  <button
                    className={`${styles.triggerModeButton} ${strobeTriggerMode === 'beat-8' ? styles.active : ''}`}
                    onClick={() => setStrobeTriggerMode('beat-8')}
                    title="Every 8th Beat"
                  >
                    1/8
                  </button>
                  <button
                    className={`${styles.triggerModeButton} ${strobeTriggerMode === 'beat-16' ? styles.active : ''}`}
                    onClick={() => setStrobeTriggerMode('beat-16')}
                    title="Every 16th Beat"
                  >
                    1/16
                  </button>
                </div>
              </div>
            )}
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
