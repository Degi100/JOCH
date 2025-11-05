import { Gig } from '@joch/shared';
import styles from './GigCard.module.scss';

/**
 * GigCard component props
 */
interface GigCardProps {
  /**
   * Gig data to display
   */
  gig: Gig;

  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * GigCard component displays a single gig with date, venue, and details
 *
 * @example
 * ```tsx
 * <GigCard gig={gigData} onClick={() => navigate(`/live/${gig._id}`)} />
 * ```
 */
export default function GigCard({ gig, onClick }: GigCardProps) {
  const gigDate = new Date(gig.date);
  const day = gigDate.getDate();
  const month = gigDate.toLocaleDateString('de-DE', { month: 'short' });
  const year = gigDate.getFullYear();
  const time = gig.time || gigDate.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isPast = gig.status === 'past';
  const isCancelled = gig.status === 'cancelled';

  const cardClasses = [
    styles.gigCard,
    isPast && styles.past,
    isCancelled && styles.cancelled,
    onClick && styles.clickable,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClasses} onClick={onClick}>
      {/* Date Badge */}
      <div className={styles.dateBadge}>
        <span className={styles.day}>{day}</span>
        <span className={styles.month}>{month}</span>
        <span className={styles.year}>{year}</span>
      </div>

      {/* Gig Info */}
      <div className={styles.gigInfo}>
        <h3 className={styles.venue}>{gig.venue}</h3>

        <div className={styles.location}>
          <svg
            className={styles.icon}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {gig.city || gig.location}
            {gig.country && gig.country !== 'DE' && `, ${gig.country}`}
          </span>
        </div>

        <div className={styles.time}>
          <svg
            className={styles.icon}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span>{time}</span>
        </div>

        {/* Status Badge */}
        {isCancelled && (
          <span className={styles.statusBadge}>Abgesagt</span>
        )}
        {isPast && !isCancelled && (
          <span className={styles.statusBadge}>Vergangen</span>
        )}

        {/* Description (if available) */}
        {gig.description && (
          <p className={styles.description}>{gig.description}</p>
        )}

        {/* Ticket Link */}
        {(gig.ticketUrl || gig.ticketLink) && !isPast && !isCancelled && (
          <a
            href={gig.ticketUrl || gig.ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ticketLink}
            onClick={(e) => e.stopPropagation()}
          >
            Tickets
            <svg
              className={styles.externalIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
