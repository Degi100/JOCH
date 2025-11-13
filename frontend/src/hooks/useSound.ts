// ============================================
// JOCH Bandpage - useSound Hook
// Stage sound effects management
// ============================================

import { useEffect, useState, useCallback, useRef } from 'react';

// Sound types available
export type SoundType =
  | 'guitar-riff'
  | 'drum-hit'
  | 'cymbal'
  | 'bass-drop'
  | 'feedback'
  | 'crowd-cheer'
  | 'button-click'
  | 'string-pluck';

// Sound settings from localStorage
const SOUND_ENABLED_KEY = 'joch-sound-enabled';

/**
 * useSound Hook
 * Manages stage sound effects with toggle and localStorage persistence
 */
export const useSound = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    // Check localStorage for user preference
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    return stored === null ? false : stored === 'true'; // Default: OFF (nicht aufdringlich)
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const loadingRef = useRef<boolean>(false);

  // Initialize AudioContext (only when enabled)
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    return () => {
      // Cleanup on unmount
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [soundEnabled]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Play sound effect
  const play = useCallback(
    async (soundType: SoundType, volume: number = 0.5) => {
      // Don't play if sound is disabled
      if (!soundEnabled || !audioContextRef.current) {
        return;
      }

      // Respect user's reduced motion preference (accessibility)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      try {
        // TODO: Load audio buffer if not already loaded
        // For now, we'll use a simple Audio element as fallback
        // (Web Audio API would be better for performance, but requires audio files)

        const audio = new Audio(`/sounds/${soundType}.mp3`);
        audio.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0-1
        audio.play().catch((err) => {
          // Ignore errors (e.g., file not found, autoplay blocked)
          console.debug(`Sound ${soundType} could not play:`, err);
        });
      } catch (error) {
        console.debug('Sound playback error:', error);
      }
    },
    [soundEnabled]
  );

  // Preload sound (optional, for better performance)
  const preload = useCallback((soundType: SoundType) => {
    if (loadingRef.current) return;

    const audio = new Audio(`/sounds/${soundType}.mp3`);
    audio.preload = 'auto';
    audio.load();
  }, []);

  return {
    soundEnabled,
    toggleSound,
    play,
    preload,
  };
};

/**
 * useSoundToggle Hook
 * Simpler hook for components that only need the toggle
 */
export const useSoundToggle = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    return stored === null ? false : stored === 'true';
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
      return newValue;
    });
  }, []);

  return { soundEnabled, toggleSound };
};
