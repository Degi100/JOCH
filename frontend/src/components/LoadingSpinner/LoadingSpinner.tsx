import styles from './LoadingSpinner.module.scss';

/**
 * LoadingSpinner component props
 */
interface LoadingSpinnerProps {
  /**
   * Size variant
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Center spinner in container
   * @default false
   */
  centered?: boolean;

  /**
   * Optional message to display below spinner
   */
  message?: string;
}

/**
 * LoadingSpinner component for loading states
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="large" centered message="Loading gigs..." />
 * ```
 */
export default function LoadingSpinner({
  size = 'medium',
  centered = false,
  message,
}: LoadingSpinnerProps) {
  const containerClasses = [
    styles.spinnerContainer,
    centered && styles.centered,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerClasses = [styles.spinner, styles[size]]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} role="status" aria-live="polite">
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
        <div className={styles.ring}></div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
      <span className="sr-only">Lädt...</span>
    </div>
  );
}