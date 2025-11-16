// ============================================
// JOCH Bandpage - Concert Mode Hook
// Simulate concert entrance with lights out, countdown, and show start
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { useMusicPlayer } from './useMusicPlayer';

export type ConcertModeState = 'idle' | 'blackout' | 'countdown' | 'show-starting' | 'show-active';

interface UseConcertModeProps {
  musicUrl?: string;
  onBeat?: () => void;
  onSongEnded?: () => void;
}

/**
 * useConcertMode Hook
 * Manages the concert entrance sequence with music playback
 */
export const useConcertMode = ({ musicUrl, onBeat, onSongEnded }: UseConcertModeProps = {}) => {
  const [concertMode, setConcertMode] = useState<ConcertModeState>('idle');
  const [countdown, setCountdown] = useState<number>(3);

  // Music player with beat detection
  const { play, stop } = useMusicPlayer({ audioUrl: musicUrl, onBeat, onEnded: onSongEnded });

  // Start Concert Mode Sequence
  const startConcertMode = useCallback(() => {
    console.log('▶️ Starting Concert Mode...');
    // Phase 1: Blackout (fade to black takes 2 seconds + text appears at 1.5s)
    setConcertMode('blackout');
    setCountdown(3);

    // Phase 2: Countdown after blackout is complete (wait 3.5 seconds)
    // This gives time for: 2s blackout fade + 1.5s text delay + some buffer
    setTimeout(() => {
      console.log('⏰ Timeout fired! Switching to countdown...');
      setConcertMode('countdown');
    }, 3500);
  }, []);

  // Stop/Reset Concert Mode
  const stopConcertMode = useCallback(() => {
    setConcertMode('idle');
    setCountdown(3);
    stop(); // Stop music
    console.log('⏹️ Concert Mode stopped, music stopped');
  }, [stop]);

  // Countdown Logic
  useEffect(() => {
    if (concertMode !== 'countdown') return;

    console.log('⏱️ Countdown useEffect - countdown:', countdown);

    if (countdown > 0) {
      const timer = setTimeout(() => {
        console.log('⬇️ Countdown decrement:', countdown, '→', countdown - 1);
        setCountdown((prev) => prev - 1);
      }, 1000); // 1 second per count

      return () => clearTimeout(timer);
    }

    // After countdown reaches 0, start show
    if (countdown === 0) {
      console.log('🎉 Countdown reached 0! Starting show...');

      setTimeout(() => {
        console.log('🎭 Switching to show-starting...');
        setConcertMode('show-starting');
      }, 500);

      // Transition to active show after fade-in
      setTimeout(() => {
        console.log('✨ Switching to show-active! LIGHTSHOW TIME!');
        setConcertMode('show-active');
        // Start music when show becomes active
        console.log('🎵 Attempting to start music, URL:', musicUrl);
        play();
      }, 3500); // 500ms + 3000ms fade-in
    }
  }, [concertMode, countdown, play, musicUrl]);

  return {
    concertMode,
    countdown,
    startConcertMode,
    stopConcertMode,
    isShowActive: concertMode === 'show-active',
  };
};
