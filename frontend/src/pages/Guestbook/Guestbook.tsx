import { useState, useEffect } from 'react';
import { GuestbookEntry, CreateGuestbookEntryDto } from '@joch/shared';
import { guestbookService } from '@/services/guestbook.service';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import Input from '@/components/Input/Input';
import TextArea from '@/components/TextArea/TextArea';
import Button from '@/components/Button/Button';
import styles from './Guestbook.module.scss';

/**
 * Guestbook page - Fan messages and entries
 */
export default function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateGuestbookEntryDto>({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await guestbookService.getAll();
      setEntries(data);
    } catch (err) {
      console.error('Error loading guestbook entries:', err);
      setError('Fehler beim Laden der Gästebuch-Einträge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsSubmitting(true);
      await guestbookService.create(formData);

      setSuccess('Dein Eintrag wurde erfolgreich erstellt! Danke! 🎸');
      setFormData({ name: '', email: '', message: '' });

      // Reload entries
      await loadEntries();
    } catch (err: any) {
      console.error('Error creating entry:', err);

      // Extract error message from ApiError or details array
      let errorMessage = 'Fehler beim Erstellen des Eintrags. Bitte versuche es erneut.';

      if (err?.message) {
        errorMessage = err.message;

        // If there are validation details, show the first one
        if (err?.details && Array.isArray(err.details) && err.details.length > 0) {
          errorMessage = err.details[0].message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.guestbookPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Gästebuch</h1>
          <p className={styles.subtitle}>
            Hinterlasse uns eine Nachricht – wir freuen uns über jedes Feedback!
          </p>
        </div>
      </section>

      {/* Content */}
      <section className={styles.content}>
        <div className="container">
          <div className={styles.layout}>
            {/* Entry Form */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Schreib uns</h2>

              <form onSubmit={handleSubmit} className={styles.form}>
                {success && (
                  <div className={styles.successMessage}>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>{success}</p>
                  </div>
                )}

                {error && (
                  <div className={styles.errorMessage}>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p>{error}</p>
                  </div>
                )}

                <Input
                  label="Name *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Dein Name"
                  disabled={isSubmitting}
                  required
                />

                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="deine@email.de"
                  disabled={isSubmitting}
                  required
                />

                <TextArea
                  label="Nachricht *"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Deine Nachricht an uns..."
                  rows={6}
                  disabled={isSubmitting}
                  maxLength={1000}
                  showCharCount
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  fullWidth
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Eintrag erstellen'}
                </Button>
              </form>
            </div>

            {/* Entries List */}
            <div className={styles.entriesSection}>
              <h2 className={styles.sectionTitle}>
                Einträge ({entries.length})
              </h2>

              {isLoading ? (
                <LoadingSpinner
                  size="large"
                  centered
                  message="Lade Einträge..."
                />
              ) : error && entries.length === 0 ? (
                <div className={styles.error}>
                  <p>{error}</p>
                  <button onClick={loadEntries} className={styles.retryButton}>
                    Erneut versuchen
                  </button>
                </div>
              ) : entries.length === 0 ? (
                <div className={styles.empty}>
                  <p>Noch keine Einträge vorhanden. Sei der Erste!</p>
                </div>
              ) : (
                <div className={styles.entriesList}>
                  {entries.map((entry) => (
                    <div key={entry._id} className={styles.entryCard}>
                      <div className={styles.entryHeader}>
                        <div className={styles.entryAuthor}>{entry.name}</div>
                        <div className={styles.entryDate}>
                          {formatDate(entry.createdAt)}
                        </div>
                      </div>
                      <div className={styles.entryMessage}>{entry.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
