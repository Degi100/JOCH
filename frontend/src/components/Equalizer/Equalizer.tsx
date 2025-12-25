// ============================================
// JOCH Bandpage - Equalizer Animation Component
// Animated bars that react to music playing
// ============================================

import styles from './Equalizer.module.scss';

interface EqualizerProps {
  isPlaying: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'white' | 'red' | 'gradient';
}

/**
 * Animated equalizer bars component
 * Shows animated bars when music is playing
 */
export default function Equalizer({
  isPlaying,
  size = 'small',
  color = 'white'
}: EqualizerProps) {
  return (
    <div
      className={`${styles.equalizer} ${styles[size]} ${styles[color]} ${isPlaying ? styles.playing : ''}`}
      aria-hidden="true"
    >
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </div>
  );
}
