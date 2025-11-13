// ============================================
// JOCH Bandpage - Concert Play Button
// Start concert mode with blackout, countdown, and lightshow
// ============================================

import styles from './ConcertPlayButton.module.scss';

interface ConcertPlayButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export default function ConcertPlayButton({ onClick, isActive }: ConcertPlayButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${styles.playButton} ${isActive ? styles.active : ''}`}
      aria-label="Start Concert Mode"
      title="Start Concert Mode - Lichter aus, Show beginnt! 🎸"
    >
      {isActive ? (
        // Stop Icon (when show is active)
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        // Play Icon
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
