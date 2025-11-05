import { useState, useEffect } from 'react';
import { BandMember } from '@joch/shared';
import { bandMemberService } from '@/services/bandMember.service';
import BandMemberCard from '@/components/BandMemberCard/BandMemberCard';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './Band.module.scss';

/**
 * Band page - displays band story and members
 */
export default function Band() {
  const [members, setMembers] = useState<BandMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBandMembers();
  }, []);

  const loadBandMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bandMemberService.getAll();
      setMembers(data);
    } catch (err) {
      console.error('Error loading band members:', err);
      setError('Fehler beim Laden der Bandmitglieder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.bandPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Die Band</h1>
          <p className={styles.subtitle}>
            Drei Menschen. Eine Mission. Ehrliche Musik.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.storySection}>
        <div className="container">
          <div className={styles.story}>
            <h2 className={styles.sectionTitle}>Unsere Geschichte</h2>

            <div className={styles.storyContent}>
              <p>
                JOCH entstand 2022 in Bremen-Nord aus dem Wunsch heraus,
                ehrliche Musik zu machen – ohne Filter, ohne Kompromisse. Drei
                Musiker mit unterschiedlichen Backgrounds, aber einer
                gemeinsamen Vision: Deutschrock mit Metal-Elementen, der nicht
                nur laut ist, sondern auch etwas zu sagen hat.
              </p>

              <p>
                Unsere Texte sind sozialkritisch, direkt und authentisch. Wir
                singen über das echte Leben – mal wütend, mal nachdenklich, mal
                laut, mal leise. Inspiriert von der rauen Industrieatmosphäre
                unserer Heimat Bremen-Nord, verbinden wir kraftvolle Riffs mit
                Texten, die unter die Haut gehen.
              </p>

              <p>
                Seit unserer Gründung haben wir uns zu einer festen Größe in
                der norddeutschen Rock-Szene entwickelt. Unsere Live-Shows sind
                bekannt für ihre intensive Energie und Bühnenpräsenz – was auf
                unseren Platten wichtig ist, wird auf der Bühne noch
                kraftvoller.
              </p>

              <blockquote className={styles.quote}>
                "Ehrliche Musik. Kraftvolle Texte. Authentische
                Bühnenpräsenz. Vom echten Leben inspiriert – mal laut, mal
                leise, mal wütend, mal nachdenklich. Sozialkritisch. Direkt.
                Ohne Filter."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Band Members Section */}
      <section className={styles.membersSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Die Crew</h2>

          {isLoading ? (
            <LoadingSpinner
              size="large"
              centered
              message="Lade Bandmitglieder..."
            />
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={loadBandMembers} className={styles.retryButton}>
                Erneut versuchen
              </button>
            </div>
          ) : members.length === 0 ? (
            <div className={styles.empty}>
              <p>Keine Bandmitglieder gefunden.</p>
            </div>
          ) : (
            <div className={styles.membersGrid}>
              {members.map((member) => (
                <BandMemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section className={styles.locationSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Heimat: Bremen-Nord</h2>
          <div className={styles.locationContent}>
            <p>
              Bremen-Nord ist mehr als nur unsere Heimat – es ist Teil unserer
              DNA. Die industrielle Vergangenheit, der raue Charme der
              Hafenstadt und die ehrlichen Menschen hier prägen unsere Musik
              und unsere Texte.
            </p>
            <p>
              Von den Werften bis zu den kleinen Clubs in Vegesack – diese
              Region hat uns geformt und inspiriert uns jeden Tag aufs Neue.
              Unser Sound ist Bremen-Nord: kantig, ehrlich, kraftvoll.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}