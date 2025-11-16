// ============================================
// JOCH Bandpage - Song Controls Component
// Show controls when song ends (Next/Replay)
// ============================================

import React from 'react';
import styles from './SongControls.module.scss';

interface SongControlsProps {
  currentSong?: string;
  currentIndex: number;
  totalSongs: number;
  onNext: () => void;
  onReplay: () => void;
  visible: boolean;
}

const SongControls: React.FC<SongControlsProps> = ({
  currentSong,
  currentIndex,
  totalSongs,
  onNext,
  onReplay,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.controlsContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Song beendet</h2>
          {currentSong && (
            <p className={styles.songInfo}>
              {currentSong} ({currentIndex + 1}/{totalSongs})
            </p>
          )}
        </div>

        <div className={styles.buttons}>
          <button className={styles.replayButton} onClick={onReplay}>
            <span className={styles.icon}>🔁</span>
            <span className={styles.label}>Noch mal</span>
          </button>

          <button className={styles.nextButton} onClick={onNext}>
            <span className={styles.icon}>⏭️</span>
            <span className={styles.label}>Nächster Song</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongControls;
