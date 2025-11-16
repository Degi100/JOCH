// ============================================
// JOCH Bandpage - Simple Spotlight Effect
// Ein beweglicher Lichtstrahl der das Bild aufdeckt
// Mit integrierter Slideshow-Funktionalität
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import styles from './SimpleSpotlight.module.scss';

interface SimpleSpotlightProps {
  imageUrl: string;
  isActive: boolean;
  slideImages?: string[]; // Optional slideshow images
}

// Global state for beat synchronization
let globalBeatCount = 0;
let globalCurrentImageIndex = 0;

const SimpleSpotlight: React.FC<SimpleSpotlightProps> = ({ imageUrl, isActive, slideImages }) => {
  // Slideshow state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [beatCount, setBeatCount] = useState(0);
  const [showBeatPulse, setShowBeatPulse] = useState(false);

  // Determine which image to show
  const activeImageUrl = slideImages && slideImages.length > 0 && isActive
    ? slideImages[currentImageIndex]
    : imageUrl;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const colorChangeRef = useRef<number>(0);
  const beatFlashRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);
  const beatIntervalRef = useRef<number>(500); // Standard: 120 BPM = 500ms zwischen Beats
  const speedMultiplierRef = useRef<number>(1); // Geschwindigkeitsmultiplikator
  const fogOffsetRef = useRef<number>(0); // Für animierten Nebel

  // Spotlight modes for dynamic show (only 2 or all 4, never single)
  // WICHTIG: Niemals 0+1 (beide links zu nah) oder 2+3 (beide rechts zu nah)!
  const spotlightModes = [
    { name: 'DUAL_OUTER', activeSpots: [0, 3], intensity: 0.4 },      // Äußere links + äußere rechts
    { name: 'DUAL_INNER', activeSpots: [1, 2], intensity: 0.4 },      // Innere links + innere rechts
    { name: 'DIAGONAL_1', activeSpots: [0, 2], intensity: 0.4 },      // Links außen + rechts innen
    { name: 'DIAGONAL_2', activeSpots: [1, 3], intensity: 0.4 },      // Links innen + rechts außen
    { name: 'CHASE', activeSpots: [0], intensity: 0.4 },              // Chase Mode (wird dynamisch geändert)
    { name: 'BOUNCE', activeSpots: [0, 3], intensity: 0.4 },          // Ping-Pong outer ↔ inner (dynamisch)
    { name: 'ALTERNATE', activeSpots: [0, 3], intensity: 0.4 },       // Toggle outer ↔ inner (dynamisch)
    { name: 'RANDOM', activeSpots: [0], intensity: 0.4 },             // Random lights (dynamisch)
    { name: 'FOLLOW_TEXT', activeSpots: [0, 1, 2, 3], intensity: 0.5 }, // Alle Beams folgen dem Text! 🎯
    { name: 'ALL', activeSpots: [0, 1, 2, 3], intensity: 0.35 },      // Alle 4 (sehr dezent)
    { name: 'BLACKOUT', activeSpots: [], intensity: 0 },              // Alle aus (drama)
  ];
  const currentSpotModeIndexRef = useRef(0);
  const activeSpotlightsRef = useRef<number[]>([0, 1, 2, 3]); // Welche Spots sind aktiv
  const chasePositionRef = useRef(0); // Für Chase Mode: welcher Spot ist gerade aktiv (0-3)
  const alternateStateRef = useRef(false); // Für Alternate: false = outer, true = inner

  // Text Position State (from LED Screen)
  const textPositionXRef = useRef<number>(50); // 0-100% horizontal
  const textPositionYRef = useRef<number>(50); // 0-100% vertical

  // Fog machine state
  const fogMachineActiveRef = useRef<boolean>(false);
  const fogBurstStartTimeRef = useRef<number>(0);
  const fogBurstDurationRef = useRef<number>(15000); // Burst dauert 15 Sekunden
  const fogNextBurstTimeRef = useRef<number>(Date.now() + 5000); // Erster Burst nach 5 Sekunden
  const fogIntensityRef = useRef<number>(0); // 0 bis 1, kontrolliert Opazität
  const fogMachinePositionRef = useRef<number>(Math.random()); // Position der Nebelmaschine (0-1)

  // Dark Beat state
  const darkBeatActiveRef = useRef<boolean>(false);
  const darkBeatEndTimeRef = useRef<number>(0);

  // Strobe state - ENHANCED!
  const strobeActiveRef = useRef<boolean>(false);
  const strobeStateRef = useRef<boolean>(false); // true = ON, false = OFF
  const strobeColorIndexRef = useRef<number>(0);
  const strobeTimerRef = useRef<number>(0);
  const strobeTriggerModeRef = useRef<'continuous' | 'beat-2' | 'beat-4' | 'beat-8' | 'beat-16'>('continuous');
  const strobeAllowedRef = useRef<boolean>(true); // Beat-based trigger control

  // Auto mode control
  const autoModeRef = useRef(true);
  const autoIntensityRef = useRef(0.0); // 0.0 = CHILL (DEFAULT!), 1.0 = aggressiv
  const manualIntensityRef = useRef(0.4);
  const manualColorRef = useRef('#e63946');

  // Warm-up phase - Spots "lauschen" erst, dann starten sie
  const warmupBeatsRef = useRef(8); // Erste 8 Beats: Spots bleiben dunkel
  const isWarmupPhaseRef = useRef(true); // Sind wir noch in der Aufwärmphase?

  // COORDINATION STATE - Kommunikation mit Moving Heads
  const movingHeadModeRef = useRef<string>('BLACKOUT'); // Aktueller Moving Head Mode
  const movingHeadColorIndexRef = useRef<number>(0); // Aktueller Moving Head Color Index
  const useSharedColorPaletteRef = useRef(true); // Nutze gleiche Farbpalette wie Moving Heads

  // Bild laden - jetzt mit activeImageUrl statt imageUrl
  useEffect(() => {
    const img = new Image();
    img.src = activeImageUrl;
    img.onload = () => {
      imageRef.current = img;
      console.log('✅ Bild geladen:', activeImageUrl);
    };
  }, [activeImageUrl]);

  // Reset global state when concert mode stops
  useEffect(() => {
    if (!isActive) {
      globalBeatCount = 0;
      globalCurrentImageIndex = 0;
      setCurrentImageIndex(0);
      setBeatCount(0);
      isWarmupPhaseRef.current = true; // Reset warm-up phase
    } else {
      // Restore state when concert mode starts
      setCurrentImageIndex(globalCurrentImageIndex);
      setBeatCount(globalBeatCount);
      isWarmupPhaseRef.current = true; // Reset warm-up when concert starts
    }
  }, [isActive]);

  // Beat-Event Listener mit Slideshow-Logik
  useEffect(() => {
    if (!isActive) return;

    const handleBeat = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🎵 Spotlight received beat!', customEvent.detail);

      // Increment beat count
      globalBeatCount++;
      setBeatCount(globalBeatCount);

      // Show beat pulse
      setShowBeatPulse(true);
      setTimeout(() => setShowBeatPulse(false), 150);

      // Change image every 4 beats if slideshow images are available
      if (slideImages && slideImages.length > 0 && globalBeatCount % 4 === 0 && globalBeatCount > 0) {
        globalCurrentImageIndex = (globalCurrentImageIndex + 1) % slideImages.length;
        setCurrentImageIndex(globalCurrentImageIndex);
        console.log(`🖼️ Slideshow: Changed to image ${globalCurrentImageIndex + 1}/${slideImages.length}`);
      }

      const now = Date.now();

      // Berechne Zeit zwischen Beats (Tempo)
      if (lastBeatTimeRef.current > 0) {
        const timeSinceLastBeat = now - lastBeatTimeRef.current;

        // Gleitender Durchschnitt für stabileres Tempo
        beatIntervalRef.current = beatIntervalRef.current * 0.7 + timeSinceLastBeat * 0.3;

        // Berechne Geschwindigkeitsmultiplikator
        // Schnellere Beats = schnellere Bewegung
        // 500ms (120 BPM) = normale Geschwindigkeit (1.0)
        // 300ms (200 BPM) = schneller (1.67)
        // 750ms (80 BPM) = langsamer (0.67)
        speedMultiplierRef.current = 500 / beatIntervalRef.current;

        // Begrenzen auf sinnvollen Bereich
        speedMultiplierRef.current = Math.max(0.5, Math.min(2.0, speedMultiplierRef.current));

        console.log(`⏱️ Tempo: ${Math.round(60000 / beatIntervalRef.current)} BPM, Speed: ${speedMultiplierRef.current.toFixed(2)}x`);
      }

      // Trigger beat flash
      beatFlashRef.current = 1;
      lastBeatTimeRef.current = now;

      // Warm-up Phase Check: Erste 8 Beats "lauschen" (Spots bleiben dunkel)
      if (globalBeatCount <= warmupBeatsRef.current) {
        isWarmupPhaseRef.current = true;
        // Spots bleiben komplett dunkel - keine Mode Changes, keine Aktivität
        activeSpotlightsRef.current = []; // Alle Spots aus
        console.log(`🎧 WARM-UP: Beat ${globalBeatCount}/${warmupBeatsRef.current} - Spots lauschen...`);
        return; // Keine weiteren Aktionen während Warm-up
      } else if (isWarmupPhaseRef.current) {
        // Warm-up Phase vorbei - Spots starten jetzt!
        isWarmupPhaseRef.current = false;
        console.log('🚀 WARM-UP COMPLETE! Spots starten jetzt!');
      }

      // Spotlight Mode wechsel - Intervall abhängig von Auto Intensity!
      // 0.0 = alle 24 Beats, 0.5 = alle 16 Beats, 1.0 = alle 8 Beats
      const spotModeChangeInterval = Math.max(8, Math.round(24 - (autoIntensityRef.current * 16))); // 8-24 Beats
      if (autoModeRef.current && globalBeatCount % spotModeChangeInterval === 0 && globalBeatCount > 0) {
        const randomModeIndex = Math.floor(Math.random() * spotlightModes.length);
        currentSpotModeIndexRef.current = randomModeIndex;
        const newMode = spotlightModes[randomModeIndex];
        activeSpotlightsRef.current = newMode.activeSpots;
        console.log('💡 Spotlight Mode changed to:', newMode.name, 'Active spots:', newMode.activeSpots, 'Interval:', spotModeChangeInterval);
      }

      // Color change - Intervall abhängig von Auto Intensity!
      // 0.0 = alle 24 Beats, 0.5 = alle 16 Beats, 1.0 = alle 8 Beats
      const spotColorChangeInterval = Math.max(8, Math.round(24 - (autoIntensityRef.current * 16))); // 8-24 Beats
      if (autoModeRef.current && globalBeatCount % spotColorChangeInterval === 0 && globalBeatCount > 0) {
        colorChangeRef.current++;
        console.log('🎨 Spotlights: Color changed, Interval:', spotColorChangeInterval);
      }

      // DYNAMIC MODES: CHASE, BOUNCE, ALTERNATE, RANDOM
      const currentMode = spotlightModes[currentSpotModeIndexRef.current];

      if (currentMode.name === 'CHASE') {
        // CHASE MODE: Bei jedem Beat den nächsten Spot aktivieren (0 → 1 → 2 → 3 → 0 ...)
        chasePositionRef.current = (chasePositionRef.current + 1) % 4;

        // Nur der aktuelle Chase-Spot ist aktiv
        activeSpotlightsRef.current = [chasePositionRef.current];

        console.log('🏃 CHASE: Spot', chasePositionRef.current, 'active');
      }
      else if (currentMode.name === 'BOUNCE') {
        // BOUNCE MODE: Ping-Pong zwischen outer (0+3) und inner (1+2)
        // Pattern: outer → inner → outer → inner (hin und her)
        const pattern = [[0, 3], [1, 2]]; // outer, inner
        chasePositionRef.current = (chasePositionRef.current + 1) % pattern.length;
        const activeSpots = pattern[chasePositionRef.current];

        activeSpotlightsRef.current = activeSpots;

        console.log('🏓 BOUNCE: Spots', activeSpots.join('+'), 'active');
      }
      else if (currentMode.name === 'ALTERNATE') {
        // ALTERNATE MODE: Toggle zwischen outer (0+3) und inner (1+2) bei jedem Beat
        alternateStateRef.current = !alternateStateRef.current;
        const activeSpots = alternateStateRef.current ? [1, 2] : [0, 3]; // inner : outer

        activeSpotlightsRef.current = activeSpots;

        console.log('🔄 ALTERNATE: Spots', activeSpots.join('+'), 'active');
      }
      else if (currentMode.name === 'RANDOM') {
        // RANDOM MODE: Zufällig 1-2 Spots aktivieren (Chaos!)
        const numSpots = Math.random() > 0.5 ? 2 : 1;
        const availableSpots = [0, 1, 2, 3];
        const randomSpots: number[] = [];

        for (let i = 0; i < numSpots; i++) {
          const randomIndex = Math.floor(Math.random() * availableSpots.length);
          randomSpots.push(availableSpots[randomIndex]);
          availableSpots.splice(randomIndex, 1);
        }

        activeSpotlightsRef.current = randomSpots;

        console.log('🎲 RANDOM: Spots', randomSpots.join('+'), 'active');
      }

      // ======================================================
      // STROBE TRIGGER LOGIC - Beat-based activation
      // ======================================================
      if (strobeActiveRef.current && strobeTriggerModeRef.current !== 'continuous') {
        const triggerMode = strobeTriggerModeRef.current;
        let shouldTrigger = false;

        switch (triggerMode) {
          case 'beat-2':
            shouldTrigger = (globalBeatCount % 2 === 0);
            break;
          case 'beat-4':
            shouldTrigger = (globalBeatCount % 4 === 0);
            break;
          case 'beat-8':
            shouldTrigger = (globalBeatCount % 8 === 0);
            break;
          case 'beat-16':
            shouldTrigger = (globalBeatCount % 16 === 0);
            break;
        }

        if (shouldTrigger) {
          strobeAllowedRef.current = true; // Enable strobe for short duration
          console.log(`⚡ STROBE TRIGGER: Beat ${globalBeatCount} (${triggerMode})`);
        }
      }
    };

    window.addEventListener('musicBeat', handleBeat);
    return () => {
      window.removeEventListener('musicBeat', handleBeat);
    };
  }, [isActive, slideImages]);

  // Listen to Light Control events from Mixer
  useEffect(() => {
    if (!isActive) return;

    const handleLightControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, data } = customEvent.detail;

      console.log('🎛️ SimpleSpotlight: Light Control received', type, data);

      switch (type) {
        case 'spotMode':
          // Manual mode control for main spots
          currentSpotModeIndexRef.current = data.mode;
          const mode = spotlightModes[data.mode];
          activeSpotlightsRef.current = mode.activeSpots;
          manualIntensityRef.current = data.intensity;
          manualColorRef.current = data.color;
          break;

        case 'autoMode':
          autoModeRef.current = data.enabled;
          if (data.intensity !== undefined) {
            autoIntensityRef.current = data.intensity;
          }
          console.log('🎛️ Auto Mode:', data.enabled ? 'ENABLED' : 'DISABLED', 'Intensity:', data.intensity);
          break;

        case 'fog':
          // Manual fog trigger
          if (data.trigger) {
            fogMachineActiveRef.current = true;
            fogBurstStartTimeRef.current = Date.now();
            console.log('🌫️ FOG TRIGGERED MANUALLY!');
          }
          break;

        case 'darkBeat':
          // Dark Beat: Complete blackout for dramatic effect
          darkBeatActiveRef.current = true;
          darkBeatEndTimeRef.current = Date.now() + (data.duration || 2000);
          console.log('🌑 DARK-BEAT activated for', data.duration || 2000, 'ms');
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
              console.log('⚡ STROBE ACTIVATED!');
            } else {
              console.log('⚡ STROBE DEACTIVATED');
            }
          }
          if (data.strobeTriggerMode !== undefined) {
            strobeTriggerModeRef.current = data.strobeTriggerMode;
            console.log('⚡ STROBE TRIGGER MODE:', data.strobeTriggerMode);
          }
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
      }
      if (positionY !== undefined) {
        textPositionYRef.current = positionY;
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
      console.log('🔄 Spotlights: Resetting state for new song');
      // Reset warm-up phase
      isWarmupPhaseRef.current = true;
      // Reset beat counters
      setBeatCount(0);
      globalBeatCount = 0; // Reset global beat count
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
      // Reset fog
      fogIntensityRef.current = 0;
      fogNextBurstTimeRef.current = Date.now() + 5000;
      // Reset to first mode
      currentSpotModeIndexRef.current = 0;
    };

    window.addEventListener('lightshowReset', handleReset);
    return () => {
      window.removeEventListener('lightshowReset', handleReset);
    };
  }, []);

  // COORDINATION: Listen to Moving Head changes for intelligent lighting
  useEffect(() => {
    if (!isActive || !autoModeRef.current) return;

    const handleMovingHeadModeChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { mode } = customEvent.detail;
      movingHeadModeRef.current = mode;

      console.log('🔗 COORDINATION: Moving Heads changed to', mode, '- Spots adapting...');

      // INTELLIGENT COORDINATION LOGIC
      // If Moving Heads are BLACKOUT, Spots should take over (never both dark!)
      if (mode === 'BLACKOUT') {
        // Moving Heads aus → Spots übernehmen (volle Power!)
        const takeoverModes = [4, 5, 6, 7, 8]; // CHASE, BOUNCE, ALTERNATE, RANDOM, ALL
        const randomIndex = Math.floor(Math.random() * takeoverModes.length);
        currentSpotModeIndexRef.current = takeoverModes[randomIndex];
        const newMode = spotlightModes[takeoverModes[randomIndex]];
        activeSpotlightsRef.current = newMode.activeSpots;
        console.log('  💡 Spots TAKEOVER:', newMode.name);
      }
      // If Moving Heads are ALL (full power), Spots should be more subtle
      else if (mode === 'ALL') {
        // Moving Heads volle Power → Spots zurückhaltend
        const subtleModes = [0, 1, 2, 3]; // DUAL_OUTER, DUAL_INNER, DIAGONAL_1, DIAGONAL_2
        const randomIndex = Math.floor(Math.random() * subtleModes.length);
        currentSpotModeIndexRef.current = subtleModes[randomIndex];
        const newMode = spotlightModes[subtleModes[randomIndex]];
        activeSpotlightsRef.current = newMode.activeSpots;
        console.log('  ✨ Spots SUBTLE:', newMode.name);
      }
      // Complementary patterns: If Moving Heads use outer beams, Spots use inner (and vice versa)
      else if (mode === 'DUAL_OUTER') {
        // Moving Heads außen → Spots innen (komplementär!)
        currentSpotModeIndexRef.current = 1; // DUAL_INNER
        activeSpotlightsRef.current = spotlightModes[1].activeSpots;
        console.log('  🔄 Spots COMPLEMENT: DUAL_INNER');
      }
      else if (mode === 'DUAL_INNER') {
        // Moving Heads innen → Spots außen (komplementär!)
        currentSpotModeIndexRef.current = 0; // DUAL_OUTER
        activeSpotlightsRef.current = spotlightModes[0].activeSpots;
        console.log('  🔄 Spots COMPLEMENT: DUAL_OUTER');
      }
    };

    const handleMovingHeadColorChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { colorIndex } = customEvent.detail;

      if (useSharedColorPaletteRef.current) {
        // Use SAME color palette as Moving Heads (synchronized colors!)
        movingHeadColorIndexRef.current = colorIndex;
        // Offset by +3 for variety but still harmonious
        colorChangeRef.current = (colorIndex + 3) % 9;
        console.log('🎨 COORDINATION: Spots synced to Moving Head color palette (offset +3)');
      }
    };

    window.addEventListener('movingHeadModeChange', handleMovingHeadModeChange);
    window.addEventListener('movingHeadColorChange', handleMovingHeadColorChange);

    return () => {
      window.removeEventListener('movingHeadModeChange', handleMovingHeadModeChange);
      window.removeEventListener('movingHeadColorChange', handleMovingHeadColorChange);
    };
  }, [isActive]);

  // Animation
  useEffect(() => {
    if (!isActive || !canvasRef.current || !imageRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas an Container anpassen
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Vier Spotlights gleichmäßig verteilt mit unterschiedlichen Startwinkeln
    let angleSpot1 = -20;
    let angleSpot2 = -10;
    let angleSpot3 = 10;
    let angleSpot4 = 20;

    let directionSpot1 = 1;
    let directionSpot2 = -1;
    let directionSpot3 = 1;
    let directionSpot4 = -1;

    // SYNCHRONIZED COLOR PALETTE - GLEICH WIE MOVING HEADS!
    // Diese Palette wird mit Moving Heads geteilt für harmonische Farbgebung
    const spotlightColors = [
      { r: 255, g: 107, b: 53 },  // #ff6b35 - Orange (Moving Heads Color 1)
      { r: 230, g: 57, b: 70 },   // #e63946 - Red (Moving Heads Color 2)
      { r: 6, g: 255, b: 165 },   // #06ffa5 - Cyan/Turquoise (Moving Heads Color 3)
      { r: 168, g: 85, b: 247 },  // #a855f7 - Purple/Violet (Moving Heads Color 4)
      { r: 255, g: 214, b: 10 },  // #ffd60a - Yellow/Gold (Moving Heads Color 5)
      { r: 6, g: 182, b: 212 },   // #06b6d4 - Blue (Moving Heads Color 6)
      { r: 236, g: 72, b: 153 },  // #ec4899 - Pink/Magenta (Moving Heads Color 7)
      { r: 255, g: 255, b: 200 }, // Warmweiß (Zusatz für Variation)
      { r: 0, g: 255, b: 100 },   // Grün (Zusatz für Variation)
    ];

    // Funktion zum Zeichnen eines einzelnen Spotlights
    const drawSpotlight = (
      spotX: number,
      angle: number,
      color: { r: number; g: number; b: number },
      isCenter: boolean = false
    ) => {
      const spotY = -50; // Über dem Canvas (von oben)
      const stageY = canvas.height * 0.7; // Bühnenhöhe
      const angleRad = (angle * Math.PI) / 180;
      const beamEndX = spotX + Math.sin(angleRad) * (stageY + 50);
      const beamEndY = stageY;

      // Zeichne den konischen Lichtstrahl
      ctx.save();

      // Erstelle konischen Clipping-Pfad - breiter bei schnellerer Musik!
      const beamWidth = (isCenter ? 180 : 100) * speedMultiplierRef.current; // Breiter für mittleren Spot!
      ctx.beginPath();
      ctx.moveTo(spotX - 5, spotY);
      ctx.lineTo(spotX + 5, spotY);
      ctx.lineTo(beamEndX + beamWidth, beamEndY + 200);
      ctx.lineTo(beamEndX - beamWidth, beamEndY + 200);
      ctx.closePath();
      ctx.clip();

      // Zeichne das Bild nur im Lichtkegel
      if (imageRef.current) {
        ctx.drawImage(
          imageRef.current,
          0, 0, imageRef.current.width, imageRef.current.height,
          0, 0, canvas.width, canvas.height
        );
      }

      // Füge Lichteffekt mit aktueller Farbe hinzu (Beat-verstärkt!)
      // Intensity from current mode or manual control
      const currentSpotMode = spotlightModes[currentSpotModeIndexRef.current];
      const modeIntensity = currentSpotMode.intensity;
      // Use manual intensity if in manual mode, otherwise use mode intensity
      const effectiveIntensity = autoModeRef.current ? modeIntensity : manualIntensityRef.current;
      const intensity = effectiveIntensity * (0.6 + beatFlashRef.current * 0.4); // Base 0.6, flash boost 0.4
      const gradient = ctx.createLinearGradient(spotX, spotY, beamEndX, beamEndY);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity})`);
      gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.5})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.125})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();

      // Zeichne Umgebungslicht-Effekt (dezenter basierend auf Mode)
      ctx.save();
      const ambientIntensity = effectiveIntensity * (0.08 + beatFlashRef.current * 0.15); // Dezenter!
      const ambientRadius = 180 + (beatFlashRef.current * 80); // Kleiner Radius
      const ambientGradient = ctx.createRadialGradient(
        beamEndX, beamEndY, 0,
        beamEndX, beamEndY, ambientRadius
      );
      ambientGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${ambientIntensity})`);
      ambientGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    };

    const draw = () => {
      // Clear the canvas first to make it transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Check for Dark Beat (blackout effect)
      if (darkBeatActiveRef.current && Date.now() < darkBeatEndTimeRef.current) {
        // Dark Beat is active - render complete darkness
        ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // 100% black for blackout
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        animationRef.current = requestAnimationFrame(draw);
        return;
      } else if (darkBeatActiveRef.current) {
        // Dark Beat has ended
        darkBeatActiveRef.current = false;
        console.log('🌟 DARK-BEAT ended, spotlights back on');
      }

      // ======================================================
      // STROBE EFFECT - ENHANCED WITH BPM SYNC & INTENSITY!
      // ======================================================
      if (strobeActiveRef.current) {
        // Check if strobe is allowed (for beat-based triggers)
        const isContinuous = strobeTriggerModeRef.current === 'continuous';
        const canStrobe = isContinuous || strobeAllowedRef.current;

        if (!canStrobe) {
          // Strobe is not allowed right now (waiting for beat trigger)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
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

          // For beat-based triggers: Disable after one complete cycle (ON->OFF->ON)
          if (!isContinuous && !strobeStateRef.current) {
            // After a full flash (ON->OFF), disable until next beat
            const strobeDuration = 500; // Duration of one strobe burst in ms
            if (strobeTimerRef.current >= strobeDuration) {
              strobeAllowedRef.current = false;
            }
          }
        }

        if (strobeStateRef.current) {
          // STROBE ON - Render bright flash
          const strobeColors = [
            { r: 255, g: 255, b: 255 }, // White
            { r: 255, g: 107, b: 53 },  // Orange
            { r: 230, g: 57, b: 70 },   // Red
            { r: 6, g: 255, b: 165 },   // Cyan
            { r: 168, g: 85, b: 247 },  // Purple
            { r: 255, g: 214, b: 10 },  // Yellow
            { r: 6, g: 182, b: 212 },   // Blue
            { r: 236, g: 72, b: 153 },  // Pink
          ];
          const strobeColor = strobeColors[strobeColorIndexRef.current];

          // Full screen flash with color
          const intensity = 0.6 + (autoIntensityRef.current * 0.4); // 0.6-1.0
          ctx.fillStyle = `rgba(${strobeColor.r}, ${strobeColor.g}, ${strobeColor.b}, ${intensity})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          animationRef.current = requestAnimationFrame(draw);
          return; // Skip normal rendering
        } else {
          // STROBE OFF - Complete darkness
          ctx.fillStyle = 'rgba(0, 0, 0, 1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          animationRef.current = requestAnimationFrame(draw);
          return; // Skip normal rendering
        }
      }

      // Canvas mit semi-transparentem Schwarz füllen (dunkle Bühne mit mehr Durchblick)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // 80% Schwarz, 20% transparent (dunkler!)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Beat-Flash-Effekt (fade out)
      if (beatFlashRef.current > 0) {
        beatFlashRef.current = Math.max(0, beatFlashRef.current - 0.05);
      }

      // ======================================================
      // COMPREHENSIVE SPEED OPTIMIZATION (Option A)
      // ======================================================

      // 1. BPM-based speed multiplier (already calculated in beat handler: 0.5x - 2.0x)
      const bpmSpeedMultiplier = speedMultiplierRef.current;

      // 2. Auto Intensity speed boost (CHILL = 0.3x, MITTEL = 0.8x, EXTREM = 1.5x) - VIEL LANGSAMER!
      const intensitySpeedMultiplier = 0.3 + (autoIntensityRef.current * 1.2); // 0.3 - 1.5x

      // 3. Mode-specific speed multiplier - ALLES LANGSAMER & KOORDINIERTER!
      const currentMode = spotlightModes[currentSpotModeIndexRef.current];
      let modeSpeedMultiplier = 1.0;
      switch (currentMode.name) {
        case 'CHASE':
        case 'RANDOM':
          modeSpeedMultiplier = 1.2; // Schnell, aber kontrolliert
          break;
        case 'BOUNCE':
        case 'ALTERNATE':
          modeSpeedMultiplier = 0.8; // Gemäßigt
          break;
        case 'DUAL_OUTER':
        case 'DUAL_INNER':
        case 'DIAGONAL_1':
        case 'DIAGONAL_2':
          modeSpeedMultiplier = 0.6; // Langsam & smooth
          break;
        case 'ALL':
          modeSpeedMultiplier = 0.4; // Sehr langsam & majestätisch
          break;
        case 'BLACKOUT':
          modeSpeedMultiplier = 0.0; // No movement
          break;
      }

      // 4. Burst speed boost (every 4th beat = SUDDEN FAST MOVEMENT!) - NUR BEI HOHER INTENSITY!
      const isBurstBeat = (beatCount % 4 === 0) && beatCount > 0;
      const burstSpeedMultiplier = (isBurstBeat && autoIntensityRef.current > 0.6) ? 2.0 : 1.0; // 2x speed on burst beats (nur bei Intensity > 0.6!)

      // COMBINE ALL MULTIPLIERS for maximum dynamics!
      const baseSpeed = 0.25; // VIEL LANGSAMER! (war 0.5)
      const totalSpeedMultiplier = bpmSpeedMultiplier * intensitySpeedMultiplier * modeSpeedMultiplier * burstSpeedMultiplier;
      const currentSpeed = baseSpeed * totalSpeedMultiplier;

      if (isBurstBeat && beatFlashRef.current > 0.8) {
        console.log(`⚡ BURST SPEED! Total multiplier: ${totalSpeedMultiplier.toFixed(2)}x (BPM: ${bpmSpeedMultiplier.toFixed(2)}x, Intensity: ${intensitySpeedMultiplier.toFixed(2)}x, Mode: ${modeSpeedMultiplier}x, Burst: ${burstSpeedMultiplier}x)`);
      }

      // Unterschiedliche Bewegungsradien für die Spots - auch dynamisch basierend auf Intensity!
      const baseMaxAngleOuter = 35; // Kleiner Radius für ruhigere Bewegung (war 45)
      const baseMaxAngleCenter = 25; // Kleiner Radius für ruhigere Bewegung (war 35)
      const angleIntensityBoost = autoIntensityRef.current * 20; // 0-20° extra bei hoher Intensity (war 30)
      const maxAngleOuter = baseMaxAngleOuter + (speedMultiplierRef.current - 1) * 15 + angleIntensityBoost; // 35-70° (war 45-95°)
      const maxAngleCenter = baseMaxAngleCenter + (speedMultiplierRef.current - 1) * 10 + angleIntensityBoost; // 25-55° (war 35-80°)

      // Update alle vier Winkel - Spots 2&3 bewegen sich sanfter!
      angleSpot1 += currentSpeed * directionSpot1;
      angleSpot2 += currentSpeed * 0.7 * directionSpot2; // 0.7x langsamer für sanftere Bewegung!
      angleSpot3 += currentSpeed * 0.7 * directionSpot3; // 0.7x langsamer für sanftere Bewegung!
      angleSpot4 += currentSpeed * directionSpot4;

      // Grenzen für Spot 1 (äußerer Radius)
      if (angleSpot1 >= maxAngleOuter) {
        angleSpot1 = maxAngleOuter;
        directionSpot1 = -1;
      } else if (angleSpot1 <= -maxAngleOuter) {
        angleSpot1 = -maxAngleOuter;
        directionSpot1 = 1;
      }

      // Grenzen für Spot 2 (mittlerer Radius)
      if (angleSpot2 >= maxAngleCenter) {
        angleSpot2 = maxAngleCenter;
        directionSpot2 = -1;
      } else if (angleSpot2 <= -maxAngleCenter) {
        angleSpot2 = -maxAngleCenter;
        directionSpot2 = 1;
      }

      // Grenzen für Spot 3 (mittlerer Radius)
      if (angleSpot3 >= maxAngleCenter) {
        angleSpot3 = maxAngleCenter;
        directionSpot3 = -1;
      } else if (angleSpot3 <= -maxAngleCenter) {
        angleSpot3 = -maxAngleCenter;
        directionSpot3 = 1;
      }

      // Grenzen für Spot 4 (äußerer Radius)
      if (angleSpot4 >= maxAngleOuter) {
        angleSpot4 = maxAngleOuter;
        directionSpot4 = -1;
      } else if (angleSpot4 <= -maxAngleOuter) {
        angleSpot4 = -maxAngleOuter;
        directionSpot4 = 1;
      }

      // Farben für die vier Spotlights (in Manual Mode alle gleich, in Auto Mode verschieden!)
      let colorSpot1, colorSpot2, colorSpot3, colorSpot4;

      if (autoModeRef.current) {
        // Auto Mode: Verschiedene Farben aus Palette
        colorSpot1 = spotlightColors[colorChangeRef.current % spotlightColors.length];
        colorSpot2 = spotlightColors[(colorChangeRef.current + 2) % spotlightColors.length];
        colorSpot3 = spotlightColors[(colorChangeRef.current + 4) % spotlightColors.length];
        colorSpot4 = spotlightColors[(colorChangeRef.current + 6) % spotlightColors.length];
      } else {
        // Manual Mode: Alle Spots haben die gewählte Farbe
        const hexColor = manualColorRef.current;
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const manualColor = { r, g, b };
        colorSpot1 = manualColor;
        colorSpot2 = manualColor;
        colorSpot3 = manualColor;
        colorSpot4 = manualColor;
      }

      // GRUND-BELEUCHTUNG ZUERST ZEICHNEN (unter den Spotlights!)
      // Beide Grundlichter haben die GLEICHE FARBE wie die äußeren Spots
      const groundLightColor = colorSpot1; // Beide Grundlichter nutzen die Farbe des ersten Spots!

      // Linke Grundbeleuchtung NUR als Lichteffekt (ohne Bild-Aufdeckung)
      ctx.save();
      const leftGroundIntensity = 0.3 + Math.abs(Math.sin(angleSpot1 * Math.PI / 180)) * 0.2;
      const leftGroundRadius = canvas.width * 0.3;

      // Weicher Gradient für Grundbeleuchtung
      const leftGroundGradient = ctx.createRadialGradient(
        0, canvas.height, 0,
        0, canvas.height, leftGroundRadius
      );
      leftGroundGradient.addColorStop(0, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${leftGroundIntensity * 0.4})`);
      leftGroundGradient.addColorStop(0.3, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${leftGroundIntensity * 0.2})`);
      leftGroundGradient.addColorStop(0.6, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${leftGroundIntensity * 0.08})`);
      leftGroundGradient.addColorStop(0.85, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${leftGroundIntensity * 0.02})`);
      leftGroundGradient.addColorStop(1, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, 0)`);

      ctx.fillStyle = leftGroundGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Rechte Grundbeleuchtung NUR als Lichteffekt (ohne Bild-Aufdeckung)
      ctx.save();
      const rightGroundIntensity = 0.3 + Math.abs(Math.sin(angleSpot4 * Math.PI / 180)) * 0.2;
      const rightGroundRadius = canvas.width * 0.3;

      // Weicher Gradient für Grundbeleuchtung
      const rightGroundGradient = ctx.createRadialGradient(
        canvas.width, canvas.height, 0,
        canvas.width, canvas.height, rightGroundRadius
      );
      rightGroundGradient.addColorStop(0, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${rightGroundIntensity * 0.4})`);
      rightGroundGradient.addColorStop(0.3, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${rightGroundIntensity * 0.2})`);
      rightGroundGradient.addColorStop(0.6, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${rightGroundIntensity * 0.08})`);
      rightGroundGradient.addColorStop(0.85, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${rightGroundIntensity * 0.02})`);
      rightGroundGradient.addColorStop(1, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, 0)`);

      ctx.fillStyle = rightGroundGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Get current spotlight mode
      const currentSpotMode = spotlightModes[currentSpotModeIndexRef.current];
      const activeSpots = activeSpotlightsRef.current;

      // FOLLOW_TEXT Mode: Alle Beams zielen auf den Text! 🎯
      let spotX1 = canvas.width * 0.2;
      let spotX2 = canvas.width * 0.4;
      let spotX3 = canvas.width * 0.6;
      let spotX4 = canvas.width * 0.8;

      if (currentSpotMode.name === 'FOLLOW_TEXT') {
        // Konvertiere Text-Position (0-100%) zu Canvas-Koordinaten
        const textX = (textPositionXRef.current / 100) * canvas.width;

        // Alle Beams zielen auf die Text-Position
        // Aber behalten ihre ursprüngliche X-Position (nur Winkel ändert sich)
        // Der Winkel wird automatisch durch die X-Position in drawSpotlight berechnet
        spotX1 = textX;
        spotX2 = textX;
        spotX3 = textX;
        spotX4 = textX;
      }

      // Jetzt die SPOTLIGHTS DARÜBER zeichnen - NUR die aktiven!
      if (activeSpots.includes(0)) drawSpotlight(spotX1, angleSpot1, colorSpot1, false);   // Spot 1
      if (activeSpots.includes(1)) drawSpotlight(spotX2, angleSpot2, colorSpot2, true);    // Spot 2 - BREITER!
      if (activeSpots.includes(2)) drawSpotlight(spotX3, angleSpot3, colorSpot3, true);    // Spot 3 - BREITER!
      if (activeSpots.includes(3)) drawSpotlight(spotX4, angleSpot4, colorSpot4, false);   // Spot 4

      // FOG MACHINE BURST EFFECT - Realistischer Nebelmaschinen-Ausstoß
      const currentTime = Date.now();

      // Prüfe ob neuer Burst starten soll
      if (!fogMachineActiveRef.current && currentTime >= fogNextBurstTimeRef.current) {
        // Starte neuen Fog Burst
        fogMachineActiveRef.current = true;
        fogBurstStartTimeRef.current = currentTime;

        // Zufällige Burst-Dauer zwischen 10-20 Sekunden
        fogBurstDurationRef.current = 10000 + Math.random() * 10000;

        // Nächster Burst in 15-30 Sekunden nach diesem Burst endet
        fogNextBurstTimeRef.current = currentTime + fogBurstDurationRef.current + 15000 + Math.random() * 15000;

        // Neue zufällige Position für die Nebelmaschine (links oder rechts)
        fogMachinePositionRef.current = Math.random() < 0.5 ? 0.1 + Math.random() * 0.2 : 0.7 + Math.random() * 0.2;

        console.log('💨 FOG BURST STARTED! Duration:', Math.round(fogBurstDurationRef.current / 1000), 'seconds');
      }

      // Update Fog Intensity während des Bursts
      if (fogMachineActiveRef.current) {
        const burstElapsed = currentTime - fogBurstStartTimeRef.current;
        const burstProgress = burstElapsed / fogBurstDurationRef.current;

        if (burstProgress >= 1) {
          // Burst beendet
          fogMachineActiveRef.current = false;
          fogIntensityRef.current = 0;
          console.log('💨 Fog burst ended. Next in:', Math.round((fogNextBurstTimeRef.current - currentTime) / 1000), 'seconds');
        } else {
          // Berechne Intensität: Starker Anfang, dann langsames Ausbreiten
          if (burstProgress < 0.2) {
            // Aufbau-Phase (erste 20%)
            fogIntensityRef.current = burstProgress * 5; // Schnell auf 1.0
          } else if (burstProgress < 0.7) {
            // Haupt-Phase (20-70%)
            fogIntensityRef.current = 1.0 - (burstProgress - 0.2) * 0.6; // Langsam auf 0.7 runter
          } else {
            // Auslauf-Phase (70-100%)
            fogIntensityRef.current = 0.7 * (1 - (burstProgress - 0.7) / 0.3); // Fade out
          }
        }
      }

      // Animiere den Nebel-Offset
      fogOffsetRef.current += 0.5 * speedMultiplierRef.current;

      // NEBEL NUR IN SPOTLIGHT-BEREICHEN SICHTBAR!
      if (fogIntensityRef.current > 0) {
        ctx.save();

        // Speichere die aktuellen Spotlight-Positionen und Winkel - 4 Spots!
        const spotlights = [
          { x: canvas.width * 0.2, angle: angleSpot1, color: colorSpot1, isCenter: false },
          { x: canvas.width * 0.4, angle: angleSpot2, color: colorSpot2, isCenter: true },
          { x: canvas.width * 0.6, angle: angleSpot3, color: colorSpot3, isCenter: true },
          { x: canvas.width * 0.8, angle: angleSpot4, color: colorSpot4, isCenter: false }
        ];

        // Zeichne Nebel für jeden Spotlight separat
        spotlights.forEach((spot) => {
          ctx.save();

          // Berechne Spotlight-Kegel-Bereich
          const spotY = -50;
          const stageY = canvas.height * 0.7;
          const angleRad = (spot.angle * Math.PI) / 180;
          const beamEndX = spot.x + Math.sin(angleRad) * (stageY + 50);
          const beamEndY = stageY;
          const beamWidth = (spot.isCenter ? 180 : 100) * speedMultiplierRef.current;

          // Erstelle Clipping-Path für diesen Spotlight
          ctx.beginPath();
          ctx.moveTo(spot.x - 5, spotY);
          ctx.lineTo(spot.x + 5, spotY);
          ctx.lineTo(beamEndX + beamWidth, beamEndY + 200);
          ctx.lineTo(beamEndX - beamWidth, beamEndY + 200);
          ctx.closePath();
          ctx.clip();

          // NEBEL-PARTIKEL NUR IM LICHTKEGEL
          const fogDensity = fogIntensityRef.current;

          // Mehrere Nebel-Schichten mit verschiedenen Höhen - VIEL DICHTER!
          for (let layer = 0; layer < 5; layer++) { // Mehr Schichten!
            const layerHeight = canvas.height * (0.2 + layer * 0.18);
            const layerOpacity = fogDensity * 0.35 * (1 - layer * 0.15); // DOPPELT SO STARK!

            // Wabernde Nebel-Wolken - MEHR WOLKEN!
            for (let i = 0; i < 5; i++) { // 5 statt 3!
              const offsetX = Math.sin((fogOffsetRef.current + layer * 100 + i * 50) * 0.01) * 70;
              const offsetY = Math.sin((fogOffsetRef.current + layer * 80 + i * 30) * 0.008) * 30;

              const fogX = beamEndX + offsetX;
              const fogY = layerHeight + offsetY;
              const fogRadius = 120 + Math.sin(fogOffsetRef.current * 0.01 + i) * 40; // GRÖßERE WOLKEN!

              // Nebel-Gradient mit Spotlight-Farbe getönt
              const fogGradient = ctx.createRadialGradient(
                fogX, fogY, 0,
                fogX, fogY, fogRadius
              );

              // Nebel nimmt die Farbe des Spotlights an! - INTENSIVER!
              const tintedOpacity = layerOpacity * (0.8 + beatFlashRef.current * 0.4);
              fogGradient.addColorStop(0, `rgba(${spot.color.r}, ${spot.color.g}, ${spot.color.b}, ${tintedOpacity * 0.5})`);
              fogGradient.addColorStop(0.3, `rgba(220, 225, 230, ${tintedOpacity * 0.4})`);
              fogGradient.addColorStop(0.6, `rgba(200, 210, 220, ${tintedOpacity * 0.2})`);
              fogGradient.addColorStop(1, 'transparent');

              ctx.fillStyle = fogGradient;
              ctx.fillRect(fogX - fogRadius, fogY - fogRadius, fogRadius * 2, fogRadius * 2);
            }
          }

          // Bodennebel im Lichtkegel - DICHTER!
          if (fogDensity > 0.2) { // Früher sichtbar
            const groundFogGradient = ctx.createLinearGradient(
              beamEndX - beamWidth, canvas.height,
              beamEndX - beamWidth, canvas.height * 0.5 // Höher hinauf!
            );

            const groundOpacity = fogDensity * 0.6; // STÄRKER!

            // Bodennebel auch mit Spotlight-Farbe getönt
            groundFogGradient.addColorStop(0, `rgba(${spot.color.r * 0.7 + 60}, ${spot.color.g * 0.7 + 65}, ${spot.color.b * 0.7 + 70}, ${groundOpacity})`);
            groundFogGradient.addColorStop(0.5, `rgba(190, 200, 210, ${groundOpacity * 0.7})`);
            groundFogGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = groundFogGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Volumetrische Licht-Streuung im Nebel - INTENSIVER!
          const scatterGradient = ctx.createLinearGradient(
            spot.x, spotY,
            beamEndX, beamEndY + 150 // Länger!
          );

          const scatterOpacity = fogDensity * 0.25 * (1 + beatFlashRef.current * 0.7); // VIEL STÄRKER!
          scatterGradient.addColorStop(0, `rgba(${spot.color.r}, ${spot.color.g}, ${spot.color.b}, ${scatterOpacity * 0.4})`);
          scatterGradient.addColorStop(0.5, `rgba(${spot.color.r * 0.8 + 40}, ${spot.color.g * 0.8 + 40}, ${spot.color.b * 0.8 + 40}, ${scatterOpacity * 0.2})`);
          scatterGradient.addColorStop(1, 'transparent');

          ctx.fillStyle = scatterGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.restore();
        });

        // Kleine schwebende Partikel die nur in Lichtkegeln sichtbar sind
        if (fogIntensityRef.current > 0.5 && beatFlashRef.current > 0.3) {
          ctx.globalAlpha = beatFlashRef.current * 0.5;

          for (let i = 0; i < 15; i++) {
            const particleX = Math.random() * canvas.width;
            const particleY = canvas.height * (0.3 + Math.random() * 0.5);
            const particleRadius = 2 + Math.random() * 4;

            // Prüfe ob Partikel in einem Lichtkegel ist
            let inSpotlight = false;
            let spotlightColor = { r: 220, g: 230, b: 240 };

            for (const spot of spotlights) {
              const angleRad = (spot.angle * Math.PI) / 180;
              const beamEndX = spot.x + Math.sin(angleRad) * (canvas.height * 0.7 + 50);
              const beamWidth = (spot.isCenter ? 180 : 100) * speedMultiplierRef.current;

              // Einfache Prüfung ob Punkt im Dreieck ist
              if (Math.abs(particleX - beamEndX) < beamWidth) {
                inSpotlight = true;
                spotlightColor = spot.color;
                break;
              }
            }

            if (inSpotlight) {
              ctx.beginPath();
              ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${spotlightColor.r}, ${spotlightColor.g}, ${spotlightColor.b}, 0.6)`;
              ctx.fill();
            }
          }

          ctx.globalAlpha = 1;
        }

        ctx.restore();
      }

      // Leichter Ambient-Nebel auch wenn keine Maschine aktiv (für Atmosphäre)
      if (fogIntensityRef.current < 0.1) {
        ctx.save();
        const ambientOpacity = 0.03 + beatFlashRef.current * 0.02;
        const ambientGradient = ctx.createLinearGradient(
          0, canvas.height,
          0, canvas.height * 0.6
        );

        ambientGradient.addColorStop(0, `rgba(180, 190, 200, ${ambientOpacity})`);
        ambientGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = ambientGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }


      // STROBOSKOP-EFFEKT VON UNTEN (bei starkem Beat!)
      if (beatFlashRef.current > 0.7) {
        ctx.save();

        // Stroboskop-Licht von unten (wie Bühnenboden-LEDs)
        const strobeIntensity = beatFlashRef.current;
        const strobeGradient = ctx.createLinearGradient(
          0, canvas.height,
          0, canvas.height * 0.3
        );

        // Zufällige Stroboskop-Farbe
        const strobeColors = [
          { r: 255, g: 255, b: 255 }, // Weiß
          { r: 0, g: 150, b: 255 },   // Blau
          { r: 255, g: 0, b: 255 },   // Magenta
          { r: 0, g: 255, b: 200 },   // Cyan
        ];
        const strobeColor = strobeColors[Math.floor(Math.random() * strobeColors.length)];

        strobeGradient.addColorStop(0, `rgba(${strobeColor.r}, ${strobeColor.g}, ${strobeColor.b}, ${strobeIntensity * 0.8})`);
        strobeGradient.addColorStop(0.3, `rgba(${strobeColor.r}, ${strobeColor.g}, ${strobeColor.b}, ${strobeIntensity * 0.4})`);
        strobeGradient.addColorStop(0.7, `rgba(${strobeColor.r}, ${strobeColor.g}, ${strobeColor.b}, ${strobeIntensity * 0.1})`);
        strobeGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = strobeGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // RANDOM VOLLBILD-BLITZ (20% Chance bei starkem Beat!)
        if (Math.random() < 0.2 && beatFlashRef.current > 0.85) {
          // Wähle zufällige Blitz-Farbe
          const fullFlashColors = [
            { r: 255, g: 255, b: 255, intensity: 0.9 },  // Weißer Blitz
            { r: 255, g: 100, b: 0, intensity: 0.7 },     // Orange Blitz
            { r: 0, g: 200, b: 255, intensity: 0.7 },     // Cyan Blitz
            { r: 255, g: 0, b: 100, intensity: 0.7 },     // Pink Blitz
          ];

          const flashColor = fullFlashColors[Math.floor(Math.random() * fullFlashColors.length)];
          const flashIntensity = flashColor.intensity * beatFlashRef.current;

          // VOLLBILD-BLITZ!
          ctx.fillStyle = `rgba(${flashColor.r}, ${flashColor.g}, ${flashColor.b}, ${flashIntensity})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          console.log('⚡ FULL SCREEN STROBE FLASH!');
        }

        // Zusätzlicher Blitz-Effekt für mehr Impact
        if (beatFlashRef.current > 0.9) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(beatFlashRef.current - 0.9) * 2})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.restore();
      }

      // Nächster Frame
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={styles.container}>
      {/* Background image - now changes based on beat */}
      <div
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${activeImageUrl})` }}
      />

      {/* Canvas for spotlight effects */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Beat indicator for debugging slideshow */}
      {slideImages && slideImages.length > 0 && isActive && (
        <div className={styles.beatIndicator}>
          <div className={`${styles.beatDot} ${showBeatPulse ? styles.pulse : ''}`} />
          <span className={styles.beatCount}>{beatCount}</span>
          <span style={{ marginLeft: '10px', color: '#ff6b35' }}>
            Img: {currentImageIndex + 1}/{slideImages.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(SimpleSpotlight);