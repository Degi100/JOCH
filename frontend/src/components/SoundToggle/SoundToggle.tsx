// ============================================
// JOCH Bandpage - Sound Toggle Component
// Toggle button for stage sound effects
// ============================================

import { useSoundToggle } from '@/hooks/useSound';
import styles from './SoundToggle.module.scss';

export default function SoundToggle() {
  const { soundEnabled, toggleSound } = useSoundToggle();

  return (
    <button
      onClick={toggleSound}
      className={styles.soundToggle}
      aria-label={soundEnabled ? 'Sound ausschalten' : 'Sound einschalten'}
      title={soundEnabled ? 'Sound ausschalten' : 'Sound einschalten'}
    >
      {soundEnabled ? (
        // Volume ON Icon
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        // Volume OFF/Muted Icon
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
}
