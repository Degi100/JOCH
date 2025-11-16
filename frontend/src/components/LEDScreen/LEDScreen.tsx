// ============================================
// JOCH Bandpage - Logo Beam Projector
// Projects "JOCH" logo like a stage gobo light
// ============================================

import React, { useEffect, useRef } from 'react';
import styles from './LEDScreen.module.scss';

interface LEDScreenProps {
  isActive: boolean;
}

type LEDEffect = 'static' | 'pulse' | 'strobe' | 'rainbow' | 'wave' | 'beat-sync' | 'off';

const LEDScreen: React.FC<LEDScreenProps> = ({ isActive }) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  // Logo Beam State
  const currentEffectRef = useRef<LEDEffect>('static');
  const colorRef = useRef('#ff6b35'); // Orange default
  const intensityRef = useRef(0.8);
  const beatPulseRef = useRef(0);

  // Auto Mode State
  const autoModeEnabledRef = useRef(false);
  const autoIntensityRef = useRef(0.0); // 0 = CHILL, 1 = EXTREM

  // Master Intensity State
  const masterIntensityRef = useRef(1.0); // 0-1

  // Text & Position State
  const textRef = useRef('JOCH');
  const positionXRef = useRef(50); // 0-100%
  const positionYRef = useRef(50); // 0-100%
  const fontFamilyRef = useRef<'impact' | 'arial-black' | 'bebas' | 'oswald' | 'roboto'>('impact');
  const sizeRef = useRef(15); // 5-30 (vw)
  const autoRepeatsRef = useRef(4); // 2-6: Max repeats before new random position

  // Random Position State (for auto mode)
  const randomPosXRef = useRef(50);
  const randomPosYRef = useRef(50);
  const beatCountRef = useRef(0); // Count beats to trigger new random position

  // Animation timers
  const pulseTimeRef = useRef(0);
  const strobeStateRef = useRef(true);
  const strobeTimerRef = useRef(0);
  const rainbowHueRef = useRef(0);
  const waveOffsetRef = useRef(0);

  // Listen to beat events
  useEffect(() => {
    if (!isActive) return;

    const handleBeat = () => {
      if (!mountedRef.current) return;

      // Beat pulse effect
      beatPulseRef.current = 1.0;

      // Auto Mode: Random position after N beats
      if (autoModeEnabledRef.current) {
        beatCountRef.current++;

        // Generate new random position when beat count reaches autoRepeats
        if (beatCountRef.current >= autoRepeatsRef.current) {
          beatCountRef.current = 0;

          // Random position: 20-80% (avoid edges)
          randomPosXRef.current = 20 + Math.random() * 60;
          randomPosYRef.current = 20 + Math.random() * 60;

          console.log(`📺 LED Screen: New random position ${randomPosXRef.current.toFixed(0)}%, ${randomPosYRef.current.toFixed(0)}%`);

          // BROADCAST POSITION UPDATE so Moving Heads and Spotlights can follow!
          window.dispatchEvent(new CustomEvent('ledControl', {
            detail: {
              positionX: randomPosXRef.current,
              positionY: randomPosYRef.current
            }
          }));
        }
      }

      console.log('📺 LED Screen: Beat received');
    };

    window.addEventListener('musicBeat', handleBeat);
    return () => {
      window.removeEventListener('musicBeat', handleBeat);
    };
  }, [isActive]);

  // Listen to LED control events from Light Mixer
  useEffect(() => {
    if (!isActive) return;

    const handleLEDControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { effect, color, intensity, text, positionX, positionY, fontFamily, size, autoRepeats } = customEvent.detail;

      if (effect !== undefined) {
        currentEffectRef.current = effect;
        console.log('📺 LED Screen: Effect changed to', effect);
      }
      if (color !== undefined) {
        colorRef.current = color;
      }
      if (intensity !== undefined) {
        intensityRef.current = intensity;
      }
      if (text !== undefined) {
        textRef.current = text;
      }
      if (positionX !== undefined) {
        positionXRef.current = positionX;
      }
      if (positionY !== undefined) {
        positionYRef.current = positionY;
      }
      if (fontFamily !== undefined) {
        fontFamilyRef.current = fontFamily;
      }
      if (size !== undefined) {
        sizeRef.current = size;
      }
      if (autoRepeats !== undefined) {
        autoRepeatsRef.current = autoRepeats;
      }
    };

    window.addEventListener('ledControl', handleLEDControl);
    return () => {
      window.removeEventListener('ledControl', handleLEDControl);
    };
  }, [isActive]);

  // Listen to lightControl events for Auto Mode integration
  useEffect(() => {
    if (!isActive) return;

    const handleLightControl = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, data } = customEvent.detail;

      if (type === 'autoMode') {
        autoModeEnabledRef.current = data.enabled;
        if (data.intensity !== undefined) {
          autoIntensityRef.current = data.intensity;
        }
        console.log('📺 LED Screen: Auto Mode', data.enabled ? 'ENABLED' : 'DISABLED', 'Intensity:', data.intensity);
      } else if (type === 'master') {
        if (data.intensity !== undefined) {
          masterIntensityRef.current = data.intensity;
        }
      }
    };

    window.addEventListener('lightControl', handleLightControl);
    return () => {
      window.removeEventListener('lightControl', handleLightControl);
    };
  }, [isActive]);

  // Animation loop to update logo styles
  useEffect(() => {
    if (!isActive) return;

    const logo = logoRef.current;
    if (!logo) return;

    let animationFrameId: number;

    const animate = () => {
      if (!mountedRef.current || !logo) return;

      const currentEffect = currentEffectRef.current;

      // Global beat pulse decay (for beat-sync movement)
      if (beatPulseRef.current > 0) {
        beatPulseRef.current = Math.max(0, beatPulseRef.current - 0.05);
      }

      // Skip rendering if effect is 'off'
      if (currentEffect === 'off') {
        logo.style.opacity = '0';
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Calculate effect-specific color and opacity
      let effectColor = colorRef.current;
      let effectOpacity = intensityRef.current;

      switch (currentEffect) {
        case 'pulse':
          // Smooth sine wave pulse
          pulseTimeRef.current += 0.05;
          const pulseValue = (Math.sin(pulseTimeRef.current) + 1) / 2; // 0-1
          effectOpacity = 0.3 + (pulseValue * 0.7); // 0.3 - 1.0
          break;

        case 'strobe':
          // Fast strobe effect
          strobeTimerRef.current += 16.67; // ~60fps
          if (strobeTimerRef.current >= 100) { // 10 Hz strobe
            strobeTimerRef.current = 0;
            strobeStateRef.current = !strobeStateRef.current;
          }
          effectOpacity = strobeStateRef.current ? 1.0 : 0.0;
          break;

        case 'rainbow':
          // Rainbow color cycling
          rainbowHueRef.current = (rainbowHueRef.current + 2) % 360;
          effectColor = `hsl(${rainbowHueRef.current}, 100%, 50%)`;
          break;

        case 'wave':
          // Wave effect with shifting colors
          waveOffsetRef.current += 0.05;
          const waveValue = (Math.sin(waveOffsetRef.current) + 1) / 2;
          const hue = waveValue * 60 + 15; // Orange to Red range (15-75)
          effectColor = `hsl(${hue}, 100%, 50%)`;
          effectOpacity = 0.5 + (waveValue * 0.5);
          break;

        case 'beat-sync':
          // Beat-synchronized pulse (decay handled globally)
          effectOpacity = 0.3 + (beatPulseRef.current * 0.7);
          break;

        case 'static':
        default:
          // Static color, no animation
          break;
      }

      // Get font family mapping
      const fontFamilyMap = {
        'impact': '"Impact", "Arial Black", sans-serif',
        'arial-black': '"Arial Black", sans-serif',
        'bebas': '"Bebas Neue", sans-serif',
        'oswald': '"Oswald", sans-serif',
        'roboto': '"Roboto", sans-serif'
      };

      // Auto Mode Integration - scale size and opacity with auto intensity
      let finalSize = sizeRef.current;
      let finalOpacity = effectOpacity;

      if (autoModeEnabledRef.current) {
        // Scale size: 0.8x at CHILL (0.0) to 1.5x at EXTREM (1.0)
        const autoSizeMultiplier = 0.8 + (autoIntensityRef.current * 0.7);
        finalSize = sizeRef.current * autoSizeMultiplier;

        // Boost opacity at higher intensities
        const autoOpacityBoost = autoIntensityRef.current * 0.3; // +0 to +0.3
        finalOpacity = Math.min(1.0, effectOpacity + autoOpacityBoost);
      }

      // Master Intensity Binding - global opacity multiplier
      finalOpacity *= masterIntensityRef.current;

      // Apply styles to logo
      logo.style.color = effectColor;
      logo.style.opacity = finalOpacity.toString();
      logo.style.textShadow = `
        0 0 40px ${effectColor},
        0 0 80px ${effectColor},
        0 0 120px ${effectColor},
        0 0 160px ${effectColor}
      `;
      logo.style.fontFamily = fontFamilyMap[fontFamilyRef.current];
      logo.style.fontSize = `${finalSize}vw`;

      // Set position - use random position in auto mode, manual position otherwise
      const finalPosX = autoModeEnabledRef.current ? randomPosXRef.current : positionXRef.current;
      const finalPosY = autoModeEnabledRef.current ? randomPosYRef.current : positionYRef.current;

      logo.style.left = `${finalPosX}%`;
      logo.style.top = `${finalPosY}%`;

      // Beat-Sync Letter Fly-In Effect
      // Each beat shows one more letter: "" → "J" → "JO" → "JOC" → "JOCH" (repeat)
      const fullText = textRef.current || 'JOCH';
      let displayText = fullText;

      if (beatPulseRef.current > 0) {
        // beatPulseRef: 1.0 → 0.0
        // We want to show letters progressively as beat decays
        // Split into 4 phases (for 4 letters)
        const letterCount = fullText.length;
        const phase = 1 - beatPulseRef.current; // 0.0 → 1.0 as beat decays
        const visibleLetters = Math.ceil(phase * letterCount);
        displayText = fullText.substring(0, visibleLetters);
      }

      // Update text content
      logo.textContent = displayText;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className={styles.logoBeamContainer}>
      <div ref={logoRef} className={styles.logoBeam}>
        JOCH
      </div>
    </div>
  );
};

export default LEDScreen;
