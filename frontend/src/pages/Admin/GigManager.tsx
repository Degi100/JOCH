// ============================================
// JOCH Bandpage - Admin Gig Manager
// CRUD Interface for managing gigs
// ============================================

import { useState, useEffect } from 'react';
import { Gig } from '@joch/shared';
import { gigService } from '@/services/gig.service';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button/Button';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import GigForm from './components/GigForm';
import styles from './GigManager.module.scss';

export default function GigManager() {
  const { token } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadGigs();
  }, []);

  const loadGigs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await gigService.getAll();
      // Sort by date descending (newest first)
      const sortedData = data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setGigs(sortedData);
    } catch (err) {
      console.error('Error loading gigs:', err);
      setError('Fehler beim Laden der Gigs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGig(null);
    setIsFormOpen(true);
  };

  const handleEdit = (gig: Gig) => {
    setEditingGig(gig);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du diesen Gig wirklich löschen?')) {
      return;
    }

    if (!token) {
      alert('Du musst eingeloggt sein um Gigs zu löschen');
      return;
    }

    try {
      setDeletingId(id);
      await gigService.delete(id, token);
      setGigs(gigs.filter((g) => g._id !== id));
    } catch (err) {
      console.error('Error deleting gig:', err);
      alert('Fehler beim Löschen des Gigs');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setEditingGig(null);
    await loadGigs();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingGig(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      upcoming: { label: 'Anstehend', className: styles.statusUpcoming },
      past: { label: 'Vergangen', className: styles.statusPast },
      cancelled: { label: 'Abgesagt', className: styles.statusCancelled },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: styles.statusDefault,
    };

    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className={styles.gigManagerPage}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Gigs verwalten</h1>
              <p className={styles.subtitle}>
                Alle Konzerte und Shows organisieren
              </p>
            </div>
            <Button variant="primary" onClick={handleCreate}>
              + Neuer Gig
            </Button>
          </div>
        </header>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner size="large" centered message="Lade Gigs..." />
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <Button variant="secondary" onClick={loadGigs}>
              Erneut versuchen
            </Button>
          </div>
        ) : gigs.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🎸</div>
            <h2 className={styles.emptyTitle}>Noch keine Gigs</h2>
            <p className={styles.emptyText}>
              Erstelle deinen ersten Gig und teile ihn mit deinen Fans!
            </p>
            <Button variant="primary" onClick={handleCreate}>
              + Ersten Gig erstellen
            </Button>
          </div>
        ) : (
          <div className={styles.gigsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.headerCell}>Datum</div>
              <div className={styles.headerCell}>Event</div>
              <div className={styles.headerCell}>Location</div>
              <div className={styles.headerCell}>Status</div>
              <div className={styles.headerCell}>Aktionen</div>
            </div>

            <div className={styles.tableBody}>
              {gigs.map((gig) => (
                <div key={gig._id} className={styles.tableRow}>
                  <div className={styles.cell}>
                    <div className={styles.dateCell}>
                      <span className={styles.date}>{formatDate(gig.date.toString())}</span>
                      <span className={styles.time}>{formatTime(gig.date.toString())}</span>
                    </div>
                  </div>

                  <div className={styles.cell}>
                    <div className={styles.eventCell}>
                      <span className={styles.eventName}>{gig.title}</span>
                      {gig.description && (
                        <span className={styles.eventDesc}>
                          {gig.description.substring(0, 60)}
                          {gig.description.length > 60 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.cell}>
                    <div className={styles.locationCell}>
                      <span className={styles.venueName}>{gig.venue}</span>
                      <span className={styles.venueCity}>{gig.city}</span>
                    </div>
                  </div>

                  <div className={styles.cell}>{getStatusBadge(gig.status)}</div>

                  <div className={styles.cell}>
                    <div className={styles.actions}>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleEdit(gig)}
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleDelete(gig._id!)}
                        isLoading={deletingId === gig._id}
                        disabled={deletingId === gig._id}
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <GigForm
          gig={editingGig}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}