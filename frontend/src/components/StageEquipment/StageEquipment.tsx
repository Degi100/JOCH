// ============================================
// JOCH Bandpage - Stage Equipment Component
// PA Speakers, Moving Heads with real beams, Stage Props for Concert Mode
// ============================================

import React, { useEffect, useState, useRef } from 'react';
import styles from './StageEquipment.module.scss';

interface StageEquipmentProps {
  isActive: boolean;
}

const StageEquipment: React.FC<StageEquipmentProps> = ({ isActive }) => {
  const [beatPulse, setBeatPulse] = useState(false);
  const [beatCount, setBeatCount] = useState(0);
  const [bassHit, setBassHit] = useState(false);
  const mountedRef = useRef(true);

  // Auto mode control
  const autoModeRef = useRef(true);
  const autoIntensityRef = useRef(0.0); // 0.0 = CHILL (DEFAULT!), 1.0 = aggressiv
  const manualIntensityRef = useRef(0.7);

  // Warm-up phase - Moving Heads "lauschen" erst, dann starten sie
  const warmupBeatsRef = useRef(8); // Erste 8 Beats: Beams bleiben dunkel
  const isWarmupPhaseRef = useRef(true); // Sind wir noch in der Aufwärmphase?

  // Canvas refs for moving head beams
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const beamPositionsRef = useRef<Array<{x: number, y: number, angle: number, targetAngle: number, color: string, isActive: boolean, endX?: number}>>([]);
  const beatFlashRef = useRef<number>(0);
  const darkBeatActiveRef = useRef<boolean>(false);
  const darkBeatEndTimeRef = useRef<number>(0);
  const speedMultiplierRef = useRef<number>(1); // BPM-based speed multiplier
  const beatIntervalRef = useRef<number>(500); // Standard: 120 BPM = 500ms
  const lastBeatTimeRef = useRef<number>(0);

  // Strobe state - ENHANCED! (same as SimpleSpotlight)
  const strobeActiveRef = useRef<boolean>(false);
  const strobeStateRef = useRef<boolean>(false); // true = ON, false = OFF
  const strobeColorIndexRef = useRef<number>(0);
  const strobeTimerRef = useRef<number>(0);
  const strobeTriggerModeRef = useRef<'continuous' | 'beat-2' | 'beat-4' | 'beat-8' | 'beat-16'>('continuous');
  const strobeAllowedRef = useRef<boolean>(true); // Beat-based trigger control

  // Color palette for moving heads (concert light colors)
  const colorPalette = [
    '#ff6b35',  // Orange
    '#e63946',  // Red
    '#06ffa5',  // Cyan/Turquoise
    '#a855f7',  // Purple/Violet
    '#ffd60a',  // Yellow/Gold
    '#06b6d4',  // Blue
    '#ec4899',  // Pink/Magenta
  ];
  const colorPaletteRef = useRef(colorPalette);
  const currentColorIndexRef = useRef(0);

  // Lighting modes for dynamic show (nur 2 oder alle 4, niemals einzeln!)
  // WICHTIG: Niemals 0+1 (beide links zu nah) oder 2+3 (beide rechts zu nah)!
  const lightingModes = [
    { name: 'BLACKOUT', activeBeams: [], intensity: 0 },                    // Alle aus (drama)
    { name: 'DUAL_OUTER', activeBeams: [0, 3], intensity: 0.5 },            // Äußere links + äußere rechts
    { name: 'DUAL_INNER', activeBeams: [1, 2], intensity: 0.5 },            // Innere links + innere rechts
    { name: 'DIAGONAL_1', activeBeams: [0, 2], intensity: 0.55 },           // Links außen + rechts innen
    { name: 'DIAGONAL_2', activeBeams: [1, 3], intensity: 0.55 },           // Links innen + rechts außen
    { name: 'CHASE', activeBeams: [0], intensity: 0.65 },                   // Chase Mode (wird dynamisch geändert)
    { name: 'BOUNCE', activeBeams: [0, 3], intensity: 0.6 },                // Ping-Pong outer ↔ inner (dynamisch)
    { name: 'ALTERNATE', activeBeams: [0, 3], intensity: 0.55 },            // Toggle outer ↔ inner (dynamisch)
    { name: 'RANDOM', activeBeams: [0], intensity: 0.65 },                  // Random lights (dynamisch)
    { name: 'ALL', activeBeams: [0, 1, 2, 3], intensity: 0.7 },             // Alle 4 (INTENSE!)
  ];
  const currentModeIndexRef = useRef(0);
  const chasePositionRef = useRef(0); // Für Chase Mode: welcher Beam ist gerade aktiv (0-3)
  const bounceDirectionRef = useRef(1); // Für Bounce: 1 = vorwärts, -1 = rückwärts
  const alternateStateRef = useRef(false); // Für Alternate: false = outer, true = inner

  // Initialize beam positions for 4 moving heads (matching fixture positions on truss)
  useEffect(() => {
    // All moving heads start with the same color (synchronized)
    const initialColor = colorPaletteRef.current[0];
    const initialMode = lightingModes[0];
    const positions = [
      { x: 0.15, y: 0, angle: 45, targetAngle: 45, color: initialColor, isActive: initialMode.activeBeams.includes(0) },  // Left 1
      { x: 0.35, y: 0, angle: 30, targetAngle: 30, color: initialColor, isActive: initialMode.activeBeams.includes(1) },  // Left 2
      { x: 0.65, y: 0, angle: -30, targetAngle: -30, color: initialColor, isActive: initialMode.activeBeams.includes(2) }, // Right 1
      { x: 0.85, y: 0, angle: -45, targetAngle: -45, color: initialColor, isActive: initialMode.activeBeams.includes(3) }  // Right 2
    ];
    beamPositionsRef.current = positions;
  }, []);

  // Reset when concert mode stops
  useEffect(() => {
    mountedRef.current = true;
    if (!isActive) {
      setBeatCount(0);
      beatFlashRef.current = 0;
      isWarmupPhaseRef.current = true; // Reset warm-up phase
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      // Concert mode starts - reset warm-up
      isWarmupPhaseRef.current = true;
    }
    return () => {
      mountedRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  // Listen to beat events
  useEffect(() => {
    if (!isActive) return;

    const handleBeat = (event: Event) => {
      if (!mountedRef.current) return;

      const customEvent = event as CustomEvent;
      console.log('🔊 Stage Equipment: Beat received!', customEvent.detail);

      // Increment beat count and get the NEW value
      const newBeatCount = (beatCount + 1);
      setBeatCount(newBeatCount);

      // Pulse on every beat
      setBeatPulse(true);
      setTimeout(() => {
        if (mountedRef.current) setBeatPulse(false);
      }, 150);

      // Strong bass hit every 4 beats
      if (newBeatCount % 4 === 0) {
        setBassHit(true);
        setTimeout(() => {
          if (mountedRef.current) setBassHit(false);
        }, 300);
      }

      // Flash the beams on beat (only active beams)
      beatFlashRef.current = 1;

      // Calculate BPM-based speed multiplier
      const now = Date.now();
      if (lastBeatTimeRef.current > 0) {
        const timeSinceLastBeat = now - lastBeatTimeRef.current;

        // Gleitender Durchschnitt für stabileres Tempo
        beatIntervalRef.current = beatIntervalRef.current * 0.7 + timeSinceLastBeat * 0.3;

        // Berechne Geschwindigkeitsmultiplikator (500ms = 120 BPM = 1.0x)
        speedMultiplierRef.current = 500 / beatIntervalRef.current;

        // Erweiterten Bereich für Moving Heads: 0.3x - 2.5x (aggressiver als Spots!)
        speedMultiplierRef.current = Math.max(0.3, Math.min(2.5, speedMultiplierRef.current));
      }
      lastBeatTimeRef.current = now;

      // Warm-up Phase Check: Erste 8 Beats "lauschen" (Beams bleiben dunkel)
      if (newBeatCount <= warmupBeatsRef.current) {
        isWarmupPhaseRef.current = true;
        // Beams bleiben komplett dunkel - keine Mode Changes, keine Aktivität
        beamPositionsRef.current.forEach(beam => {
          beam.isActive = false; // Alle Beams aus
        });
        console.log(`🎧 WARM-UP: Beat ${newBeatCount}/${warmupBeatsRef.current} - Moving Heads lauschen...`);
        return; // Keine weiteren Aktionen während Warm-up
      } else if (isWarmupPhaseRef.current) {
        // Warm-up Phase vorbei - Moving Heads starten jetzt!
        isWarmupPhaseRef.current = false;
        console.log('🚀 WARM-UP COMPLETE! Moving Heads starten jetzt!');

        // Aktiviere sofort die Beams basierend auf dem aktuellen Mode
        const initialMode = lightingModes[currentModeIndexRef.current];
        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = initialMode.activeBeams.includes(index);
        });
        console.log('💡 Initial mode activated:', initialMode.name, 'Active beams:', initialMode.activeBeams);
      }

      // Moving Heads: Mode wechsel - Intervall abhängig von Auto Intensity!
      // 0.0 = alle 16 Beats, 0.5 = alle 8 Beats, 1.0 = alle 4 Beats
      const modeChangeInterval = Math.max(4, Math.round(16 - (autoIntensityRef.current * 12))); // 4-16 Beats
      if (autoModeRef.current && newBeatCount % modeChangeInterval === 0 && newBeatCount > 0) {
        const randomModeIndex = Math.floor(Math.random() * lightingModes.length);
        currentModeIndexRef.current = randomModeIndex;
        const newMode = lightingModes[randomModeIndex];

        // Update which beams are active
        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = newMode.activeBeams.includes(index);
        });

        // COORDINATION: Dispatch current mode to spotlights for intelligent coordination
        window.dispatchEvent(new CustomEvent('movingHeadModeChange', {
          detail: {
            mode: newMode.name,
            activeBeams: newMode.activeBeams,
            beatCount: newBeatCount
          }
        }));

        console.log('💡 Moving Heads Mode changed to:', newMode.name, 'Active beams:', newMode.activeBeams, 'Interval:', modeChangeInterval);
      }

      // Moving Heads: Farbe - Intervall abhängig von Auto Intensity!
      // 0.0 = alle 20 Beats, 0.5 = alle 12 Beats, 1.0 = alle 6 Beats
      const colorChangeInterval = Math.max(6, Math.round(20 - (autoIntensityRef.current * 14))); // 6-20 Beats
      if (autoModeRef.current && newBeatCount % colorChangeInterval === 0 && newBeatCount > 0) {
        currentColorIndexRef.current = (currentColorIndexRef.current + 1) % colorPaletteRef.current.length;
        const newColor = colorPaletteRef.current[currentColorIndexRef.current];
        beamPositionsRef.current.forEach((beam) => {
          beam.color = newColor;
        });

        // COORDINATION: Dispatch color change to spotlights for synchronized colors
        window.dispatchEvent(new CustomEvent('movingHeadColorChange', {
          detail: {
            colorIndex: currentColorIndexRef.current,
            color: newColor,
            beatCount: newBeatCount
          }
        }));

        console.log('🎨 Moving Heads: Color changed to', newColor, 'Interval:', colorChangeInterval);
      }

      // DYNAMIC MODES: CHASE, BOUNCE, ALTERNATE, RANDOM
      const currentMode = lightingModes[currentModeIndexRef.current];

      if (currentMode.name === 'CHASE') {
        // CHASE MODE: Bei jedem Beat den nächsten Beam aktivieren (0 → 1 → 2 → 3 → 0 ...)
        chasePositionRef.current = (chasePositionRef.current + 1) % 4;

        // Nur der aktuelle Chase-Beam ist aktiv
        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = index === chasePositionRef.current;
        });

        console.log('🏃 CHASE: Beam', chasePositionRef.current, 'active');
      }
      else if (currentMode.name === 'BOUNCE') {
        // BOUNCE MODE: Ping-Pong zwischen outer (0+3) und inner (1+2)
        // Pattern: outer → inner → outer → inner (hin und her)
        const pattern = [[0, 3], [1, 2]]; // outer, inner
        chasePositionRef.current = (chasePositionRef.current + 1) % pattern.length;
        const activeBeams = pattern[chasePositionRef.current];

        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = activeBeams.includes(index);
        });

        console.log('🏓 BOUNCE: Beams', activeBeams.join('+'), 'active');
      }
      else if (currentMode.name === 'ALTERNATE') {
        // ALTERNATE MODE: Toggle zwischen outer (0+3) und inner (1+2) bei jedem Beat
        alternateStateRef.current = !alternateStateRef.current;
        const activeBeams = alternateStateRef.current ? [1, 2] : [0, 3]; // inner : outer

        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = activeBeams.includes(index);
        });

        console.log('🔄 ALTERNATE: Beams', activeBeams.join('+'), 'active');
      }
      else if (currentMode.name === 'RANDOM') {
        // RANDOM MODE: Zufällig 1-2 Beams aktivieren (Chaos!)
        const numBeams = Math.random() > 0.5 ? 2 : 1;
        const availableBeams = [0, 1, 2, 3];
        const randomBeams: number[] = [];

        for (let i = 0; i < numBeams; i++) {
          const randomIndex = Math.floor(Math.random() * availableBeams.length);
          randomBeams.push(availableBeams[randomIndex]);
          availableBeams.splice(randomIndex, 1);
        }

        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = randomBeams.includes(index);
        });

        console.log('🎲 RANDOM: Beams', randomBeams.join('+'), 'active');
      }

      // ======================================================
      // STROBE TRIGGER LOGIC - Beat-based activation
      // ======================================================
      if (strobeActiveRef.current && strobeTriggerModeRef.current !== 'continuous') {
        const triggerMode = strobeTriggerModeRef.current;
        let shouldTrigger = false;

        switch (triggerMode) {
          case 'beat-2':
            shouldTrigger = (newBeatCount % 2 === 0);
            break;
          case 'beat-4':
            shouldTrigger = (newBeatCount % 4 === 0);
            break;
          case 'beat-8':
            shouldTrigger = (newBeatCount % 8 === 0);
            break;
          case 'beat-16':
            shouldTrigger = (newBeatCount % 16 === 0);
            break;
        }

        if (shouldTrigger) {
          strobeAllowedRef.current = true; // Enable strobe for short duration
          console.log(`⚡ STROBE TRIGGER (Moving Heads): Beat ${newBeatCount} (${triggerMode})`);
        }
      }

      // Beam angles: JEDEN Beat bewegen - Bewegungsstärke abhängig von Auto Intensity!
      // 0.0 = ±30 degrees, 0.5 = ±60 degrees, 1.0 = ±90 degrees
      const angleVariation = 30 + (autoIntensityRef.current * 60); // 30-90 degrees
      beamPositionsRef.current.forEach((beam, index) => {
        if (beam.isActive) {
          const baseAngle = index < 2 ? 30 : -30; // Left beams positive, right negative
          beam.targetAngle = baseAngle + (Math.random() - 0.5) * angleVariation;
        }
      });
    };

    window.addEventListener('musicBeat', handleBeat);
    return () => {
      window.removeEventListener('musicBeat', handleBeat);
    };
  }, [isActive, beatCount]);

  // Listen to Light Control events from Mixer
  useEffect(() => {
    if (!isActive) return;

    const handleLightControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, data } = customEvent.detail;

      console.log('🎛️ Stage Equipment: Light Control received', type, data);

      switch (type) {
        case 'movingHeadMode':
          // Manual mode control for moving heads
          currentModeIndexRef.current = data.mode;
          const mode = lightingModes[data.mode];
          beamPositionsRef.current.forEach((beam, index) => {
            beam.isActive = mode.activeBeams.includes(index);
            // Use individual color for each beam if colors array is provided
            if (data.colors && data.colors[index]) {
              beam.color = data.colors[index];
            } else if (data.color) {
              // Fallback to single color (for backwards compatibility)
              beam.color = data.color;
            }
          });
          manualIntensityRef.current = data.intensity;
          break;

        case 'autoMode':
          autoModeRef.current = data.enabled;
          if (data.intensity !== undefined) {
            autoIntensityRef.current = data.intensity;
          }
          console.log('🎛️ Auto Mode:', data.enabled ? 'ENABLED' : 'DISABLED', 'Intensity:', data.intensity);
          break;

        case 'master':
          // Master controls - handle strobe
          if (data.strobe !== undefined) {
            strobeActiveRef.current = data.strobe;
            if (data.strobe) {
              strobeStateRef.current = true; // Start with ON
              strobeColorIndexRef.current = 0;
              strobeTimerRef.current = 0;
              strobeAllowedRef.current = true; // Reset allowed flag
              console.log('⚡ STROBE ACTIVATED (Moving Heads)!');
            } else {
              console.log('⚡ STROBE DEACTIVATED (Moving Heads)');
            }
          }
          if (data.strobeTriggerMode !== undefined) {
            strobeTriggerModeRef.current = data.strobeTriggerMode;
            console.log('⚡ STROBE TRIGGER MODE (Moving Heads):', data.strobeTriggerMode);
          }
          break;

        case 'fog':
          // Fog trigger - not handled by moving heads
          break;

        case 'darkBeat':
          // Dark Beat: Complete blackout for dramatic effect
          darkBeatActiveRef.current = true;
          darkBeatEndTimeRef.current = Date.now() + (data.duration || 2000);
          console.log('🌑 DARK-BEAT activated for', data.duration || 2000, 'ms');
          break;
      }
    };

    window.addEventListener('lightControl', handleLightControl);
    return () => {
      window.removeEventListener('lightControl', handleLightControl);
    };
  }, [isActive]);

  // Listen to Lightshow Reset event (when song changes)
  useEffect(() => {
    const handleReset = () => {
      console.log('🔄 Moving Heads: Resetting state for new song');
      console.log('   Before reset - isWarmup:', isWarmupPhaseRef.current);

      // Reset warm-up phase
      isWarmupPhaseRef.current = true;
      // Reset beat counters
      setBeatCount(0);
      lastBeatTimeRef.current = 0;
      beatIntervalRef.current = 500;
      speedMultiplierRef.current = 1;
      // Reset strobe
      strobeActiveRef.current = false;
      strobeStateRef.current = false;
      strobeAllowedRef.current = true;
      // Reset dark beat
      darkBeatActiveRef.current = false;
      // Reset beat flash
      beatFlashRef.current = 0;
      // Reset to first mode
      currentModeIndexRef.current = 0;
      // CRITICAL: Deactivate all beams immediately
      beamPositionsRef.current.forEach(beam => {
        beam.isActive = false;
      });

      console.log('   After reset - all beams deactivated, warm-up phase reset');
    };

    window.addEventListener('lightshowReset', handleReset);
    return () => {
      window.removeEventListener('lightshowReset', handleReset);
    };
  }, []); // ✅ FIX: Keine Dependencies - Event Listener bleibt stabil

  // Canvas animation for moving head beams
  useEffect(() => {
    if (!isActive || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check for Dark Beat (blackout effect)
      if (darkBeatActiveRef.current && Date.now() < darkBeatEndTimeRef.current) {
        // Dark Beat is active - skip all rendering (complete blackout)
        animationRef.current = requestAnimationFrame(draw);
        return;
      } else if (darkBeatActiveRef.current) {
        // Dark Beat has ended
        darkBeatActiveRef.current = false;
        console.log('🌟 DARK-BEAT ended, lights back on');
      }

      // ======================================================
      // STROBE EFFECT - ENHANCED WITH BPM SYNC & INTENSITY!
      // ======================================================
      if (strobeActiveRef.current) {
        // Check if strobe is allowed (for beat-based triggers)
        const isContinuous = strobeTriggerModeRef.current === 'continuous';
        const canStrobe = isContinuous || strobeAllowedRef.current;

        if (!canStrobe) {
          // Strobe is not allowed right now (waiting for beat trigger) - skip rendering
          animationRef.current = requestAnimationFrame(draw);
          return;
        }

        // Calculate strobe speed based on BPM and Auto Intensity
        // CHILL = 4 Hz (slow), MITTEL = 8 Hz, EXTREM = 16 Hz (crazy fast!)
        const baseStrobeFrequency = 4 + (autoIntensityRef.current * 12); // 4-16 Hz
        const strobeInterval = 1000 / (baseStrobeFrequency * 2); // /2 because we have ON and OFF states

        strobeTimerRef.current += 16.67; // Approx 60fps frame time

        if (strobeTimerRef.current >= strobeInterval) {
          strobeTimerRef.current = 0;
          strobeStateRef.current = !strobeStateRef.current; // Toggle ON/OFF

          // Change color on every ON state
          if (strobeStateRef.current) {
            strobeColorIndexRef.current = (strobeColorIndexRef.current + 1) % 8;
          }

          // For beat-based triggers: Disable after one complete cycle
          if (!isContinuous && !strobeStateRef.current) {
            // After a full flash (ON->OFF), disable until next beat
            const strobeDuration = 500; // Duration of one strobe burst in ms
            if (strobeTimerRef.current >= strobeDuration) {
              strobeAllowedRef.current = false;
            }
          }
        }

        if (!strobeStateRef.current) {
          // STROBE OFF - Complete darkness (skip all beam rendering)
          animationRef.current = requestAnimationFrame(draw);
          return;
        }
        // If STROBE ON, beams will render with full intensity below
      }

      // Fade out beat flash
      if (beatFlashRef.current > 0) {
        beatFlashRef.current = Math.max(0, beatFlashRef.current - 0.02);
      }

      // Get current lighting mode for intensity
      const currentMode = lightingModes[currentModeIndexRef.current];
      // Use manual intensity if in manual mode, otherwise use mode intensity
      const effectiveIntensity = autoModeRef.current ? currentMode.intensity : manualIntensityRef.current;

      // ======================================================
      // COMPREHENSIVE SPEED OPTIMIZATION FOR MOVING HEADS (Option A)
      // ======================================================

      // 1. BPM-based speed multiplier (0.3x - 2.5x)
      const bpmSpeedMultiplier = speedMultiplierRef.current;

      // 2. Auto Intensity speed boost (CHILL = 0.3x, MITTEL = 1.0x, EXTREM = 2.0x) - LANGSAMER!
      const intensitySpeedMultiplier = 0.3 + (autoIntensityRef.current * 1.7); // 0.3 - 2.0x

      // 3. Mode-specific speed multiplier - ALLES LANGSAMER & KOORDINIERTER!
      let modeSpeedMultiplier = 1.0;
      switch (currentMode.name) {
        case 'CHASE':
        case 'RANDOM':
          modeSpeedMultiplier = 1.3; // Schnell, aber kontrolliert
          break;
        case 'BOUNCE':
        case 'ALTERNATE':
          modeSpeedMultiplier = 0.9; // Gemäßigt
          break;
        case 'DUAL_OUTER':
        case 'DUAL_INNER':
        case 'DIAGONAL_1':
        case 'DIAGONAL_2':
          modeSpeedMultiplier = 0.7; // Langsam & smooth
          break;
        case 'ALL':
          modeSpeedMultiplier = 0.5; // Sehr langsam & majestätisch
          break;
        case 'BLACKOUT':
          modeSpeedMultiplier = 0.0; // Keine Bewegung
          break;
      }

      // COMBINE ALL MULTIPLIERS for maximum dynamics!
      const totalBeamSpeedMultiplier = bpmSpeedMultiplier * intensitySpeedMultiplier * modeSpeedMultiplier;
      const baseAngleSpeed = 0.03; // Base transition speed - LANGSAMER! (war 0.05)
      const beamAngleSpeed = baseAngleSpeed * Math.min(totalBeamSpeedMultiplier, 3.0); // Cap at 3x for smoother movement (war 5x)

      // Draw each moving head beam (only if active in current mode)
      beamPositionsRef.current.forEach((beam, index) => {
        // Skip inactive beams
        if (!beam.isActive) return;

        // ENHANCED smooth angle transition with SPEED MULTIPLIERS!
        const angleDiff = beam.targetAngle - beam.angle;
        beam.angle += angleDiff * beamAngleSpeed;

        // Calculate beam start position (relative to canvas)
        // lightingRig position changes based on viewport width:
        // Desktop (>768px): left: 10%, right: 10% → width = 80%, starts at 10%
        // Mobile (<=768px): left: 5%, right: 5% → width = 90%, starts at 5%
        const isMobile = canvas.width <= 768;
        const rigLeft = canvas.width * (isMobile ? 0.05 : 0.1);
        const rigWidth = canvas.width * (isMobile ? 0.9 : 0.8);
        const startX = rigLeft + (rigWidth * beam.x);

        // Y position - pixel-perfect alignment with moving head lens center
        const startY = 128;

        // Calculate beam end position - jetzt BIS ZUM BODEN (100% height!)
        const beamLength = canvas.height * 1.1; // Länger, damit er wirklich bis zur Crowd reicht
        const radians = (beam.angle * Math.PI) / 180;
        const endX = startX + Math.sin(radians) * beamLength;
        const endY = startY + Math.cos(radians) * beamLength;

        // Save endX position for crowd lighting calculation (as percentage)
        beam.endX = (endX / canvas.width) * 100;

        // Create gradient for beam
        // Beams are only visible when there's an active beat flash
        // Intensity varies by lighting mode (more subtle)
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

        // STROBE BOOST: If strobe is active and ON, render beams at FULL intensity!
        const strobeBoost = (strobeActiveRef.current && strobeStateRef.current) ? 1.0 : beatFlashRef.current;
        const baseOpacity = strobeBoost * effectiveIntensity; // Use effective intensity (auto or manual)

        // STROBE COLOR CHANGE: Use cycling colors during strobe
        let beamColor = beam.color;
        if (strobeActiveRef.current && strobeStateRef.current) {
          const strobeColors = ['#ffffff', '#ff6b35', '#e63946', '#06ffa5', '#a855f7', '#ffd60a', '#06b6d4', '#ec4899'];
          beamColor = strobeColors[strobeColorIndexRef.current];
        }

        gradient.addColorStop(0, `${beamColor}${Math.floor(baseOpacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${beamColor}${Math.floor(baseOpacity * 0.5 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');

        // Draw beam cone from fixture
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX - 10, startY);  // Narrower start to match fixture size
        ctx.lineTo(startX + 10, startY);
        ctx.lineTo(endX + 80, endY);      // Wider spread at the bottom
        ctx.lineTo(endX - 80, endY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add glow effect only on strong beats and when intensity is high (OR during strobe!)
        if ((beatFlashRef.current > 0.7 && effectiveIntensity > 0.5) || (strobeActiveRef.current && strobeStateRef.current)) {
          ctx.shadowBlur = strobeActiveRef.current ? 40 : 20; // Extra glow during strobe
          ctx.shadowColor = beamColor; // Use strobe color if active
          ctx.fill();
        }
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={styles.stageEquipment}>
      {/* Canvas for moving head light beams */}
      <canvas
        ref={canvasRef}
        className={styles.beamCanvas}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />

      {/* Left PA Speaker Stack */}
      <div className={`${styles.speakerStack} ${styles.left}`}>
        {/* Line Array Top */}
        <div className={styles.lineArray}>
          {[...Array(3)].map((_, i) => (
            <div key={`left-array-${i}`} className={styles.arrayUnit}>
              <div className={styles.horn} />
              <div className={`${styles.woofer} ${bassHit ? styles.bassHit : ''}`}>
                <div className={styles.cone} />
                <div className={styles.dustcap} />
              </div>
              <div className={`${styles.ledStrip} ${beatPulse ? styles.pulse : ''}`} />
            </div>
          ))}
        </div>

        {/* Subwoofer */}
        <div className={styles.subwoofer}>
          <div className={`${styles.subwooferCone} ${bassHit ? styles.bassHit : ''}`}>
            <div className={styles.subCone} />
            <div className={styles.subDustcap} />
          </div>
          <div className={styles.portHoles}>
            <div className={styles.port} />
            <div className={styles.port} />
          </div>
          <div className={`${styles.ledBar} ${beatPulse ? styles.pulse : ''}`} />
        </div>

        {/* Speaker Stand/Cable */}
        <div className={styles.speakerStand}>
          <div className={styles.cable} />
        </div>
      </div>

      {/* Right PA Speaker Stack */}
      <div className={`${styles.speakerStack} ${styles.right}`}>
        {/* Line Array Top */}
        <div className={styles.lineArray}>
          {[...Array(3)].map((_, i) => (
            <div key={`right-array-${i}`} className={styles.arrayUnit}>
              <div className={styles.horn} />
              <div className={`${styles.woofer} ${bassHit ? styles.bassHit : ''}`}>
                <div className={styles.cone} />
                <div className={styles.dustcap} />
              </div>
              <div className={`${styles.ledStrip} ${beatPulse ? styles.pulse : ''}`} />
            </div>
          ))}
        </div>

        {/* Subwoofer */}
        <div className={styles.subwoofer}>
          <div className={`${styles.subwooferCone} ${bassHit ? styles.bassHit : ''}`}>
            <div className={styles.subCone} />
            <div className={styles.subDustcap} />
          </div>
          <div className={styles.portHoles}>
            <div className={styles.port} />
            <div className={styles.port} />
          </div>
          <div className={`${styles.ledBar} ${beatPulse ? styles.pulse : ''}`} />
        </div>

        {/* Speaker Stand/Cable */}
        <div className={styles.speakerStand}>
          <div className={styles.cable} />
        </div>
      </div>

      {/* Top Truss (Moving heads are now rendered on canvas) */}
      <div className={styles.lightingRig}>
        <div className={styles.truss}>
          {/* Physical fixtures for moving heads */}
          {[...Array(4)].map((_, i) => {
            const positions = [0.15, 0.35, 0.65, 0.85];
            return (
              <div
                key={`fixture-${i}`}
                className={styles.lightFixture}
                style={{
                  left: `${positions[i] * 100}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className={styles.fixtureBody} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Monitor Wedges */}
      <div className={styles.monitors}>
        <div className={`${styles.monitorWedge} ${styles.leftMonitor}`}>
          <div className={`${styles.monitorSpeaker} ${beatPulse ? styles.pulse : ''}`} />
        </div>
        <div className={`${styles.monitorWedge} ${styles.rightMonitor}`}>
          <div className={`${styles.monitorSpeaker} ${beatPulse ? styles.pulse : ''}`} />
        </div>
      </div>

      {/* Crowd/Audience */}
      <div className={styles.crowd}>
        {[...Array(12)].map((_, i) => {
          // Single row - all people side by side
          const leftPos = 4 + (i * 8); // Evenly spaced: 4%, 12%, 20%, 28%, ..., 92%

          // Slight height variation for realism
          const baseHeight = 85; // Base height in %
          const heightVariation = -5 + (Math.random() * 10); // -5% to +5%
          const height = baseHeight + heightVariation;

          // Random animation delay for natural movement
          const animationDelay = Math.random() * 0.8;

          // Crowd behavior: 33% klatschen über Kopf, 33% klatschen vor Körper, 33% arme hoch
          const behavior = i % 3; // 0 = über Kopf, 1 = vor Körper, 2 = arme hoch
          const isClappingOverhead = behavior === 0;
          const isClappingFront = behavior === 1;

          // Calculate which beam is hitting this crowd person
          // Beams sind jetzt BEWEGLICH - wir nutzen die tatsächliche endX Position!
          const beamSpread = 15; // Beam-Streuung am Boden (ca. 15% Breite pro Beam)
          let hitByBeam = -1;
          let beamColor = '#000000';
          let beamDistance = Infinity;

          beamPositionsRef.current.forEach((beam, beamIndex) => {
            if (!beam.isActive || !beam.endX) return;

            // Beam-Endposition (wo der Strahl auf den Boden trifft)
            const beamCenterPos = beam.endX; // Jetzt die ECHTE Position am Boden!
            const beamStart = beamCenterPos - beamSpread / 2;
            const beamEnd = beamCenterPos + beamSpread / 2;

            // Check if crowd person is within beam range
            if (leftPos >= beamStart && leftPos <= beamEnd) {
              // Berechne Distanz vom Beam-Zentrum (für realistischeres Licht)
              const distance = Math.abs(leftPos - beamCenterPos);

              // Nimm den nächsten Beam (falls mehrere überlappen)
              if (distance < beamDistance) {
                hitByBeam = beamIndex;
                beamColor = beam.color;
                beamDistance = distance;
              }
            }
          });

          // Apply lighting effect if hit by beam - REALISTISCHER!
          // Licht ist stärker in der Mitte, schwächer am Rand
          const lightIntensity = hitByBeam !== -1
            ? Math.max(0.3, 1 - (beamDistance / (beamSpread / 2))) // 0.3 bis 1.0
            : 0;

          const crowdFilter = hitByBeam !== -1
            ? `drop-shadow(0 0 ${15 * lightIntensity}px ${beamColor}) drop-shadow(0 0 ${30 * lightIntensity}px ${beamColor}) brightness(${0.4 + lightIntensity})`
            : 'brightness(0.4)'; // Default dark silhouette

          return (
            <div
              key={`crowd-${i}`}
              className={`${styles.crowdPerson} ${beatPulse ? styles.dancing : ''}`}
              style={{
                left: `${leftPos}%`,
                bottom: '0%',
                height: `${height}%`,
                animationDelay: `${animationDelay}s`,
                filter: crowdFilter,
                transition: 'filter 0.3s ease-out'
              }}
            >
              <div className={`${styles.crowdHead} ${beatPulse ? styles.nodding : ''}`} />
              <div className={styles.crowdBody} />
              <div className={`${styles.crowdArm} ${styles.leftArm} ${
                isClappingOverhead ? styles.clappingOverhead :
                isClappingFront ? styles.clapping :
                styles.armUp
              }`} />
              <div className={`${styles.crowdArm} ${styles.rightArm} ${
                isClappingOverhead ? styles.clappingOverhead :
                isClappingFront ? styles.clapping :
                styles.armUp
              }`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(StageEquipment);