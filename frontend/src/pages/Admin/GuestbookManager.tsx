// ============================================
// JOCH Bandpage - Admin Guestbook Manager
// Interface for moderating guestbook entries
// ============================================

import { useState, useEffect } from 'react';
import { GuestbookEntry } from '@joch/shared';
import { guestbookService } from '@/services/guestbook.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import styles from './GuestbookManager.module.scss';

export default function GuestbookManager() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await guestbookService.getAllAdmin(token);
      setEntries(data);
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Fehler beim Laden der Einträge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du diesen Eintrag wirklich löschen?')) {
      return;
    }

    if (!token) {
      alert('Du musst eingeloggt sein um Einträge zu löschen');
      return;
    }

    try {
      setDeletingId(id);
      await guestbookService.delete(id, token);
      setEntries(entries.filter((e) => e._id !== id));
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Fehler beim Löschen des Eintrags');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.guestbookManager}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gästebuch verwalten</h1>
        <p className={styles.subtitle}>
          Gästebuch-Einträge moderieren und löschen
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner size="large" centered message="Lade Einträge..." />
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button onClick={loadEntries} variant="primary">
            Erneut versuchen
          </Button>
        </div>
      ) : entries.length === 0 ? (
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
          <p>Keine Gästebuch-Einträge vorhanden.</p>
        </div>
      ) : (
        <div className={styles.entriesList}>
          <div className={styles.listHeader}>
            <p>{entries.length} Einträge</p>
          </div>

          {entries.map((entry) => (
            <div key={entry._id} className={styles.entryCard}>
              <div className={styles.entryMain}>
                <div className={styles.entryInfo}>
                  <div className={styles.entryHeader}>
                    <strong className={styles.entryName}>{entry.name}</strong>
                    <span className={styles.entryDate}>
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  <div className={styles.entryEmail}>{entry.email}</div>
                  <div className={styles.entryMessage}>{entry.message}</div>
                </div>

                <div className={styles.entryActions}>
                  <Button
                    onClick={() => handleDelete(entry._id)}
                    variant="secondary"
                    disabled={deletingId === entry._id}
                  >
                    {deletingId === entry._id ? 'Löschen...' : 'Löschen'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
