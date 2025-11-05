import { useState, useEffect } from 'react';
import { Gig } from '@joch/shared';
import { gigService } from '@/services/gig.service';
import GigCard from '@/components/GigCard/GigCard';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './Live.module.scss';

type FilterType = 'all' | 'upcoming' | 'past';

/**
 * Live page - displays all gigs with filtering
 */
export default function Live() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('upcoming');

  useEffect(() => {
    loadGigs();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeFilter, gigs]);

  const loadGigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await gigService.getAll();
      // Sort by date descending (newest first)
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setGigs(sortedData);
    } catch (err) {
      console.error('Error loading gigs:', err);
      setError('Fehler beim Laden der Gigs');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    const now = new Date();

    switch (activeFilter) {
      case 'upcoming':
        setFilteredGigs(
          gigs.filter(
            (gig) =>
              gig.status === 'upcoming' && new Date(gig.date) >= now
          )
        );
        break;
      case 'past':
        setFilteredGigs(
          gigs.filter(
            (gig) =>
              gig.status === 'past' || new Date(gig.date) < now
          )
        );
        break;
      default:
        setFilteredGigs(gigs);
    }
  };

  const upcomingCount = gigs.filter(
    (gig) => gig.status === 'upcoming' && new Date(gig.date) >= new Date()
  ).length;
  const pastCount = gigs.filter(
    (gig) => gig.status === 'past' || new Date(gig.date) < new Date()
  ).length;

  return (
    <div className={styles.livePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Live</h1>
          <p className={styles.subtitle}>
            Unsere Shows – kraftvoll, ehrlich, intensiv
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.filters}>
            <button
              className={`${styles.filterButton} ${
                activeFilter === 'upcoming' ? styles.active : ''
              }`}
              onClick={() => setActiveFilter('upcoming')}
            >
              Upcoming
              {upcomingCount > 0 && (
                <span className={styles.count}>{upcomingCount}</span>
              )}
            </button>

            <button
              className={`${styles.filterButton} ${
                activeFilter === 'past' ? styles.active : ''
              }`}
              onClick={() => setActiveFilter('past')}
            >
              Vergangene Shows
              {pastCount > 0 && (
                <span className={styles.count}>{pastCount}</span>
              )}
            </button>

            <button
              className={`${styles.filterButton} ${
                activeFilter === 'all' ? styles.active : ''
              }`}
              onClick={() => setActiveFilter('all')}
            >
              Alle
              <span className={styles.count}>{gigs.length}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Gigs Section */}
      <section className={styles.gigsSection}>
        <div className="container">
          {isLoading ? (
            <LoadingSpinner size="large" centered message="Lade Gigs..." />
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={loadGigs} className={styles.retryButton}>
                Erneut versuchen
              </button>
            </div>
          ) : filteredGigs.length === 0 ? (
            <div className={styles.empty}>
              <svg
                className={styles.emptyIcon}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p>
                {activeFilter === 'upcoming'
                  ? 'Keine kommenden Gigs geplant. Schau bald wieder vorbei!'
                  : activeFilter === 'past'
                  ? 'Keine vergangenen Shows gefunden.'
                  : 'Keine Gigs gefunden.'}
              </p>
            </div>
          ) : (
            <div className={styles.gigsGrid}>
              {filteredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking CTA */}
      {activeFilter === 'upcoming' && (
        <section className={styles.bookingSection}>
          <div className="container">
            <div className={styles.bookingCta}>
              <h2 className={styles.bookingTitle}>
                Hol JOCH auf deine Bühne!
              </h2>
              <p className={styles.bookingText}>
                Du willst uns live erleben? Wir freuen uns auf deine
                Booking-Anfrage!
              </p>
              <a href="/contact" className={styles.bookingButton}>
                Booking-Anfrage
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}