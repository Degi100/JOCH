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
  const beamPositionsRef = useRef<Array<{x: number, y: number, angle: number, targetAngle: number, color: string, isActive: boolean, endX?: number, trussPosition: 'top' | 'left' | 'right'}>>([]);
  const beatFlashRef = useRef<number>(0);
  const darkBeatActiveRef = useRef<boolean>(false);
  const darkBeatEndTimeRef = useRef<number>(0);
  const speedMultiplierRef = useRef<number>(1); // BPM-based speed multiplier
  const beatIntervalRef = useRef<number>(500); // Standard: 120 BPM = 500ms
  const lastBeatTimeRef = useRef<number>(0);

  // Text Position State (from LED Screen) - for FOLLOW_TEXT mode
  const textPositionXRef = useRef<number>(50); // 0-100% horizontal
  const textPositionYRef = useRef<number>(50); // 0-100% vertical

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

  // Lighting modes for dynamic show - NOW WITH 12 MOVING HEADS!
  // Indices: 0-3 = Top, 4-7 = Left, 8-11 = Right
  const lightingModes = [
    { name: 'BLACKOUT', activeBeams: [], intensity: 0 },

    // TOP TRUSS ONLY MODES
    { name: 'TOP_OUTER', activeBeams: [0, 3], intensity: 0.5 },            // Top außen
    { name: 'TOP_INNER', activeBeams: [1, 2], intensity: 0.5 },            // Top innen
    { name: 'TOP_ALL', activeBeams: [0, 1, 2, 3], intensity: 0.6 },        // Top alle

    // SIDE TRUSS ONLY MODES
    { name: 'SIDES_ONLY', activeBeams: [4, 5, 6, 7, 8, 9, 10, 11], intensity: 0.6 },  // Nur Seiten
    { name: 'LEFT_ONLY', activeBeams: [4, 5, 6, 7], intensity: 0.5 },      // Nur links
    { name: 'RIGHT_ONLY', activeBeams: [8, 9, 10, 11], intensity: 0.5 },   // Nur rechts

    // COMBINED MODES
    { name: 'WALLS', activeBeams: [0, 3, 4, 7, 8, 11], intensity: 0.65 },  // Äußere Wand
    { name: 'CENTER_FOCUS', activeBeams: [1, 2, 5, 6, 9, 10], intensity: 0.6 }, // Zentrum
    { name: 'DIAGONAL_CROSS', activeBeams: [0, 2, 4, 6, 8, 10], intensity: 0.65 }, // Diagonales Kreuz

    // DYNAMIC MODES
    { name: 'CHASE', activeBeams: [0], intensity: 0.65 },                   // Chase Links→Top→Rechts (ein Beam)
    { name: 'CHASE_TRAIL', activeBeams: [0], intensity: 0.65 },             // Chase mit Trail (alle bleiben an)
    { name: 'BOUNCE', activeBeams: [0, 3], intensity: 0.6 },                // Ping-Pong
    { name: 'ALTERNATE', activeBeams: [0, 3], intensity: 0.55 },            // Toggle
    { name: 'RANDOM', activeBeams: [0], intensity: 0.65 },                  // Random
    { name: 'FOLLOW_TEXT', activeBeams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], intensity: 0.7 }, // Follow LED Screen Text! 🎯

    // ADVANCED ROTATION MODES
    { name: 'SPIN_360', activeBeams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], intensity: 0.7 }, // 360° Sync Rotation!
    { name: 'SPIN_WAVE', activeBeams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], intensity: 0.75 }, // Wellenförmige Rotation!
    { name: 'MIRROR_SYNC', activeBeams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], intensity: 0.7 }, // Links/Rechts Spiegelung
    { name: 'CIRCLE_IN_OUT', activeBeams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], intensity: 0.7 }, // Kreisbewegung rein/raus
    { name: 'X_CROSS', activeBeams: [0, 3, 4, 7, 8, 11], intensity: 0.65 }, // X-förmiges Kreuz in Mitte
    { name: 'FAN_OUT', activeBeams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], intensity: 0.7 }, // Fächereffekt

    // FULL POWER
    { name: 'ALL', activeBeams: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], intensity: 0.8 }, // Alle 12!
  ];
  const currentModeIndexRef = useRef(0);
  const chasePositionRef = useRef(0); // Für Chase Mode: welcher Beam ist gerade aktiv (0-11)
  // Chase Order: Links (unten→oben: MH8→7→6→5) → Top (links→rechts: MH1→2→3→4) → Rechts (oben→unten: MH9→10→11→12)
  const chaseOrderRef = useRef([7, 6, 5, 4, 0, 1, 2, 3, 8, 9, 10, 11]); // Indices: 7,6,5,4=Left(bottom-up), 0,1,2,3=Top(L-R), 8,9,10,11=Right(top-down)
  const chaseTrailRef = useRef<number[]>([]); // Für CHASE_TRAIL: Beams die bereits aktiviert wurden
  const alternateStateRef = useRef(false); // Für Alternate: false = outer, true = inner
  const spinRotationRef = useRef(0); // Für SPIN_360: aktuelle Rotation in Grad (0-360)
  const waveOffsetRef = useRef(0); // Für SPIN_WAVE: Wellenversatz
  const circleDirectionRef = useRef(1); // Für CIRCLE_IN_OUT: 1 = nach außen, -1 = nach innen
  const circleRadiusRef = useRef(0); // Für CIRCLE_IN_OUT: Aktueller Radius
  const fanSpreadRef = useRef(0); // Für FAN_OUT: Fächerwinkel (0-90°)

  // Initialize beam positions for 12 moving heads (4 top, 4 left, 4 right)
  useEffect(() => {
    // All moving heads start with the same color (synchronized)
    const initialColor = colorPaletteRef.current[0];
    const initialMode = lightingModes[0];
    const positions = [
      // Top Truss - 4 Moving Heads (Index 0-3)
      { x: 0.15, y: 0, angle: 45, targetAngle: 45, color: initialColor, isActive: initialMode.activeBeams.includes(0), trussPosition: 'top' as const },
      { x: 0.35, y: 0, angle: 30, targetAngle: 30, color: initialColor, isActive: initialMode.activeBeams.includes(1), trussPosition: 'top' as const },
      { x: 0.65, y: 0, angle: -30, targetAngle: -30, color: initialColor, isActive: initialMode.activeBeams.includes(2), trussPosition: 'top' as const },
      { x: 0.85, y: 0, angle: -45, targetAngle: -45, color: initialColor, isActive: initialMode.activeBeams.includes(3), trussPosition: 'top' as const },

      // Left Vertical Truss - 4 Moving Heads (Index 4-7)
      { x: 0.05, y: 0.15, angle: 60, targetAngle: 60, color: initialColor, isActive: initialMode.activeBeams.includes(4), trussPosition: 'left' as const },
      { x: 0.05, y: 0.35, angle: 50, targetAngle: 50, color: initialColor, isActive: initialMode.activeBeams.includes(5), trussPosition: 'left' as const },
      { x: 0.05, y: 0.55, angle: 40, targetAngle: 40, color: initialColor, isActive: initialMode.activeBeams.includes(6), trussPosition: 'left' as const },
      { x: 0.05, y: 0.75, angle: 30, targetAngle: 30, color: initialColor, isActive: initialMode.activeBeams.includes(7), trussPosition: 'left' as const },

      // Right Vertical Truss - 4 Moving Heads (Index 8-11)
      { x: 0.95, y: 0.15, angle: -60, targetAngle: -60, color: initialColor, isActive: initialMode.activeBeams.includes(8), trussPosition: 'right' as const },
      { x: 0.95, y: 0.35, angle: -50, targetAngle: -50, color: initialColor, isActive: initialMode.activeBeams.includes(9), trussPosition: 'right' as const },
      { x: 0.95, y: 0.55, angle: -40, targetAngle: -40, color: initialColor, isActive: initialMode.activeBeams.includes(10), trussPosition: 'right' as const },
      { x: 0.95, y: 0.75, angle: -30, targetAngle: -30, color: initialColor, isActive: initialMode.activeBeams.includes(11), trussPosition: 'right' as const }
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
        // CHASE MODE: Links→Top→Rechts (nur ein Beam aktiv)
        chasePositionRef.current = (chasePositionRef.current + 1) % 12;
        const currentBeamIndex = chaseOrderRef.current[chasePositionRef.current];

        // Nur der aktuelle Chase-Beam ist aktiv
        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = index === currentBeamIndex;
        });

        console.log('🏃 CHASE: Position', chasePositionRef.current, '→ Beam', currentBeamIndex + 1, 'active');
      }
      else if (currentMode.name === 'CHASE_TRAIL') {
        // CHASE_TRAIL MODE: Links→Top→Rechts (alle bleiben an - Trail-Effekt!)
        // WICHTIG: Beam ERST holen, DANN Position erhöhen (sonst wird erster Beam übersprungen!)
        const currentBeamIndex = chaseOrderRef.current[chasePositionRef.current];
        chasePositionRef.current = (chasePositionRef.current + 1) % 12;

        // Füge aktuellen Beam zum Trail hinzu (nur wenn noch nicht alle 12 aktiv sind)
        if (!chaseTrailRef.current.includes(currentBeamIndex)) {
          chaseTrailRef.current.push(currentBeamIndex);
        }

        // Wenn alle 12 Beams erreicht sind, stoppe den Chase (bleiben alle an!)
        // KEIN AUTO-RESET - Beams bleiben dauerhaft an bis Mode-Wechsel!
        if (chaseTrailRef.current.length >= 12) {
          // Setze Position auf 11, damit sie nicht weiter hochzählt
          chasePositionRef.current = 11;
        }

        // WICHTIG: Setze ALLE Beams im Trail auf Center-Focus!
        // (Muss jedes Mal gemacht werden, nicht nur beim Hinzufügen!)
        beamPositionsRef.current.forEach((beam, index) => {
          if (chaseTrailRef.current.includes(index)) {
            beam.isActive = true;

            // Set angle to point toward center based on truss position
            if (beam.trussPosition === 'left') {
              beam.angle = 45;        // Point right toward center
              beam.targetAngle = 45;
            } else if (beam.trussPosition === 'top') {
              beam.angle = 0;         // Point straight down to center
              beam.targetAngle = 0;
            } else if (beam.trussPosition === 'right') {
              beam.angle = -45;       // Point left toward center
              beam.targetAngle = -45;
            }
          } else {
            beam.isActive = false;
          }
        });

        console.log('🏃✨ CHASE_TRAIL: Position', chasePositionRef.current, '→ Beam', currentBeamIndex + 1, 'added (Trail:', chaseTrailRef.current.length, 'beams)');
      }
      else if (currentMode.name === 'BOUNCE') {
        // BOUNCE MODE: Ping-Pong zwischen verschiedenen Gruppen
        // Pattern: Top Outer → Top Inner → Left → Right (zyklisch)
        const pattern = [
          [0, 3],              // Top Outer
          [1, 2],              // Top Inner
          [4, 5, 6, 7],        // Left Side
          [8, 9, 10, 11]       // Right Side
        ];
        chasePositionRef.current = (chasePositionRef.current + 1) % pattern.length;
        const activeBeams = pattern[chasePositionRef.current];

        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = activeBeams.includes(index);
        });

        console.log('🏓 BOUNCE: Group', chasePositionRef.current, 'Beams', activeBeams.join('+'), 'active');
      }
      else if (currentMode.name === 'ALTERNATE') {
        // ALTERNATE MODE: Toggle zwischen Top und Sides
        alternateStateRef.current = !alternateStateRef.current;
        const activeBeams = alternateStateRef.current
          ? [0, 1, 2, 3]                      // Top Truss
          : [4, 5, 6, 7, 8, 9, 10, 11];       // Side Trusses

        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = activeBeams.includes(index);
        });

        console.log('🔄 ALTERNATE:', alternateStateRef.current ? 'TOP' : 'SIDES', 'active');
      }
      else if (currentMode.name === 'RANDOM') {
        // RANDOM MODE: Zufällig 3-6 Beams aktivieren aus allen 12
        const numBeams = Math.floor(Math.random() * 4) + 3; // 3-6 Beams
        const availableBeams = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        const randomBeams: number[] = [];

        for (let i = 0; i < numBeams; i++) {
          const randomIndex = Math.floor(Math.random() * availableBeams.length);
          randomBeams.push(availableBeams[randomIndex]);
          availableBeams.splice(randomIndex, 1);
        }

        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = randomBeams.includes(index);
        });

        console.log('🎲 RANDOM:', numBeams, 'Beams', randomBeams.join('+'), 'active');
      }
      else if (currentMode.name === 'SPIN_360') {
        // SPIN_360 MODE: Alle Moving Heads drehen sich synchron um 360 Grad
        const rotationSpeed = 30 + (autoIntensityRef.current * 60); // 30-90 degrees per beat
        spinRotationRef.current = (spinRotationRef.current + rotationSpeed) % 360;

        beamPositionsRef.current.forEach((beam) => {
          beam.isActive = true;
        });

        console.log('🌀 SPIN_360: Rotation', Math.round(spinRotationRef.current), '°');
      }
      else if (currentMode.name === 'SPIN_WAVE') {
        // SPIN_WAVE MODE: Wellenförmige Rotation - jeder Beam hat versetzten Offset!
        const rotationSpeed = 30 + (autoIntensityRef.current * 60);
        waveOffsetRef.current = (waveOffsetRef.current + rotationSpeed) % 360;

        beamPositionsRef.current.forEach((beam) => {
          beam.isActive = true;
        });

        console.log('🌊 SPIN_WAVE: Offset', Math.round(waveOffsetRef.current), '°');
      }
      else if (currentMode.name === 'MIRROR_SYNC') {
        // MIRROR_SYNC MODE: Links und Rechts spiegeln sich
        const rotationSpeed = 30 + (autoIntensityRef.current * 60);
        spinRotationRef.current = (spinRotationRef.current + rotationSpeed) % 360;

        beamPositionsRef.current.forEach((beam) => {
          beam.isActive = true;
        });

        console.log('🪞 MIRROR_SYNC: Rotation', Math.round(spinRotationRef.current), '°');
      }
      else if (currentMode.name === 'CIRCLE_IN_OUT') {
        // CIRCLE_IN_OUT MODE: Kreisbewegung nach innen/außen
        const maxRadius = 90; // Max 90° vom Zentrum
        const radiusChange = 10 + (autoIntensityRef.current * 20); // 10-30° per beat

        circleRadiusRef.current += circleDirectionRef.current * radiusChange;

        // Umkehren wenn Grenze erreicht
        if (circleRadiusRef.current >= maxRadius) {
          circleRadiusRef.current = maxRadius;
          circleDirectionRef.current = -1; // Nach innen
        } else if (circleRadiusRef.current <= 0) {
          circleRadiusRef.current = 0;
          circleDirectionRef.current = 1; // Nach außen
        }

        beamPositionsRef.current.forEach((beam) => {
          beam.isActive = true;
        });

        console.log('⭕ CIRCLE_IN_OUT: Radius', Math.round(circleRadiusRef.current), '°', circleDirectionRef.current > 0 ? 'OUT' : 'IN');
      }
      else if (currentMode.name === 'X_CROSS') {
        // X_CROSS MODE: Nur äußere Beams bilden X in der Mitte
        const rotationSpeed = 20 + (autoIntensityRef.current * 40); // Langsamer
        spinRotationRef.current = (spinRotationRef.current + rotationSpeed) % 360;

        beamPositionsRef.current.forEach((beam, index) => {
          // Nur äußere beams: 0, 3, 4, 7, 8, 11
          beam.isActive = currentMode.activeBeams.includes(index);
        });

        console.log('❌ X_CROSS: Rotation', Math.round(spinRotationRef.current), '°');
      }
      else if (currentMode.name === 'FAN_OUT') {
        // FAN_OUT MODE: Fächereffekt - öffnet und schließt sich
        const spreadChange = 5 + (autoIntensityRef.current * 15); // 5-20° per beat
        fanSpreadRef.current = (fanSpreadRef.current + spreadChange) % 180; // 0-180° spread

        beamPositionsRef.current.forEach((beam) => {
          beam.isActive = true;
        });

        console.log('🌟 FAN_OUT: Spread', Math.round(fanSpreadRef.current), '°');
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

      // ADVANCED ROTATION MODES: Special angle calculations
      if (currentMode.name === 'FOLLOW_TEXT') {
        // FOLLOW_TEXT: Alle Moving Heads zielen auf die Text-Position! 🎯
        beamPositionsRef.current.forEach((beam) => {
          if (beam.isActive) {
            // Calculate angle needed to point at text position
            // Text position is 0-100% of screen, beam position is also 0-100% (beam.x or beam.y)
            const textX = textPositionXRef.current; // 0-100%
            const textY = textPositionYRef.current; // 0-100%

            let targetAngle = 0;

            if (beam.trussPosition === 'top') {
              // Top truss: beams point down and left/right
              // beam.x is horizontal position (0-100%), textX is target horizontal position
              const horizontalDiff = textX - (beam.x * 100); // Difference in %
              // Convert to angle: -90° = far left, 0° = center, +90° = far right
              targetAngle = horizontalDiff * 0.9; // Scale factor for realistic angles
            } else if (beam.trussPosition === 'left') {
              // Left truss: beams point right and up/down
              // beam.y is vertical position, textY is target vertical position
              const verticalDiff = textY - (beam.y * 100); // Difference in %
              // Left side points right (positive angles), adjust based on vertical position
              targetAngle = 45 + (verticalDiff * 0.5); // Base angle + vertical adjustment
            } else if (beam.trussPosition === 'right') {
              // Right truss: beams point left and up/down
              const verticalDiff = textY - (beam.y * 100);
              // Right side points left (negative angles), adjust based on vertical position
              targetAngle = -45 - (verticalDiff * 0.5); // Base angle + vertical adjustment
            }

            // Clamp angles to realistic range (-90 to +90 degrees)
            beam.targetAngle = Math.max(-90, Math.min(90, targetAngle));
          }
        });
      } else if (currentMode.name === 'SPIN_360') {
        // SPIN_360: Alle Beams drehen sich synchron
        beamPositionsRef.current.forEach((beam) => {
          if (beam.isActive) {
            let angle = spinRotationRef.current;
            if (angle > 180) angle = angle - 360;
            beam.targetAngle = angle;
          }
        });
      } else if (currentMode.name === 'SPIN_WAVE') {
        // SPIN_WAVE: Wellenförmiger Offset - jeder Beam ist 30° versetzt
        beamPositionsRef.current.forEach((beam, index) => {
          if (beam.isActive) {
            const waveOffset = index * 30; // 30° Versatz pro Beam
            let angle = (waveOffsetRef.current + waveOffset) % 360;
            if (angle > 180) angle = angle - 360;
            beam.targetAngle = angle;
          }
        });
      } else if (currentMode.name === 'MIRROR_SYNC') {
        // MIRROR_SYNC: Links und Rechts spiegeln sich
        beamPositionsRef.current.forEach((beam, index) => {
          if (beam.isActive) {
            let angle = spinRotationRef.current;
            if (angle > 180) angle = angle - 360;

            // Rechte Seite (Index 2,3,8-11) = invertiert
            if (index >= 2 && index <= 3) {
              beam.targetAngle = -angle; // Top right
            } else if (index >= 8 && index <= 11) {
              beam.targetAngle = -angle; // Right truss
            } else {
              beam.targetAngle = angle; // Left side normal
            }
          }
        });
      } else if (currentMode.name === 'CIRCLE_IN_OUT') {
        // CIRCLE_IN_OUT: Kreisbewegung basierend auf Radius
        beamPositionsRef.current.forEach((beam, index) => {
          if (beam.isActive) {
            // Jeder Beam hat festen Winkel, aber variabler Radius (Abstand vom Zentrum)
            const baseAngles = [45, 30, -30, -45, 60, 50, 40, 30, -60, -50, -40, -30];
            const baseAngle = baseAngles[index];

            // Radius beeinflusst den Winkel (größerer Radius = extremerer Winkel)
            const radiusFactor = circleRadiusRef.current / 90; // 0.0 - 1.0
            beam.targetAngle = baseAngle * (0.5 + radiusFactor * 0.5); // 50%-100% vom baseAngle
          }
        });
      } else if (currentMode.name === 'X_CROSS') {
        // X_CROSS: Beams treffen sich in der Mitte als X
        beamPositionsRef.current.forEach((beam, index) => {
          if (beam.isActive) {
            // Top outer (0,3), Left outer (4,7), Right outer (8,11) zeigen zur Mitte
            if (index === 0 || index === 4) {
              beam.targetAngle = 20; // Links → Mitte
            } else if (index === 3 || index === 11) {
              beam.targetAngle = -20; // Rechts → Mitte
            } else if (index === 7) {
              beam.targetAngle = 10; // Links unten → Mitte
            } else if (index === 8) {
              beam.targetAngle = -10; // Rechts oben → Mitte
            }
          }
        });
      } else if (currentMode.name === 'FAN_OUT') {
        // FAN_OUT: Fächereffekt - Beams spreizen sich gleichmäßig
        beamPositionsRef.current.forEach((beam, index) => {
          if (beam.isActive) {
            // Verteile Beams gleichmäßig über den Spread-Bereich
            const totalBeams = 12;
            const spreadPerBeam = fanSpreadRef.current / totalBeams;
            const startAngle = -fanSpreadRef.current / 2; // Start bei -90°

            beam.targetAngle = startAngle + (index * spreadPerBeam);
          }
        });
      } else if (currentMode.name !== 'CHASE' && currentMode.name !== 'CHASE_TRAIL') {
        // Normal mode: Random variation based on base angle
        // SKIP für CHASE/CHASE_TRAIL - die haben ihre eigene Winkel-Logik oben!
        beamPositionsRef.current.forEach((beam, index) => {
          if (beam.isActive) {
            let baseAngle = 0;

            // Top Truss (0-3): Left positive, Right negative
            if (index <= 1) {
              baseAngle = 35; // Top left beams
            } else if (index <= 3) {
              baseAngle = -35; // Top right beams
            }
            // Left Truss (4-7): Point right
            else if (index <= 7) {
              baseAngle = 50; // Left side points to center-right
            }
            // Right Truss (8-11): Point left
            else {
              baseAngle = -50; // Right side points to center-left
            }

            beam.targetAngle = baseAngle + (Math.random() - 0.5) * angleVariation;
          }
        });
      }
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

          // Reset CHASE_TRAIL when switching modes
          chaseTrailRef.current = [];
          chasePositionRef.current = 0;

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

  // Listen to LED Screen position updates for FOLLOW_TEXT mode
  useEffect(() => {
    if (!isActive) return;

    const handleLEDControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { positionX, positionY } = customEvent.detail;

      if (positionX !== undefined) {
        textPositionXRef.current = positionX;
        console.log('🎯 Moving Heads: Text X position updated to', positionX.toFixed(0), '%');
      }
      if (positionY !== undefined) {
        textPositionYRef.current = positionY;
        console.log('🎯 Moving Heads: Text Y position updated to', positionY.toFixed(0), '%');
      }
    };

    window.addEventListener('ledControl', handleLEDControl);
    return () => {
      window.removeEventListener('ledControl', handleLEDControl);
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
      // Reset spin rotation
      spinRotationRef.current = 0;
      // Reset new advanced mode refs
      waveOffsetRef.current = 0;
      circleDirectionRef.current = 1;
      circleRadiusRef.current = 0;
      fanSpreadRef.current = 0;
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

      // SPECIAL: Disable strobe for CHASE_TRAIL - beams should stay solid!
      if (strobeActiveRef.current && currentMode.name === 'CHASE_TRAIL') {
        // Temporarily disable strobe for this mode
        strobeActiveRef.current = false;
        // Will be re-enabled when mode changes
      }

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
        case 'CHASE_TRAIL':
        case 'RANDOM':
          modeSpeedMultiplier = 1.3; // Schnell, aber kontrolliert
          break;
        case 'BOUNCE':
        case 'ALTERNATE':
          modeSpeedMultiplier = 0.9; // Gemäßigt
          break;
        case 'FOLLOW_TEXT':
          modeSpeedMultiplier = 1.8; // Sehr schnell & reaktiv für Text-Tracking! 🎯
          break;
        case 'SPIN_360':
          modeSpeedMultiplier = 1.5; // Schnell & flüssig für Rotation
          break;
        case 'SPIN_WAVE':
        case 'MIRROR_SYNC':
          modeSpeedMultiplier = 1.5; // Schnell & flüssig für dynamische Sync-Effekte
          break;
        case 'CIRCLE_IN_OUT':
        case 'FAN_OUT':
          modeSpeedMultiplier = 1.2; // Moderat dynamisch für Radius/Spread-Animationen
          break;
        case 'X_CROSS':
          modeSpeedMultiplier = 0.8; // Langsamer für Präzision beim Kreuz-Pattern
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
      beamPositionsRef.current.forEach((beam) => {
        // Skip inactive beams
        if (!beam.isActive) return;

        // ENHANCED smooth angle transition with SPEED MULTIPLIERS!
        // EXCEPTION: CHASE_TRAIL keeps beams static (no movement)
        if (currentMode.name !== 'CHASE_TRAIL') {
          const angleDiff = beam.targetAngle - beam.angle;
          beam.angle += angleDiff * beamAngleSpeed;
        }

        // Calculate beam start position based on truss position
        let startX = 0;
        let startY = 0;

        if (beam.trussPosition === 'top') {
          // Top Truss - horizontal across top
          const isMobile = canvas.width <= 768;
          const rigLeft = canvas.width * (isMobile ? 0.05 : 0.1);
          const rigWidth = canvas.width * (isMobile ? 0.9 : 0.8);
          startX = rigLeft + (rigWidth * beam.x);
          startY = 128; // Fixed Y at top (matching .lightingRig top: 80px + truss height ~50px)
        } else if (beam.trussPosition === 'left') {
          // Left Vertical Truss
          // CSS: left: 1%, top: 10%, width: 50px
          // Fixture positions: left: 50% of 50px container = 1% + 25px
          startX = canvas.width * 0.01 + 25; // Center of 50px wide truss
          // CSS: top: 10%, height: 85% (bottom: 5%)
          // beam.y is relative position within the truss (0.15, 0.35, 0.55, 0.75)
          const trussTop = canvas.height * 0.10;
          const trussHeight = canvas.height * 0.85; // 10% top to 95% bottom
          startY = trussTop + (trussHeight * beam.y);
        } else if (beam.trussPosition === 'right') {
          // Right Vertical Truss
          // CSS: right: 1%, top: 10%, width: 50px
          startX = canvas.width * 0.99 - 25; // Center of 50px wide truss (right side)
          const trussTop = canvas.height * 0.10;
          const trussHeight = canvas.height * 0.85;
          startY = trussTop + (trussHeight * beam.y);
        }

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

      {/* Left Hanging PA (Line Array) */}
      <div className={`${styles.hangingPA} ${styles.left}`}>
        {/* Rigging Cable */}
        <div className={styles.riggingCable} />

        {/* Line Array (4 boxes hängend) */}
        <div className={styles.lineArrayHanging}>
          {[...Array(4)].map((_, i) => (
            <div key={`left-hanging-${i}`} className={styles.arrayBox}>
              <div className={styles.horn} />
              <div className={`${styles.woofer} ${bassHit ? styles.bassHit : ''}`}>
                <div className={styles.cone} />
                <div className={styles.dustcap} />
              </div>
              <div className={`${styles.ledStrip} ${beatPulse ? styles.pulse : ''}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Right Hanging PA (Line Array) */}
      <div className={`${styles.hangingPA} ${styles.right}`}>
        {/* Rigging Cable */}
        <div className={styles.riggingCable} />

        {/* Line Array (4 boxes hängend) */}
        <div className={styles.lineArrayHanging}>
          {[...Array(4)].map((_, i) => (
            <div key={`right-hanging-${i}`} className={styles.arrayBox}>
              <div className={styles.horn} />
              <div className={`${styles.woofer} ${bassHit ? styles.bassHit : ''}`}>
                <div className={styles.cone} />
                <div className={styles.dustcap} />
              </div>
              <div className={`${styles.ledStrip} ${beatPulse ? styles.pulse : ''}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Top Truss (Moving heads are now rendered on canvas) */}
      <div className={styles.lightingRig}>
        <div className={styles.truss}>
          {/* Physical fixtures for top moving heads */}
          {[...Array(4)].map((_, i) => {
            const positions = [0.15, 0.35, 0.65, 0.85];
            return (
              <div
                key={`fixture-top-${i}`}
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

      {/* Left Vertical Truss */}
      <div className={styles.verticalTrussLeft}>
        <div className={styles.verticalTrussBar} />
        {/* Physical fixtures for left moving heads */}
        {[...Array(4)].map((_, i) => {
          const positions = [0.15, 0.35, 0.55, 0.75]; // Vertical positions - weiter oben
          return (
            <div
              key={`fixture-left-${i}`}
              className={styles.lightFixture}
              style={{
                top: `${positions[i] * 100}%`,
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className={styles.fixtureBody} />
            </div>
          );
        })}
      </div>

      {/* Right Vertical Truss */}
      <div className={styles.verticalTrussRight}>
        <div className={styles.verticalTrussBar} />
        {/* Physical fixtures for right moving heads */}
        {[...Array(4)].map((_, i) => {
          const positions = [0.15, 0.35, 0.55, 0.75]; // Vertical positions - weiter oben
          return (
            <div
              key={`fixture-right-${i}`}
              className={styles.lightFixture}
              style={{
                top: `${positions[i] * 100}%`,
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className={styles.fixtureBody} />
            </div>
          );
        })}
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