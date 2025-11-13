// ============================================
// JOCH Bandpage - Concert Overlay
// Blackout, Countdown, and Show Start effects
// ============================================

import { ConcertModeState } from '@/hooks/useConcertMode';
import { useMemo } from 'react';
import styles from './ConcertOverlay.module.scss';

interface ConcertOverlayProps {
  concertMode: ConcertModeState;
  countdown: number;
}

// Zufällige Strobo-Farben für jeden Countdown-Schritt
const stroboAnimations = ['stroboWhite', 'stroboRed', 'stroboOrange', 'stroboBlue', 'stroboPurple'];

export default function ConcertOverlay({ concertMode, countdown }: ConcertOverlayProps) {
  // Zufällige Strobo-Animation für diesen Countdown-Wert
  const stroboAnimation = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * stroboAnimations.length);
    const animation = stroboAnimations[randomIndex];
    console.log('🎨 Strobo Animation:', animation, 'Countdown:', countdown);
    return animation;
  }, [countdown]);

  // Debug logging
  console.log('🎬 Concert Mode:', concertMode, 'Countdown:', countdown);

  if (concertMode === 'idle') {
    return null;
  }

  return (
    <div className={styles.overlay}>
      {/* Blackout Phase */}
      {concertMode === 'blackout' && (
        <div className={styles.blackout}>
          <div className={styles.blackoutText}>Lichter aus...</div>
        </div>
      )}

      {/* Countdown Phase */}
      {concertMode === 'countdown' && (
        <div className={styles.countdown}>
          <div key={countdown} className={styles.countdownNumber}>{countdown}</div>
          <div
            key={`strobe-${countdown}`}
            className={`${styles.stroboFlash} ${styles[stroboAnimation]}`}
          ></div>
        </div>
      )}

      {/* Show Starting Phase (fade out overlay) */}
      {concertMode === 'show-starting' && (
        <div className={styles.showStarting}>
          <div className={styles.fadeOut}></div>
        </div>
      )}
    </div>
  );
}
