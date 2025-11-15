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
  const manualIntensityRef = useRef(0.7);

  // Canvas refs for moving head beams
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const beamPositionsRef = useRef<Array<{x: number, y: number, angle: number, targetAngle: number, color: string, isActive: boolean}>>([]);
  const beatFlashRef = useRef<number>(0);
  const darkBeatActiveRef = useRef<boolean>(false);
  const darkBeatEndTimeRef = useRef<number>(0);

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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
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

      setBeatCount(prev => prev + 1);

      // Pulse on every beat
      setBeatPulse(true);
      setTimeout(() => {
        if (mountedRef.current) setBeatPulse(false);
      }, 150);

      // Strong bass hit every 4 beats
      if ((beatCount + 1) % 4 === 0) {
        setBassHit(true);
        setTimeout(() => {
          if (mountedRef.current) setBassHit(false);
        }, 300);
      }

      // Flash the beams on beat (only active beams)
      beatFlashRef.current = 1;

      // Moving Heads: Mode wechsel alle 8 Beats (nur in Auto Mode!)
      if (autoModeRef.current && beatCount % 8 === 0 && beatCount > 0) {
        const randomModeIndex = Math.floor(Math.random() * lightingModes.length);
        currentModeIndexRef.current = randomModeIndex;
        const newMode = lightingModes[randomModeIndex];

        // Update which beams are active
        beamPositionsRef.current.forEach((beam, index) => {
          beam.isActive = newMode.activeBeams.includes(index);
        });

        console.log('💡 Moving Heads Mode changed to:', newMode.name, 'Active beams:', newMode.activeBeams);
      }

      // Moving Heads: Farbe alle 12 Beats (nur in Auto Mode!)
      if (autoModeRef.current && beatCount % 12 === 0 && beatCount > 0) {
        currentColorIndexRef.current = (currentColorIndexRef.current + 1) % colorPaletteRef.current.length;
        const newColor = colorPaletteRef.current[currentColorIndexRef.current];
        beamPositionsRef.current.forEach((beam) => {
          beam.color = newColor;
        });
        console.log('🎨 Moving Heads: Color changed to', newColor);
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

      // Beam angles: JEDEN Beat bewegen (sehr dynamisch!)
      beamPositionsRef.current.forEach((beam, index) => {
        if (beam.isActive) {
          const baseAngle = index < 2 ? 30 : -30; // Left beams positive, right negative
          // Größere Variation für mehr Bewegung: ±45 degrees statt ±30
          beam.targetAngle = baseAngle + (Math.random() - 0.5) * 90;
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
            beam.color = data.color;
          });
          manualIntensityRef.current = data.intensity;
          break;

        case 'autoMode':
          autoModeRef.current = data.enabled;
          console.log('🎛️ Auto Mode:', data.enabled ? 'ENABLED' : 'DISABLED');
          break;

        case 'master':
          // Master controls handled by each component individually
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

      // Fade out beat flash
      if (beatFlashRef.current > 0) {
        beatFlashRef.current = Math.max(0, beatFlashRef.current - 0.02);
      }

      // Get current lighting mode for intensity
      const currentMode = lightingModes[currentModeIndexRef.current];
      // Use manual intensity if in manual mode, otherwise use mode intensity
      const effectiveIntensity = autoModeRef.current ? currentMode.intensity : manualIntensityRef.current;

      // Draw each moving head beam (only if active in current mode)
      beamPositionsRef.current.forEach((beam, index) => {
        // Skip inactive beams
        if (!beam.isActive) return;

        // Smooth angle transition
        const angleDiff = beam.targetAngle - beam.angle;
        beam.angle += angleDiff * 0.05;

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

        // Calculate beam end position
        const beamLength = canvas.height * 0.8;
        const radians = (beam.angle * Math.PI) / 180;
        const endX = startX + Math.sin(radians) * beamLength;
        const endY = startY + Math.cos(radians) * beamLength;

        // Create gradient for beam
        // Beams are only visible when there's an active beat flash
        // Intensity varies by lighting mode (more subtle)
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        const baseOpacity = beatFlashRef.current * effectiveIntensity; // Use effective intensity (auto or manual)

        gradient.addColorStop(0, `${beam.color}${Math.floor(baseOpacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${beam.color}${Math.floor(baseOpacity * 0.5 * 255).toString(16).padStart(2, '0')}`);
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

        // Add glow effect only on strong beats and when intensity is high
        if (beatFlashRef.current > 0.7 && effectiveIntensity > 0.5) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = beam.color;
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
    </div>
  );
};

export default React.memo(StageEquipment);